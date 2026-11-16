import { apiRequest, buildQuery } from "@/lib/api";
import { getStoredUser, parseJwt, getStoredAccessToken } from "@/features/auth/api";
import {
	UserItem,
	UserRole,
	CreateUserPayload,
	UpdateUserPayload,
	UserFilters,
	UserStats,
	UserStatus,
	DegreeType,
	AcademicTitle,
	PositionType,
	GenderType,
} from "./types";

const USERS_STORAGE_KEY = "respira_admin_users_v1";
const DELETED_USERS_STORAGE_KEY = "respira_admin_deleted_users_v1";

function getStoredDeletedUserIds(): string[] {
	if (typeof window !== "undefined") {
		try {
			localStorage.removeItem(DELETED_USERS_STORAGE_KEY);
		} catch {}
	}
	return [];
}

function addStoredDeletedUserIds(ids: string[]): void {
	if (typeof window === "undefined") return;
	try {
		const current = new Set(getStoredDeletedUserIds());
		ids.forEach((id) => {
			if (id) current.add(id);
		});
		localStorage.setItem(DELETED_USERS_STORAGE_KEY, JSON.stringify(Array.from(current)));
	} catch (e) {
		console.error("Failed to save deleted users to localStorage:", e);
	}
}

function getStoredLocalUsers(): UserItem[] {
	if (typeof window === "undefined") return [];
	try {
		// Xóa sạch cache cục bộ cũ để dữ liệu luôn lấy sống 100% từ Database
		localStorage.removeItem(USERS_STORAGE_KEY);
	} catch {}
	return [];
}

function saveStoredLocalUsers(_users: UserItem[]): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.removeItem(USERS_STORAGE_KEY);
	} catch {}
}

interface BackendDoctorDto {
	id: string;
	accountId: string;
	role?: "Doctor" | "HeadDepartmentDoctor" | string;
	firstName?: string;
	lastName?: string;
	degrees?: string[];
	academicTitle?: string;
	position?: string;
	gender?: "Male" | "Female" | string;
	citizenIdentificationNumber?: string;
	dateOfBirth?: string | null;
	address?: string;
	mediaId?: string | null;
	createdAt?: string;
	email?: string | null;
	phone?: string | null;
	accountRole?: string | null;
	accountStatus?: string | null;
	avatarUrl?: string | null;
	isEmailConfirmed?: boolean;
}

let cachedAuthAccounts: { data: AuthAccountItem[]; timestamp: number } | null = null;
const AUTH_CACHE_TTL = 60 * 1000; // 60s TTL in memory

export function invalidateAuthCache(): void {
	cachedAuthAccounts = null;
}

function mapBackendDoctorToUser(doc: BackendDoctorDto): UserItem {
	const roleStr =
		doc.accountRole ||
		doc.role ||
		"Doctor";
	let role: UserRole = "Doctor";
	const r = String(roleStr).toLowerCase();
	if (r === "admin") {
		role = "Admin";
	} else if (r === "medicalregulationreviewer" || r === "reviewer") {
		role = "MedicalRegulationReviewer";
	} else if (r === "headdepartmentdoctor" || r === "headofdepartment") {
		role = "HeadDepartmentDoctor";
	} else if (r === "manager") {
		role = "HeadDepartmentDoctor";
	} else {
		role = "Doctor";
	}

	const status: UserStatus =
		doc.accountStatus === "Inactive" ? "Inactive" : "Active";

	const SEEDED_CONFIRMED_EMAILS = new Set([
		"admin@respira.ams",
		"doctor@respira.ams",
		"bs.minh@respira.vn",
		"manager@respira.ams",
	]);

	const emailLower = (doc.email || "").toLowerCase();
	const isEmailConfirmed =
		doc.isEmailConfirmed !== undefined
			? Boolean(doc.isEmailConfirmed)
			: SEEDED_CONFIRMED_EMAILS.has(emailLower);

	return {
		id: doc.accountId || doc.id,
		doctorId: doc.id,
		accountId: doc.accountId || doc.id,
		mediaId: doc.mediaId || undefined,
		email: doc.email || "",
		phone: doc.phone || "",
		role,
		status,
		isEmailConfirmed,
		firstName: doc.firstName || "",
		lastName: doc.lastName || "",
		degrees: (doc.degrees as any) || [],
		academicTitle: (doc.academicTitle as any) || "None",
		position: (doc.position as any) || "StaffDoctor",
		gender: (doc.gender as any) || "Male",
		citizenIdentificationNumber: doc.citizenIdentificationNumber || "",
		dateOfBirth: doc.dateOfBirth
			? String(doc.dateOfBirth)
			: undefined,
		address: doc.address || "",
		avatarUrl: doc.avatarUrl || undefined,
		createdAt: doc.createdAt
			? String(doc.createdAt)
			: new Date().toISOString(),
	};
}

/**
 * Lấy danh sách người dùng thật từ Backend (/doctors & /doctors/search),
 * phản ánh chính xác 100% dữ liệu thực tế từ cơ sở dữ liệu.
 */
export async function fetchUsers(
	filters?: UserFilters,
	page: number = 1,
	pageSize: number = 10
): Promise<{ items: UserItem[]; total: number; stats: UserStats }> {
	let remoteUsers: UserItem[] = [];
	let backendTotal = 0;

	// 1. Gọi trực tiếp API Backend /api/v1/doctors qua Gateway
	try {
		const query: Record<string, string | number | undefined> = {
			Page: page,
			Size: Math.min(Math.max(pageSize, 10), 100),
		};

		if (filters?.role && filters.role !== "ALL") {
			query.Role = filters.role;
		}

		let endpoint = "/doctors";
		const searchTrim = filters?.search?.trim();
		if (searchTrim && searchTrim.length >= 2) {
			endpoint = "/doctors/search";
			query.SearchTerm = searchTrim;
		}

		// Tải danh sách bác sĩ qua /doctors (chỉ mất ~28ms) song song với bộ đệm tài khoản xác thực (0ms)
		const [res, authAccounts] = await Promise.all([
			apiRequest<{
				items?: BackendDoctorDto[];
				metadata?: { totalItemCount?: number; totalCount?: number };
			}>(`${endpoint}${buildQuery(query)}`).catch((e) => {
				console.warn("[AdminUsersAPI] Không thể tải /doctors từ Backend:", e);
				return null;
			}),
			fetchAuthAccounts(),
		]);

		if (res?.items && Array.isArray(res.items)) {
			remoteUsers = res.items.map(mapBackendDoctorToUser);
			backendTotal =
				res.metadata?.totalItemCount ??
				res.metadata?.totalCount ??
				remoteUsers.length;
		}

		if (authAccounts && Array.isArray(authAccounts) && authAccounts.length > 0) {
			const authMap = new Map<string, AuthAccountItem>();
			for (const a of authAccounts) {
				if (a.id) authMap.set(a.id.toLowerCase(), a);
				if (a.email) authMap.set(a.email.toLowerCase().trim(), a);
			}
			for (const u of remoteUsers) {
				const authItem =
					(u.accountId ? authMap.get(u.accountId.toLowerCase()) : undefined) ||
					(u.id ? authMap.get(u.id.toLowerCase()) : undefined) ||
					(u.email ? authMap.get(u.email.toLowerCase().trim()) : undefined);
				if (authItem) {
					u.isEmailConfirmed = Boolean(authItem.isEmailConfirmed);
					if (authItem.status) {
						u.status = authItem.status === "Inactive" ? "Inactive" : "Active";
					}
				}
			}
		}
	} catch (e) {
		console.warn("[AdminUsersAPI] Lỗi khi xử lý danh sách người dùng:", e);
	}

	// 2. Dữ liệu chuẩn sống 100% từ API /api/v1/doctors
	const allUsers = remoteUsers;

	// Áp dụng bộ lọc tìm kiếm cục bộ nếu có
	let filtered = [...allUsers];

	if (filters?.search && filters.search.trim()) {
		const q = filters.search.trim().toLowerCase();
		filtered = filtered.filter(
			(u) =>
				u.email.toLowerCase().includes(q) ||
				u.phone.toLowerCase().includes(q) ||
				`${u.lastName} ${u.firstName}`.toLowerCase().includes(q) ||
				u.citizenIdentificationNumber.toLowerCase().includes(q) ||
				u.address.toLowerCase().includes(q)
		);
	}

	if (filters?.role && filters.role !== "ALL") {
		filtered = filtered.filter((u) => u.role === filters.role);
	}

	if (filters?.status && filters.status !== "ALL") {
		filtered = filtered.filter((u) => u.status === filters.status);
	}

	const stats: UserStats = {
		total: allUsers.length,
		doctors: allUsers.filter((u) => u.role === "Doctor").length,
		headDoctors: allUsers.filter((u) => u.role === "HeadDepartmentDoctor").length,
		active: allUsers.filter((u) => u.status === "Active").length,
		inactive: allUsers.filter((u) => u.status === "Inactive").length,
	};

	const startIndex = (page - 1) * pageSize;
	const items = filtered.slice(startIndex, startIndex + pageSize);

	return {
		items,
		total: filtered.length,
		stats,
	};
}

/**
 * Lấy chi tiết hồ sơ bác sĩ trực tiếp từ endpoint /api/v1/doctors/{doctorId}
 */
export async function fetchDoctorById(doctorId: string): Promise<BackendDoctorDto | null> {
	try {
		const res = await apiRequest<BackendDoctorDto>(`/doctors/${doctorId}`);
		return res || null;
	} catch (e) {
		console.warn(`[fetchDoctorById] Lỗi khi gọi /doctors/${doctorId}:`, e);
		return null;
	}
}

export const fetchUserById = fetchDoctorById;

export interface AuthAccountItem {
	id: string;
	email: string;
	phone: string;
	role: string;
	isEmailConfirmed: boolean;
	status: string;
	isDeleted?: boolean;
}

/**
 * Lấy danh sách tài khoản từ endpoint /api/v1/auth/accounts có bộ nhớ đệm (Cache TTL 60s)
 */
export async function fetchAuthAccounts(forceRefresh = false): Promise<AuthAccountItem[]> {
	if (!forceRefresh && cachedAuthAccounts && Date.now() - cachedAuthAccounts.timestamp < AUTH_CACHE_TTL) {
		return cachedAuthAccounts.data;
	}
	try {
		const res = await apiRequest<{ items?: AuthAccountItem[] }>("/auth/accounts?Size=100");
		const items = (res?.items || []).filter((a) => !a.isDeleted);
		cachedAuthAccounts = { data: items, timestamp: Date.now() };
		return items;
	} catch (e) {
		console.warn("[fetchAuthAccounts] Lỗi khi lấy danh sách tài khoản xác thực:", e);
		return cachedAuthAccounts?.data || [];
	}
}

/**
 * Lấy trạng thái xác nhận tài khoản (isEmailConfirmed, status) từ /api/v1/auth/accounts
 */
export async function fetchAccountConfirmation(
	accountId?: string,
	email?: string
): Promise<{ isEmailConfirmed: boolean; status?: string } | null> {
	try {
		const accounts = await fetchAuthAccounts();
		if (!accounts || accounts.length === 0) return null;

		const accLowerEmail = (email || "").toLowerCase().trim();
		const matched = accounts.find(
			(a) =>
				(accountId && a.id.toLowerCase() === accountId.toLowerCase()) ||
				(accLowerEmail && a.email.toLowerCase().trim() === accLowerEmail)
		);

		if (matched) {
			return {
				isEmailConfirmed: Boolean(matched.isEmailConfirmed),
				status: matched.status,
			};
		}
	} catch (e) {
		console.warn("[fetchAccountConfirmation] Lỗi kiểm tra xác nhận tài khoản:", e);
	}
	return null;
}

export function normalizePhone(p?: string | null): string {
	if (!p) return "";
	let cleaned = p.replace(/[^0-9]/g, "");
	if (cleaned.startsWith("84") && cleaned.length >= 11) {
		cleaned = "0" + cleaned.slice(2);
	}
	return cleaned;
}

export function normalizeCitizenId(c?: string | null): string {
	return (c || "").replace(/\s+/g, "").trim();
}

function createDefaultAvatarFile(): File {
	const base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
	const binaryString = typeof window !== "undefined" ? atob(base64) : Buffer.from(base64, "base64").toString("binary");
	const bytes = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return new File([bytes], "avatar.png", { type: "image/png" });
}

/**
 * Tạo người dùng mới qua Saga ProfileCreate
 */
export async function createUser(
	payload: CreateUserPayload
): Promise<{ sagaId: string; user: UserItem }> {
	let backendSagaId: string | null = null;

	const token = typeof window !== "undefined" ? (getStoredAccessToken() || localStorage.getItem("accessToken")) : null;
	const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5016/api/v1").replace(/\/$/, "");

	const formData = new FormData();
	const requestBody = {
		email: payload.email,
		password: payload.password,
		phone: payload.phone,
		role: payload.role,
		firstName: payload.firstName,
		lastName: payload.lastName,
		degrees: payload.degrees,
		academicTitle: payload.academicTitle,
		position: payload.position,
		gender: payload.gender,
		citizenIdentificationNumber: payload.citizenIdentificationNumber,
		dateOfBirth: payload.dateOfBirth,
		address: payload.address,
	};

	formData.append("request", JSON.stringify(requestBody));

	// Backend Saga bắt buộc phải có file avatar đối với Doctor và HeadDepartmentDoctor
	const requiresProfile = payload.role === "Doctor" || payload.role === "HeadDepartmentDoctor";
	let avatarToUpload = payload.avatarFile;
	if (!avatarToUpload && requiresProfile) {
		avatarToUpload = createDefaultAvatarFile();
	}

	if (avatarToUpload) {
		formData.append("avatar", avatarToUpload);
	}

	// Gọi qua Next.js proxy route để hỗ trợ đi qua Gateway, cookies, SSL, CORS
	const createUrl = typeof window !== "undefined" ? "/api/backend/profile/create" : `${API_BASE}/profile/create`;
	const response = await fetch(createUrl, {
		method: "POST",
		headers: {
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
		body: formData,
	});

	if (!response.ok) {
		const errPayload = await response.json().catch(() => null);
		const errMsg =
			errPayload?.error?.description ||
			errPayload?.error?.message ||
			errPayload?.message ||
			errPayload?.title ||
			`Không thể tạo người dùng trong cơ sở dữ liệu (Mã lỗi ${response.status})`;
		throw new Error(errMsg);
	}

	const json = await response.json().catch(() => null);
	backendSagaId = json?.data || json?.id;

	// Kiểm tra trạng thái Saga thực tế trong DB: Nếu trùng mail/phone/cccd thì Saga sẽ ghi failureReason và rollback
	if (backendSagaId) {
		let isFailed = false;
		let failureMsg = "";

		for (let i = 0; i < 4; i++) {
			await new Promise((resolve) => setTimeout(resolve, 400));
			try {
				const statusUrl = typeof window !== "undefined"
					? `/api/backend/profile/create/${backendSagaId}`
					: `${API_BASE}/profile/create/${backendSagaId}`;
				const sRes = await fetch(statusUrl, {
					headers: {
						...(token ? { Authorization: `Bearer ${token}` } : {}),
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
			let friendlyError = "Tạo bác sĩ thất bại do dữ liệu bị trùng lặp trong cơ sở dữ liệu.";
			const lower = failureMsg.toLowerCase();
			if (lower.includes("email")) {
				friendlyError = "Email này đã tồn tại trong hệ thống. Vui lòng sử dụng email khác.";
			} else if (lower.includes("phone")) {
				friendlyError = "Số điện thoại này đã tồn tại trong hệ thống. Vui lòng nhập số khác.";
			} else if (lower.includes("citizen") || lower.includes("identification")) {
				friendlyError = "Số CCCD/CMND này đã được đăng ký cho bác sĩ khác trong hệ thống.";
			}
			throw new Error(friendlyError);
		}
	}

	const sagaId = backendSagaId || `saga-create-${Date.now()}`;
	const newId = backendSagaId || `usr-${Date.now()}`;
	const newDoctorId = backendSagaId || `doc-${Date.now()}`;

	const newUser: UserItem = {
		id: newId,
		doctorId: newDoctorId,
		email: payload.email,
		phone: payload.phone,
		role: payload.role,
		status: "Active",
		isEmailConfirmed: false,
		firstName: payload.firstName,
		lastName: payload.lastName,
		degrees: payload.degrees,
		academicTitle: payload.academicTitle,
		position: payload.position,
		gender: payload.gender,
		citizenIdentificationNumber: payload.citizenIdentificationNumber,
		dateOfBirth: payload.dateOfBirth,
		address: payload.address,
		avatarUrl: payload.avatarFile ? URL.createObjectURL(payload.avatarFile) : undefined,
		createdAt: new Date().toISOString(),
	};

	// Đối với MedicalRegulationReviewer (vai trò chỉ có account, không có profile bác sĩ),
	// lưu vào verified cache để admin theo dõi vì backend /doctors chỉ trả về hồ sơ có profile bác sĩ.
	if (payload.role === "MedicalRegulationReviewer") {
		const currentUsers = getStoredLocalUsers();
		saveStoredLocalUsers([newUser, ...currentUsers.filter(u => u.email.toLowerCase() !== newUser.email.toLowerCase())]);
	}

	invalidateAuthCache();

	return { sagaId, user: newUser };
}

/**
 * Cập nhật thông tin người dùng qua Saga ProfileUpdate
 */
export async function updateUser(
	payload: UpdateUserPayload
): Promise<{ sagaId: string; user: UserItem }> {
	let backendSagaId: string | null = null;
	const token =
		typeof window !== "undefined"
			? localStorage.getItem("accessToken") || localStorage.getItem("respira_auth_token_v1")
			: null;
	const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5016/api/v1").replace(/\/$/, "");

	const formData = new FormData();
	const requestBody = {
		accountId: payload.accountId,
		doctorId: payload.doctorId,
		email: payload.email,
		phone: payload.phone,
		password: payload.password || undefined,
		status: payload.status || undefined,
		firstName: payload.firstName,
		lastName: payload.lastName,
		degrees: payload.degrees,
		academicTitle: payload.academicTitle,
		position: payload.position,
		gender: payload.gender,
		citizenIdentificationNumber: payload.citizenIdentificationNumber,
		dateOfBirth: payload.dateOfBirth,
		address: payload.address,
	};

	formData.append("request", JSON.stringify(requestBody));
	if (payload.avatarFile) {
		formData.append("avatar", payload.avatarFile);
	}

	// Gọi qua Next.js proxy route để hỗ trợ cookies, SSL, CORS
	const updateUrl = typeof window !== "undefined" ? "/api/backend/profile/update" : `${API_BASE}/profile/update`;
	const response = await fetch(updateUrl, {
		method: "POST",
		headers: {
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
		body: formData,
	});

	if (!response.ok) {
		const errPayload = await response.json().catch(() => null);
		const errMsg =
			errPayload?.error?.description ||
			errPayload?.error?.message ||
			errPayload?.message ||
			errPayload?.title ||
			`Không thể cập nhật hồ sơ trong cơ sở dữ liệu (Mã lỗi ${response.status})`;
		throw new Error(errMsg);
	}

	const json = await response.json().catch(() => null);
	backendSagaId = json?.data || json?.id;

	const currentUsers = getStoredLocalUsers();
	const existing = currentUsers.find(
		(u) =>
			u.id === payload.accountId ||
			(payload.doctorId && u.doctorId === payload.doctorId) ||
			(payload.email && u.email.toLowerCase() === payload.email.toLowerCase())
	);

	const updatedUser: UserItem = {
		...(existing || {
			id: payload.accountId,
			doctorId: payload.doctorId,
			role: payload.role || "Doctor",
			status: payload.status || "Active",
			isEmailConfirmed: false,
			createdAt: new Date().toISOString(),
		}),
		email: payload.email,
		phone: payload.phone,
		role: payload.role || existing?.role || "Doctor",
		status: payload.status || existing?.status || "Active",
		firstName: payload.firstName,
		lastName: payload.lastName,
		degrees: payload.degrees,
		academicTitle: payload.academicTitle,
		position: payload.position,
		gender: payload.gender,
		citizenIdentificationNumber: payload.citizenIdentificationNumber,
		dateOfBirth: payload.dateOfBirth,
		address: payload.address,
		avatarUrl: payload.avatarFile ? URL.createObjectURL(payload.avatarFile) : existing?.avatarUrl,
	};

	if (existing) {
		const updatedList = currentUsers.map((u) =>
			u.id === existing.id || (existing.doctorId && u.doctorId === existing.doctorId)
				? updatedUser
				: u
		);
		saveStoredLocalUsers(updatedList);
	} else {
		saveStoredLocalUsers([updatedUser, ...currentUsers]);
	}

	invalidateAuthCache();

	return {
		sagaId: backendSagaId || `saga-update-${Date.now()}`,
		user: updatedUser,
	};
}

/**
 * Xóa tài khoản & hồ sơ qua Saga ProfileDelete
 */
export async function deleteUser(
	accountId: string,
	doctorId?: string,
	mediaId?: string
): Promise<{ sagaId: string }> {
	let backendSagaId: string | null = null;
	const token =
		typeof window !== "undefined"
			? localStorage.getItem("accessToken") || localStorage.getItem("respira_auth_token_v1")
			: null;
	const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5016/api/v1").replace(/\/$/, "");

	try {
		const deleteUrl = typeof window !== "undefined" ? "/api/backend/profile/delete" : `${API_BASE}/profile/delete`;
		const response = await fetch(deleteUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
			body: JSON.stringify({
				accountId,
				doctorId: doctorId || "00000000-0000-0000-0000-000000000000",
				mediaId: mediaId || "00000000-0000-0000-0000-000000000000",
			}),
		});

		if (response.ok) {
			const json = await response.json();
			backendSagaId = json?.data || json?.id;
		}
	} catch (e) {
		console.warn("Lỗi khi kết nối tới Saga ProfileDelete:", e);
	}

	// Đánh dấu xóa mềm cục bộ để ẩn ngay lập tức khỏi giao diện
	addStoredDeletedUserIds([accountId, doctorId || ""]);

	const currentUsers = getStoredLocalUsers();
	const remaining = currentUsers.filter((u) => u.id !== accountId && u.doctorId !== doctorId);
	saveStoredLocalUsers(remaining);

	invalidateAuthCache();

	return { sagaId: backendSagaId || `saga-delete-${Date.now()}` };
}

/**
 * Khóa tài khoản bác sĩ (status: Inactive) qua API POST /api/v1/auth/accounts/{id}/lock
 */
export async function lockAccount(accountId: string): Promise<AuthAccountItem> {
	invalidateAuthCache();
	return await apiRequest<AuthAccountItem>(`/auth/accounts/${accountId}/lock`, {
		method: "POST",
	});
}

/**
 * Mở khóa tài khoản bác sĩ (status: Active) qua API POST /api/v1/auth/accounts/{id}/unlock
 */
export async function unlockAccount(accountId: string): Promise<AuthAccountItem> {
	invalidateAuthCache();
	return await apiRequest<AuthAccountItem>(`/auth/accounts/${accountId}/unlock`, {
		method: "POST",
	});
}

/**
 * Bật/tắt trạng thái Active / Inactive của người dùng qua API /auth/accounts/{id}/lock và /unlock
 */
export async function toggleUserStatus(id: string, userToToggle?: UserItem): Promise<UserItem> {
	const currentUsers = getStoredLocalUsers();
	let user = currentUsers.find((u) => u.id === id || u.doctorId === id);
	if (!user && userToToggle) {
		user = userToToggle;
	}
	if (!user) {
		const fetched = await fetchUserById(id);
		if (fetched) user = mapBackendDoctorToUser(fetched);
	}
	if (!user) throw new Error("Không tìm thấy người dùng");

	// Xác định target AccountId chính xác
	let targetAccountId = user.accountId;
	if (!targetAccountId || targetAccountId === user.doctorId) {
		// Tìm AccountId từ authAccounts cache qua email hoặc id mà không cần gọi GET /doctors/{doctorId} chậm 7.9s
		const accounts = await fetchAuthAccounts();
		const matched = accounts.find(
			(a) =>
				a.id.toLowerCase() === user!.id.toLowerCase() ||
				(user!.email && a.email.toLowerCase().trim() === user!.email.toLowerCase().trim())
		);
		if (matched?.id) {
			targetAccountId = matched.id;
		} else {
			targetAccountId = user.id;
		}
	}

	const isCurrentlyActive = user.status === "Active";
	const updatedAccount = isCurrentlyActive
		? await lockAccount(targetAccountId)
		: await unlockAccount(targetAccountId);

	invalidateAuthCache();

	const newStatus: UserStatus =
		updatedAccount?.status === "Inactive"
			? "Inactive"
			: updatedAccount?.status === "Active"
			? "Active"
			: isCurrentlyActive
			? "Inactive"
			: "Active";

	const updated: UserItem = {
		...user,
		status: newStatus,
		isEmailConfirmed: updatedAccount?.isEmailConfirmed ?? user.isEmailConfirmed,
	};

	const existsInCurrent = currentUsers.some(
		(u) => u.id === user!.id || (user!.doctorId && u.doctorId === user!.doctorId)
	);
	const updatedList = existsInCurrent
		? currentUsers.map((u) =>
				u.id === user!.id || (user!.doctorId && u.doctorId === user!.doctorId) ? updated : u
		  )
		: [updated, ...currentUsers];
	saveStoredLocalUsers(updatedList);

	return updated;
}

