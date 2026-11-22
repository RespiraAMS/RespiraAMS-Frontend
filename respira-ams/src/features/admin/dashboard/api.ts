import { apiRequest } from "@/lib/api";
import { fetchAuditLogs } from "@/features/admin/audit-logs/api";
import { DashboardMetrics, MicroserviceStatus, AuditLogItem } from "./types";

interface PaginationMeta {
	totalItemCount?: number;
	pageCount?: number;
	currentPage?: number;
	pageSize?: number;
}

interface GenericPaginationResult<T> {
	metadata?: PaginationMeta;
	totalRecords?: number;
	totalCount?: number;
	items?: T[];
}

function readTotal<T>(result: GenericPaginationResult<T> | null | undefined): number {
	if (!result) return 0;
	return (
		result.metadata?.totalItemCount ??
		result.totalRecords ??
		result.totalCount ??
		(Array.isArray(result.items) ? result.items.length : 0)
	);
}

async function checkServiceLatency(
	path: string
): Promise<{ isUp: boolean; latencyMs: number }> {
	const start = performance.now();
	try {
		await apiRequest(path, {
			method: "GET",
			signal: AbortSignal.timeout(4000),
		});
		const duration = Math.round(performance.now() - start);
		return { isUp: true, latencyMs: Math.max(1, duration) };
	} catch (e: unknown) {
		const duration = Math.round(performance.now() - start);
		// Nếu phản hồi mã HTTP từ Gateway / Microservice (kể cả 400, 401, 403, 404), dịch vụ vẫn đang hoạt động
		const status = (e as { status?: number })?.status;
		if (typeof status === "number" && status > 0 && status < 500) {
			return { isUp: true, latencyMs: Math.max(1, duration) };
		}
		return { isUp: false, latencyMs: 0 };
	}
}

/**
 * Lấy dữ liệu tổng hợp metrics từ các endpoints mà Admin được phép truy cập.
 * Không gọi API clinical vì backend chặn role Admin ở Clinical service.
 * Số lượng dịch vụ được view tính từ kết quả ping thực tế, không hardcode.
 */
export async function fetchAdminDashboardMetrics(): Promise<DashboardMetrics> {
	const [accountsRes, doctorsRes, auditRes] = await Promise.allSettled([
		apiRequest<GenericPaginationResult<unknown>>("/auth/accounts?Page=1&Size=1"),
		apiRequest<GenericPaginationResult<unknown>>("/doctors?page=1&size=1"),
		apiRequest<GenericPaginationResult<unknown>>("/audit-logs?page=1&pageSize=1"),
	]);

	return {
		totalUsers: accountsRes.status === "fulfilled" ? readTotal(accountsRes.value) : 0,
		totalDoctors: doctorsRes.status === "fulfilled" ? readTotal(doctorsRes.value) : 0,
		totalAuditEvents: auditRes.status === "fulfilled" ? readTotal(auditRes.value) : 0,
		activeServicesCount: 0,
		totalServicesCount: 0,
	};
}

/**
 * Lấy trạng thái sức khỏe và độ trễ thực tế của từng microservice qua Gateway.
 * Không suy diễn uptime/version: chỉ trả những gì đo được.
 */
export async function fetchMicroservicesStatus(): Promise<MicroserviceStatus[]> {
	const [gwPing, authPing, clinicalPing, patientPing, doctorPing, sagaPing, mediaPing] =
		await Promise.allSettled([
			checkServiceLatency("/auth/accounts?Page=1&Size=1"),
			checkServiceLatency("/auth/email-verification"),
			checkServiceLatency("/clinical/audit-logs?page=1&pageSize=1"),
			checkServiceLatency("/patients?page=1&size=1"),
			checkServiceLatency("/doctors?page=1&size=1"),
			checkServiceLatency("/audit-logs?page=1&size=1"),
			checkServiceLatency("/media/health"),
		]);

	const readPing = (
		res: PromiseSettledResult<{ isUp: boolean; latencyMs: number }>
	): { status: "operational" | "down"; latencyMs: number } => {
		if (res.status === "fulfilled") {
			return {
				status: res.value.isUp ? "operational" : "down",
				latencyMs: res.value.isUp ? res.value.latencyMs : 0,
			};
		}
		return { status: "down", latencyMs: 0 };
	};

	const services: Array<{ id: string; name: string; service: string; ping: typeof gwPing }> = [
		{ id: "gateway", name: "API Gateway", service: "Respira.Gateway", ping: gwPing },
		{
			id: "auth",
			name: "Authentication Service",
			service: "Respira.Authentication",
			ping: authPing,
		},
		{
			id: "clinical",
			name: "Clinical Knowledge Service",
			service: "Respira.Clinical",
			ping: clinicalPing,
		},
		{
			id: "patient",
			name: "Patient EMR Service",
			service: "Respira.Patient",
			ping: patientPing,
		},
		{ id: "doctor", name: "Doctor Staff Service", service: "Respira.Doctor", ping: doctorPing },
		{ id: "saga", name: "Profile Saga Orchestrator", service: "Respira.Saga", ping: sagaPing },
		{ id: "media", name: "Media Assets Service", service: "Respira.Media", ping: mediaPing },
	];

	return services.map(({ id, name, service, ping }) => {
		const result = readPing(ping);
		return {
			id,
			name,
			service,
			status: result.status,
			latencyMs: result.latencyMs,
		};
	});
}

/**
 * Lấy danh sách nhật ký kiểm toán gần nhất từ hệ thống audit log thật.
 * Timestamp và action giữ nguyên dạng gốc để component dịch theo locale.
 */
export async function fetchRecentAuditLogs(): Promise<AuditLogItem[]> {
	try {
		const res = await fetchAuditLogs(1, 5);
		if (res?.items && res.items.length > 0) {
			return res.items.map((log) => ({
				id: log.id,
				timestamp: log.timestamp,
				actor: log.actor,
				role: log.role,
				action: log.action,
				target: log.target,
				service: log.service,
				status: log.status,
			}));
		}
	} catch (e) {
		console.warn("[DashboardAPI] Failed to load recent audit logs:", e);
	}
	return [];
}
