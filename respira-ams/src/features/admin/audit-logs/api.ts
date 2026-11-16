import { apiRequest, ApiError, buildQuery } from "@/lib/api";
import { API_V1, CLIENT_API_BASE } from "@/lib/api-base";
import {
	AuditLogItem,
	AuditLogStats,
	AuditServiceType,
	AuditActionCategory,
	AuditLogStatus,
	ClinicalRollbackPreview,
	ClinicalRollbackResult,
} from "./types";

export interface BackendAuditLogEntry {
	id: string;
	occurredAt: string;
	actorAccountId: string | null;
	actorRole: string;
	action: string;
	entityType: string;
	entityId: string | null;
	correlationId: string | null;
	detailsJson: string;
}

export interface BackendAuditLogPagination {
	metadata: {
		currentPage: number;
		pageSize: number;
		totalItemCount: number;
		pageCount: number;
		hasPreviousPage: boolean;
		hasNextPage: boolean;
	};
	items: BackendAuditLogEntry[];
}

type AuditDetails = Record<string, unknown>;

function parseDetails(rawJson: string): AuditDetails {
	if (!rawJson) return {};
	try {
		const parsed = typeof rawJson === "string" ? JSON.parse(rawJson) : rawJson;
		return (parsed ?? {}) as AuditDetails;
	} catch {
		return {};
	}
}

function mapService(action: string, entityType: string): AuditServiceType {
	if (action.startsWith("Clinical.") || entityType.includes("Clinical")) return "Clinical";
	if (action.startsWith("Authentication.") || action.startsWith("Auth.") || entityType === "Account") return "Auth";
	if (action.startsWith("Doctor.") || entityType === "Doctor") return "Doctor";
	if (action.startsWith("Patient.") || entityType.includes("Patient")) return "Patient";
	if (action.startsWith("Analysis.") || entityType.includes("Analysis")) return "Clinical";
	if (action.startsWith("Media.") || entityType.includes("Media")) return "Media";
	if (action.startsWith("Saga.")) return "Saga";
	return "Gateway";
}

function mapCategory(service: AuditServiceType, action: string): AuditActionCategory {
	switch (service) {
		case "Clinical":
			return action.includes("Amr") || action.includes("Antibiotic") ? "AMR" : "Protocol";
		case "Auth":
			return "Auth";
		case "Doctor":
			return "Profile";
		case "Patient":
			return "Patient";
		case "Media":
			return "Media";
		case "Saga":
			return "Profile";
		default:
			return "System";
	}
}

function mapStatus(action: string, details: AuditDetails): AuditLogStatus {
	const rawStatus = String(details.status ?? details.Status ?? "").toLowerCase();
	if (rawStatus.includes("fail") || rawStatus.includes("error")) {
		return "error";
	}
	if (rawStatus.includes("warn")) {
		return "warning";
	}
	if (rawStatus.includes("success") || rawStatus === "ok" || rawStatus === "succeeded") {
		return "success";
	}

	const lower = action.toLowerCase();
	if (lower.includes("failed") || details.reason === "invalid_credentials" || details.error) {
		return "error";
	}
	if (lower.includes("softdeleted") || lower.includes("deleted") || details.warning) {
		return "warning";
	}
	return "success";
}

function mapActor(
	entry: BackendAuditLogEntry,
	actorEmails: Map<string, string>
): { actor: string; actorName: string; role: string } {
	const role = entry.actorRole || "System";
	const knownEmail = entry.actorAccountId ? actorEmails.get(entry.actorAccountId) : undefined;

	const actor = knownEmail ?? (entry.actorAccountId ? `ID ${entry.actorAccountId.slice(0, 8)}…` : "");

	return { actor, actorName: role, role };
}

function mapTarget(entry: BackendAuditLogEntry, details: AuditDetails): string {
	if (details.requestPath) {
		return `${details.requestPath}`;
	}
	const entityName = entry.entityType.split(".").pop() || entry.entityType || "Entity";
	if (entry.entityId) {
		return `${entityName} [${entry.entityId.slice(0, 8)}...]`;
	}
	return entityName;
}

export function transformBackendEntryToAuditLogItem(
	entry: BackendAuditLogEntry,
	actorEmails: Map<string, string> = new Map()
): AuditLogItem {
	const details = parseDetails(entry.detailsJson);
	const service = mapService(entry.action, entry.entityType);
	const category = mapCategory(service, entry.action);
	const status = mapStatus(entry.action, details);
	const { actor, actorName, role } = mapActor(entry, actorEmails);
	const target = mapTarget(entry, details);

	const requestPayload: Record<string, unknown> | undefined =
		Object.keys(details).length > 0 ? details : undefined;

	return {
		id: entry.id,
		timestamp: entry.occurredAt,
		actor,
		actorName,
		role,
		action: entry.action,
		rawAction: entry.action,
		category,
		target,
		service,
		status,
		correlationId: entry.correlationId || String(details.traceId ?? "—"),
		requestPayload,
		errorMessage:
			status === "error"
				? String(details.reason ?? "Lỗi xử lý sự kiện kiểm toán")
				: undefined,
	};
}

/**
 * Lấy danh sách nhật ký kiểm toán từ API Backend thực tế với tìm kiếm, lọc và phân trang
 */
const ACTOR_DIRECTORY_TTL_MS = 60_000;

function timeRangeToFrom(timeRange?: string): string | undefined {
	if (!timeRange || timeRange === "ALL") return undefined;

	if (timeRange === "today") {
		const startOfDay = new Date();
		startOfDay.setHours(0, 0, 0, 0);
		return startOfDay.toISOString();
	}
	if (timeRange === "24h") return new Date(Date.now() - 24 * 3600 * 1000).toISOString();
	if (timeRange === "7d") return new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
	if (timeRange === "30d") return new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
	return undefined;
}

let actorDirectoryCache: { at: number; map: Map<string, string> } | null = null;

async function loadActorEmails(): Promise<Map<string, string>> {
	if (actorDirectoryCache && Date.now() - actorDirectoryCache.at < ACTOR_DIRECTORY_TTL_MS) {
		return actorDirectoryCache.map;
	}

	const map = new Map<string, string>();
	try {
		const res = await apiRequest<{ items?: Array<{ id: string; email: string }> }>(
			`/auth/accounts${buildQuery({ Page: 1, Size: 100 })}`
		);
		for (const account of res?.items ?? []) {
			if (account.id && account.email) map.set(account.id, account.email);
		}
	} catch (error) {
		console.warn("[AuditLogsAPI] Could not load actor directory:", error);
	}

	actorDirectoryCache = { at: Date.now(), map };
	return map;
}

async function fetchAuditPage(
	page: number,
	pageSize: number,
	from?: string
): Promise<BackendAuditLogPagination | null> {
	return apiRequest<BackendAuditLogPagination>(
		`/audit-logs${buildQuery({ page, pageSize, from })}`
	);
}

function buildStats(items: AuditLogItem[], total: number): AuditLogStats {
	const successCount = items.filter((item) => item.status === "success").length;
	const warningCount = items.filter((item) => item.status === "warning").length;
	const errorCount = items.filter((item) => item.status === "error").length;
	const uniqueActors = new Set(items.map((item) => item.actor)).size;

	return {
		total,
		successCount,
		warningCount,
		errorCount,
		uniqueActorsCount: uniqueActors,
		successRatePercent:
			items.length > 0 ? Math.round((successCount / items.length) * 100) : 100,
	};
}

/**
 * Lấy một trang audit log. Chỉ tải đúng trang người dùng đang xem.
 */
export async function fetchAuditLogs(
	page: number = 1,
	pageSize: number = 10,
	timeRange?: string
): Promise<{ items: AuditLogItem[]; total: number; stats: AuditLogStats }> {
	const from = timeRangeToFrom(timeRange);
	const res = await fetchAuditPage(page, pageSize, from);
	const actorEmails = await loadActorEmails();
	const items = (res?.items ?? []).map((entry) =>
		transformBackendEntryToAuditLogItem(entry, actorEmails)
	);
	const total = res?.metadata?.totalItemCount ?? items.length;

	return {
		items,
		total,
		stats: buildStats(items, total),
	};
}

/**
 * Clinical audit rollback endpoints return the payload directly (no Result envelope),
 * so they cannot go through apiRequest(), which unwraps `data`.
 */
async function clinicalRollbackRequest<T>(path: string): Promise<T> {
	const base = typeof window !== "undefined" ? CLIENT_API_BASE : API_V1;

	let response: Response;
	try {
		response = await fetch(`${base}${path}`, {
			method: "POST",
			headers: { Accept: "application/json" },
			signal: AbortSignal.timeout(30000),
		});
	} catch {
		throw new Error("Không thể kết nối tới máy chủ.");
	}

	const text = await response.text();
	let payload: unknown = null;
	if (text) {
		try {
			payload = JSON.parse(text);
		} catch {
			payload = text;
		}
	}

	if (!response.ok) {
		if (response.status === 409) {
			throw new ApiError(
				"Dữ liệu đã thay đổi và phát sinh xung đột. Vui lòng tải lại bản xem trước.",
				409,
				payload
			);
		}

		const errorPayload = payload as
			| { error?: { description?: string }; title?: string; message?: string }
			| null;
		const message =
			errorPayload?.error?.description ??
			errorPayload?.title ??
			errorPayload?.message ??
			(response.status === 404
				? "Không tìm thấy sự kiện kiểm toán lâm sàng tương ứng."
				: `Yêu cầu thất bại (${response.status}).`);

		throw new ApiError(message, response.status, payload);
	}

	return payload as T;
}

/**
 * Xem trước thay đổi khi hoàn tác dữ liệu lâm sàng (Clinical Rollback Preview)
 */
export async function previewClinicalRollback(
	auditLogId: string
): Promise<ClinicalRollbackPreview> {
	try {
		return await clinicalRollbackRequest<ClinicalRollbackPreview>(
			`/clinical/audit-logs/${auditLogId}/rollback/preview`
		);
	} catch (err: unknown) {
		console.warn("[Rollback] Backend preview failed:", err);
		throw err instanceof Error
			? err
			: new Error("Không thể tạo bản xem trước hoàn tác cho sự kiện này.");
	}
}

/**
 * Thực thi hoàn tác dữ liệu lâm sàng (Apply Clinical Rollback)
 */
export async function applyClinicalRollback(
	auditLogId: string
): Promise<ClinicalRollbackResult> {
	try {
		return await clinicalRollbackRequest<ClinicalRollbackResult>(
			`/clinical/audit-logs/${auditLogId}/rollback`
		);
	} catch (err: unknown) {
		console.warn("[Rollback] Backend apply failed:", err);
		throw err instanceof Error
			? err
			: new Error("Không thể thực hiện hoàn tác dữ liệu lâm sàng trên máy chủ.");
	}
}
