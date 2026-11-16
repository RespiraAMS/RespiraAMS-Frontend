import { apiRequest } from "@/lib/api";
import { getStoredAccessToken } from "@/features/auth/api";
import {
	RegulationReviewItem,
	CreateRegulationReviewPayload,
	UpdateRegulationReviewPayload,
	RegulationReviewStats,
	RegulationReviewFilters,
} from "./types";

const RECENT_REVIEWERS_KEY = "respira_recent_reviewers";
const RECENT_DELETED_KEY = "respira_recent_deleted_reviewers";

export function getRecentReviewers(): RegulationReviewItem[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = sessionStorage.getItem(RECENT_REVIEWERS_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

export function saveRecentReviewer(item: RegulationReviewItem): void {
	if (typeof window === "undefined") return;
	try {
		const list = getRecentReviewers().filter((i) => i.id !== item.id && i.email.toLowerCase() !== item.email.toLowerCase());
		list.unshift(item);
		sessionStorage.setItem(RECENT_REVIEWERS_KEY, JSON.stringify(list));
	} catch {}
}

export function updateRecentReviewer(item: Partial<RegulationReviewItem> & { id: string }): void {
	if (typeof window === "undefined") return;
	try {
		const list = getRecentReviewers();
		const idx = list.findIndex((i) => i.id === item.id);
		if (idx >= 0) {
			list[idx] = { ...list[idx], ...item };
		} else {
			list.push(item as RegulationReviewItem);
		}
		sessionStorage.setItem(RECENT_REVIEWERS_KEY, JSON.stringify(list));
	} catch {}
}

export function getRecentDeleted(): string[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = sessionStorage.getItem(RECENT_DELETED_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

export function markRecentDeleted(accountId: string): void {
	if (typeof window === "undefined") return;
	try {
		const list = getRecentDeleted().filter((id) => id !== accountId);
		list.push(accountId);
		sessionStorage.setItem(RECENT_DELETED_KEY, JSON.stringify(list));
		// Xóa khỏi recent list nếu có
		const recents = getRecentReviewers().filter((i) => i.id !== accountId);
		sessionStorage.setItem(RECENT_REVIEWERS_KEY, JSON.stringify(recents));
	} catch {}
}

/**
 * Lấy danh sách tài khoản Hội đồng thẩm định từ /api/v1/auth/accounts
 */
export async function fetchRegulationReviews(
	page: number = 1,
	pageSize: number = 50,
	filters?: RegulationReviewFilters
): Promise<{ items: RegulationReviewItem[]; total: number; stats: RegulationReviewStats }> {
	const res = await apiRequest<{
		metadata?: { totalItemCount?: number; totalCount?: number };
		items?: RegulationReviewItem[];
	}>("/auth/accounts?Role=MedicalRegulationReviewer&Page=1&Size=100");

	let allItems: RegulationReviewItem[] = res?.items || [];
	allItems = allItems.filter(
		(i) =>
			(i.role === "MedicalRegulationReviewer" || String(i.role).toLowerCase().includes("reviewer")) &&
			!i.isDeleted
	);

	// Lọc bỏ tài khoản vừa xóa (tránh trường hợp Redis backend cache 2 phút trả về tài khoản cũ)
	const recentDeleted = getRecentDeleted();
	if (recentDeleted.length > 0) {
		allItems = allItems.filter((i) => !recentDeleted.includes(i.id));
	}

	// Tự động áp dụng cập nhật mới nhất hoặc gộp tài khoản mới (chống stale cache Redis 2 phút từ backend)
	const recentCreated = getRecentReviewers();
	for (const recent of recentCreated) {
		const idx = allItems.findIndex(
			(i) => i.id === recent.id || i.email.toLowerCase() === recent.email.toLowerCase()
		);
		if (idx >= 0) {
			allItems[idx] = { ...allItems[idx], ...recent };
		} else {
			allItems.unshift(recent);
		}
	}

	const stats: RegulationReviewStats = {
		total: allItems.length,
		active: allItems.filter((i) => i.status === "Active").length,
		inactive: allItems.filter((i) => i.status === "Inactive").length,
		emailConfirmed: allItems.filter((i) => i.isEmailConfirmed).length,
	};

	let filtered = [...allItems];

	if (filters?.search && filters.search.trim()) {
		const q = filters.search.trim().toLowerCase();
		filtered = filtered.filter(
			(i) =>
				i.email.toLowerCase().includes(q) ||
				(i.phone && i.phone.toLowerCase().includes(q)) ||
				i.id.toLowerCase().includes(q)
		);
	}

	if (filters?.status && filters.status !== "ALL") {
		filtered = filtered.filter((i) => i.status === filters.status);
	}

	const startIndex = (page - 1) * pageSize;
	const items = filtered.slice(startIndex, startIndex + pageSize);

	return {
		items,
		total: filtered.length,
		stats,
	};
}

/**
 * Tạo tài khoản thành viên Hội đồng thẩm định qua Saga /api/v1/profile/create
 */
export async function createRegulationReview(
	payload: CreateRegulationReviewPayload
): Promise<string> {
	let backendSagaId: string | null = null;
	const token =
		typeof window !== "undefined"
			? getStoredAccessToken() ||
			  localStorage.getItem("accessToken") ||
			  localStorage.getItem("respira_auth_token_v1")
			: null;
	const API_BASE = (
		process.env.NEXT_PUBLIC_API_URL || "https://localhost:7283/api/v1"
	).replace(/\/$/, "");

	const formData = new FormData();
	const requestBody = {
		email: payload.email,
		password: payload.password,
		phone: payload.phone,
		role: "MedicalRegulationReviewer",
	};

	formData.append("request", JSON.stringify(requestBody));

	const createUrl =
		typeof window !== "undefined"
			? "/api/backend/profile/create"
			: `${API_BASE}/profile/create`;
	const res = await fetch(createUrl, {
		method: "POST",
		headers: {
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			"X-Role": "Admin",
		},
		body: formData,
	});

	if (!res.ok) {
		const errPayload = await res.json().catch(() => null);
		const errMsg =
			errPayload?.error?.description ||
			errPayload?.error?.message ||
			errPayload?.message ||
			errPayload?.title ||
			`Không thể tạo tài khoản Hội đồng thẩm định (Mã lỗi ${res.status})`;
		throw new Error(errMsg);
	}

	const json = await res.json().catch(() => null);
	backendSagaId = json?.data || json?.id;

	// Kiểm tra trạng thái Saga thực tế trong DB: Nếu trùng mail/phone thì Saga sẽ ghi failureReason
	if (backendSagaId) {
		let isFailed = false;
		let failureMsg = "";

		for (let i = 0; i < 4; i++) {
			await new Promise((resolve) => setTimeout(resolve, 300));
			try {
				const statusUrl =
					typeof window !== "undefined"
						? `/api/backend/profile/create/${backendSagaId}`
						: `${API_BASE}/profile/create/${backendSagaId}`;
				const sRes = await fetch(statusUrl, {
					headers: {
						...(token ? { Authorization: `Bearer ${token}` } : {}),
						"X-Role": "Admin",
					},
				});
				if (sRes.ok) {
					const sJson = await sRes.json().catch(() => null);
					const sagaData = sJson?.data;
					if (sagaData?.failureReason) {
						isFailed = true;
						failureMsg = sagaData.failureReason;
						break;
					}
				}
			} catch {}
		}

		if (isFailed) {
			let friendlyError = "Tạo thành viên thất bại do dữ liệu bị trùng lặp trong hệ thống.";
			const lower = failureMsg.toLowerCase();
			if (lower.includes("email")) {
				friendlyError = "Email này đã tồn tại trong hệ thống. Vui lòng sử dụng email khác.";
			} else if (lower.includes("phone")) {
				friendlyError = "Số điện thoại này đã tồn tại trong hệ thống. Vui lòng nhập số khác.";
			}
			throw new Error(friendlyError);
		}
	}

	return backendSagaId || `rev-${Date.now()}`;
}

/**
 * Cập nhật thông tin thành viên Hội đồng thẩm định qua API /api/v1/profile/update
 */
export async function updateRegulationReview(
	payload: UpdateRegulationReviewPayload
): Promise<{ sagaId: string; item: RegulationReviewItem }> {
	let backendSagaId: string | null = null;
	const token =
		typeof window !== "undefined"
			? getStoredAccessToken() ||
			  localStorage.getItem("accessToken") ||
			  localStorage.getItem("respira_auth_token_v1")
			: null;
	const API_BASE = (
		process.env.NEXT_PUBLIC_API_URL || "https://localhost:7283/api/v1"
	).replace(/\/$/, "");

	const formData = new FormData();
	const requestBody = {
		accountId: payload.accountId,
		doctorId: "00000000-0000-0000-0000-000000000000",
		email: payload.email,
		phone: payload.phone,
		password: payload.password || undefined,
		status: payload.status || undefined,
	};

	formData.append("request", JSON.stringify(requestBody));

	const updateUrl =
		typeof window !== "undefined"
			? "/api/backend/profile/update"
			: `${API_BASE}/profile/update`;

	const res = await fetch(updateUrl, {
		method: "POST",
		headers: {
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			"X-Role": "Admin",
		},
		body: formData,
	});

	if (!res.ok) {
		const errPayload = await res.json().catch(() => null);
		const errMsg =
			errPayload?.error?.description ||
			errPayload?.error?.message ||
			errPayload?.message ||
			errPayload?.title ||
			`Không thể cập nhật hồ sơ Hội đồng thẩm định (Mã lỗi ${res.status})`;
		throw new Error(errMsg);
	}

	const json = await res.json().catch(() => null);
	backendSagaId = json?.data || json?.id;

	// Kiểm tra trạng thái Saga thực tế trong DB: Nếu trùng mail/phone thì Saga sẽ ghi failureReason
	if (backendSagaId) {
		let isFailed = false;
		let failureMsg = "";

		for (let i = 0; i < 4; i++) {
			await new Promise((resolve) => setTimeout(resolve, 300));
			try {
				const statusUrl =
					typeof window !== "undefined"
						? `/api/backend/profile/update/${backendSagaId}`
						: `${API_BASE}/profile/update/${backendSagaId}`;
				const sRes = await fetch(statusUrl, {
					headers: {
						...(token ? { Authorization: `Bearer ${token}` } : {}),
						"X-Role": "Admin",
					},
				});
				if (sRes.ok) {
					const sJson = await sRes.json().catch(() => null);
					const sagaData = sJson?.data;
					if (sagaData?.failureReason) {
						isFailed = true;
						failureMsg = sagaData.failureReason;
						break;
					}
				} else if (sRes.status === 404) {
					// Saga đã hoàn thành thành công và được Wolverine tự động dọn dẹp
					break;
				}
			} catch {}
		}

		if (isFailed) {
			let friendlyError = "Cập nhật thành viên thất bại do dữ liệu bị trùng lặp trong hệ thống.";
			const lower = failureMsg.toLowerCase();
			if (lower.includes("email")) {
				friendlyError = "Email này đã tồn tại trong hệ thống. Vui lòng sử dụng email khác.";
			} else if (lower.includes("phone")) {
				friendlyError = "Số điện thoại này đã tồn tại trong hệ thống. Vui lòng nhập số khác.";
			}
			throw new Error(friendlyError);
		}
	}

	const updatedItem: RegulationReviewItem = {
		id: payload.accountId,
		email: payload.email,
		phone: payload.phone,
		role: "MedicalRegulationReviewer",
		status: payload.status || "Active",
		isEmailConfirmed: true,
		isDeleted: false,
	};

	// Cập nhật override vào sessionStorage để chống độ trễ Redis cache
	updateRecentReviewer(updatedItem);

	return {
		sagaId: backendSagaId || `saga-update-${Date.now()}`,
		item: updatedItem,
	};
}

/**
 * Xóa tài khoản thành viên Hội đồng thẩm định qua API /api/v1/profile/delete
 */
export async function deleteRegulationReview(
	accountId: string
): Promise<string> {
	const token = typeof window !== "undefined" ? getStoredAccessToken() || localStorage.getItem("accessToken") : null;
	const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://localhost:7283/api/v1").replace(/\/$/, "");

	const deleteUrl = typeof window !== "undefined" ? "/api/backend/profile/delete" : `${API_BASE}/profile/delete`;
	const res = await fetch(deleteUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			"X-Role": "Admin",
		},
		body: JSON.stringify({
			accountId,
			doctorId: "00000000-0000-0000-0000-000000000000",
			mediaId: "00000000-0000-0000-0000-000000000000",
		}),
	});

	if (!res.ok) {
		const errPayload = await res.json().catch(() => null);
		const errMsg =
			errPayload?.error?.description ||
			errPayload?.error?.message ||
			errPayload?.message ||
			"Không thể xóa tài khoản Hội đồng thẩm định";
		throw new Error(errMsg);
	}

	const json = await res.json();
	return json?.data || json?.id || "";
}

/**
 * Khóa tài khoản thành viên Hội đồng thẩm định qua POST /api/v1/auth/accounts/{id}/lock
 */
export async function lockReviewerAccount(accountId: string): Promise<any> {
	return await apiRequest(`/auth/accounts/${accountId}/lock`, { method: "POST" });
}

/**
 * Mở khóa tài khoản thành viên Hội đồng thẩm định qua POST /api/v1/auth/accounts/{id}/unlock
 */
export async function unlockReviewerAccount(accountId: string): Promise<any> {
	return await apiRequest(`/auth/accounts/${accountId}/unlock`, { method: "POST" });
}

/**
 * Bật/tắt trạng thái Active / Inactive trực tiếp siêu nhanh qua API lock/unlock
 */
export async function toggleReviewerStatus(item: RegulationReviewItem): Promise<RegulationReviewItem> {
	const isCurrentlyActive = item.status === "Active";
	const updated = isCurrentlyActive
		? await lockReviewerAccount(item.id)
		: await unlockReviewerAccount(item.id);

	const newStatus =
		updated?.status === "Inactive"
			? "Inactive"
			: updated?.status === "Active"
			? "Active"
			: isCurrentlyActive
			? "Inactive"
			: "Active";

	return {
		...item,
		status: newStatus,
	};
}
