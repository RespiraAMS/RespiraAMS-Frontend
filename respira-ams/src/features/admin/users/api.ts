import { apiRequest, buildQuery } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { API_V1, CLIENT_API_BASE } from "@/lib/api-base";
import {
	UserItem,
	CreateUserPayload,
	UpdateUserPayload,
	UserFilters,
	UserStats,
	UserStatus,
	UserRole,
	AcademicTitle,
	DegreeType,
	GenderType,
	PositionType,
} from "./types";

const USERS_STORAGE_KEY = "respira_admin_users_v1";
const DELETED_USERS_STORAGE_KEY = "respira_admin_deleted_users_v1";
const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";
const CREATE_POLL_INTERVAL_MS = 1200;
const CREATE_TIMEOUT_MS = 30000;

export interface CreateUserResult {
	sagaId: string;
	user: UserItem | null;
	emailSent: boolean;
}

interface CreateSagaStatus {
	sagaId?: string;
	step?: string;
	accountId?: string;
	doctorId?: string;
	failureReason?: string | null;
}

interface BackendAuditLogEntry {
	id: string;
	action: string;
	correlationId?: string | null;
}

interface BackendAuditLogPagination {
	items?: BackendAuditLogEntry[];
}

interface AuditOutcome {
	created: boolean;
	emailFailed: boolean;
}

function getStoredDeletedUserIds(): string[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(DELETED_USERS_STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
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
		const raw = localStorage.getItem(USERS_STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function saveStoredLocalUsers(users: UserItem[]): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
	} catch (e) {
		console.error("Failed to save users to localStorage:", e);
	}
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

function mapBackendDoctorToUser(doc: BackendDoctorDto): UserItem {
	const roleStr = doc.accountRole || doc.role || "Doctor";
	let role: UserRole = "Doctor";

	if (roleStr === "Admin") {
		role = "Admin";
	} else if (roleStr === "MedicalRegulationReviewer") {
		role = "Manager";
	} else if (roleStr === "HeadDepartmentDoctor") {
		role = "HeadDepartmentDoctor";
	}

	const status: UserStatus = doc.accountStatus === "Inactive" ? "Inactive" : "Active";

	return {
		id: doc.accountId || doc.id,
		doctorId: doc.id,
		mediaId: doc.mediaId || undefined,
		email: doc.email || "",
		phone: doc.phone || "",
		role,
		status,
		isEmailConfirmed: doc.isEmailConfirmed ?? true,
		firstName: doc.firstName || "",
		lastName: doc.lastName || "",
		degrees: (doc.degrees as DegreeType[] | undefined) || [],
		academicTitle: (doc.academicTitle as AcademicTitle | undefined) || "None",
		position: (doc.position as PositionType | undefined) || "StaffDoctor",
		gender: (doc.gender as GenderType | undefined) || "Male",
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

	// 1. Gọi trực tiếp API Backend qua Gateway
	try {
		const query: Record<string, string | number | undefined> = {
			Page: page,
			Size: Math.max(pageSize, 50),
		};

		if (
			filters?.role &&
			filters.role !== "ALL" &&
			(filters.role === "Doctor" || filters.role === "HeadDepartmentDoctor")
		) {
			query.Role = filters.role;
		}

		let endpoint = "/doctors";
		const searchTrim = filters?.search?.trim();
		if (searchTrim && searchTrim.length >= 2) {
			endpoint = "/doctors/search";
			query.SearchTerm = searchTrim;
		}

		const res = await apiRequest<{
			items?: BackendDoctorDto[];
			metadata?: { totalItemCount?: number; totalCount?: number };
		}>(`${endpoint}${buildQuery(query)}`);

		if (res?.items && Array.isArray(res.items)) {
			remoteUsers = res.items.map(mapBackendDoctorToUser);
		}
	} catch (e) {
		console.warn("[AdminUsersAPI] Không thể tải /doctors từ Backend, kiểm tra bộ nhớ đệm:", e);
	}

	// Lọc bỏ các tài khoản đã được đánh dấu xóa mềm
	const deletedIds = new Set(getStoredDeletedUserIds());
	remoteUsers = remoteUsers.filter(
		(u) =>
			!deletedIds.has(u.id) &&
			(!u.doctorId || !deletedIds.has(u.doctorId)) &&
			!deletedIds.has(u.email.toLowerCase())
	);

	// 2. Bổ sung tài khoản Admin đang đăng nhập thực tế (nếu role cho phép)
	const activeAccount = getUser();

	// Nạp các cập nhật cục bộ của Admin lên ưu tiên hàng đầu để không bị đè mất
	const localStored = getStoredLocalUsers();
	const localMap = new Map<string, UserItem>();
	for (const lu of localStored) {
		if (lu.id) localMap.set(lu.id, lu);
		if (lu.doctorId) localMap.set(lu.doctorId, lu);
		if (lu.email) localMap.set(lu.email.toLowerCase(), lu);
	}

	// Áp dụng các thay đổi của Admin (tên, vai trò, trạng thái...) lên dữ liệu backend
	const mergedRemoteUsers = remoteUsers.map((ru) => {
		const lu =
			localMap.get(ru.id) ||
			(ru.doctorId ? localMap.get(ru.doctorId) : undefined) ||
			(ru.email ? localMap.get(ru.email.toLowerCase()) : undefined);

		if (lu) {
			return {
				...ru,
				...lu,
				id: ru.id || lu.id,
				doctorId: ru.doctorId || lu.doctorId,
				email: lu.email || ru.email,
				firstName: lu.firstName || ru.firstName,
				lastName: lu.lastName || ru.lastName,
				role: ru.role,
				status: lu.status || ru.status,
				phone: lu.phone || ru.phone,
				citizenIdentificationNumber:
					lu.citizenIdentificationNumber || ru.citizenIdentificationNumber,
				address: lu.address || ru.address,
				degrees: lu.degrees?.length ? lu.degrees : ru.degrees,
				academicTitle: lu.academicTitle || ru.academicTitle,
				position: lu.position || ru.position,
				avatarUrl: lu.avatarUrl || ru.avatarUrl,
			};
		}
		return ru;
	});

	const mergedMap = new Map<string, UserItem>();
	for (const u of mergedRemoteUsers) {
		const key = u.id || u.email.toLowerCase();
		mergedMap.set(key, u);
	}

	// Bổ sung tài khoản Admin đang hoạt động nếu chưa có trong danh sách
	if (activeAccount?.email && activeAccount.role === "Admin") {
		const exists = Array.from(mergedMap.values()).some(
			(u) =>
				u.role === "Admin" ||
				u.email.toLowerCase() === activeAccount.email.toLowerCase()
		);
		if (!exists) {
			const adminName =
				[activeAccount.firstName, activeAccount.lastName].filter(Boolean).join(" ") ||
				"Quản trị viên";
			const adminUser: UserItem = {
				id: activeAccount.id || "admin-account-id",
				email: activeAccount.email,
				phone: activeAccount.phoneNumber || "",
				role: "Admin",
				status: "Active",
				isEmailConfirmed: true,
				firstName: adminName,
				lastName: "Hệ Thống",
				degrees: ["Master", "Bachelor"],
				academicTitle: "None",
				position: "Director",
				gender: "Male",
				citizenIdentificationNumber: "",
				address: "Cổng Quản trị Hệ thống Respira AMS",
				createdAt: new Date().toISOString(),
			};
			mergedMap.set(adminUser.id, adminUser);
		}
	}

	const allUsers = Array.from(mergedMap.values());

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
		managers: allUsers.filter(
			(u) => u.role === "Manager" || u.role === "HeadDepartmentDoctor"
		).length,
		admins: allUsers.filter((u) => u.role === "Admin").length,
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
 * Lấy chi tiết một bác sĩ/người dùng theo ID
 */
export async function fetchUserById(id: string): Promise<UserItem | null> {
	try {
		const res = await apiRequest<BackendDoctorDto>(`/doctors/${id}`);
		if (res) return mapBackendDoctorToUser(res);
	} catch {
		// Fallback local store
	}

	const local = getStoredLocalUsers();
	return local.find((u) => u.id === id || u.doctorId === id) || null;
}

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function translateCreateError(message: string): string {
	if (/already exists/i.test(message)) return "Email này đã được sử dụng.";
	if (/avatar.*required/i.test(message)) {
		return "Ảnh đại diện là bắt buộc với tài khoản bác sĩ.";
	}
	if (/cannot create/i.test(message)) {
		return "Bạn không có quyền tạo tài khoản với vai trò này.";
	}
	return message;
}

async function getCreateSagaStatus(sagaId: string): Promise<CreateSagaStatus | null> {
	try {
		return await apiRequest<CreateSagaStatus>(`/profile/create/${sagaId}`);
	} catch {
		return null;
	}
}

async function findDoctorById(doctorId: string): Promise<UserItem | null> {
	try {
		const res = await apiRequest<BackendDoctorDto>(`/doctors/${doctorId}`);
		return res ? mapBackendDoctorToUser(res) : null;
	} catch {
		return null;
	}
}

async function findDoctorByEmail(email: string): Promise<UserItem | null> {
	try {
		const res = await apiRequest<{ items?: BackendDoctorDto[] }>(
			`/doctors${buildQuery({ Page: 1, Size: 200 })}`
		);
		const normalizedEmail = email.trim().toLowerCase();
		const match = res?.items?.find(
			(item) => (item.email || "").trim().toLowerCase() === normalizedEmail
		);
		return match ? mapBackendDoctorToUser(match) : null;
	} catch {
		return null;
	}
}

async function readCreateAudit(sagaId: string): Promise<AuditOutcome> {
	try {
		const res = await apiRequest<BackendAuditLogPagination>(
			`/audit-logs${buildQuery({ page: 1, pageSize: 100 })}`
		);
		const items = res?.items ?? [];

		return {
			created: items.some(
				(entry) =>
					entry.correlationId === sagaId &&
					entry.action === "Authentication.AccountCreated"
			),
			emailFailed: items.some(
				(entry) =>
					entry.correlationId === sagaId &&
					entry.action === "Authentication.VerificationEmailFailed"
			),
		};
	} catch {
		return { created: false, emailFailed: false };
	}
}

async function waitForCreatedAccount(
	sagaId: string,
	payload: CreateUserPayload
): Promise<CreateUserResult> {
	const startedAt = Date.now();
	const deadline = startedAt + CREATE_TIMEOUT_MS;
	let lastFailure: string | null = null;
	let lastAudit: AuditOutcome = { created: false, emailFailed: false };

	while (Date.now() < deadline) {
		const status = await getCreateSagaStatus(sagaId);
		if (status?.failureReason) lastFailure = status.failureReason;

		if (status?.doctorId && status.doctorId !== EMPTY_GUID) {
			const doctor = await findDoctorById(status.doctorId);
			if (doctor) {
				const audit = await readCreateAudit(sagaId);
				return { sagaId, user: doctor, emailSent: !audit.emailFailed };
			}
		}

		lastAudit = await readCreateAudit(sagaId);

		if (payload.role !== "Manager") {
			const doctor = await findDoctorByEmail(payload.email);
			if (doctor) {
				return { sagaId, user: doctor, emailSent: !lastAudit.emailFailed };
			}
		}

		if (lastAudit.created) {
			if (payload.role !== "Manager") {
				const doctor = await findDoctorByEmail(payload.email);
				if (doctor) {
					return { sagaId, user: doctor, emailSent: !lastAudit.emailFailed };
				}
			} else {
				return { sagaId, user: null, emailSent: !lastAudit.emailFailed };
			}
		}

		if (lastFailure) {
			await delay(700);
			const finalAudit = await readCreateAudit(sagaId);
			if (finalAudit.created) {
				return { sagaId, user: null, emailSent: !finalAudit.emailFailed };
			}
			throw new Error(translateCreateError(lastFailure));
		}

		await delay(Date.now() - startedAt < 5000 ? 500 : CREATE_POLL_INTERVAL_MS);
	}

	if (lastAudit.created) {
		return { sagaId, user: null, emailSent: !lastAudit.emailFailed };
	}

	throw new Error(
		"Tạo tài khoản chưa hoàn tất. Vui lòng kiểm tra lại danh sách hoặc nhật ký hệ thống."
	);
}

/**
 * Tạo người dùng mới qua Saga ProfileCreate.
 * Manager được tạo với role MedicalRegulationReviewer (account-only).
 */
export async function createUser(payload: CreateUserPayload): Promise<CreateUserResult> {
	const isManager = payload.role === "Manager";

	const existingDoctor = await findDoctorByEmail(payload.email);
	if (existingDoctor) {
		throw new Error("Email này đã được sử dụng.");
	}

	const formData = new FormData();
	const requestBody = isManager
		? {
				email: payload.email,
				password: payload.password,
				phone: payload.phone,
				role: "MedicalRegulationReviewer",
		  }
		: {
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
	if (!isManager && payload.avatarFile) {
		formData.append("avatar", payload.avatarFile);
	}

	const createUrl = typeof window !== "undefined" ? CLIENT_API_BASE : API_V1;

	let response: Response;
	try {
		response = await fetch(`${createUrl}/profile/create`, {
			method: "POST",
			headers: { Accept: "application/json" },
			body: formData,
			signal: AbortSignal.timeout(45000),
		});
	} catch {
		throw new Error("Không thể kết nối tới máy chủ. Vui lòng thử lại.");
	}

	const json = (await response.json().catch(() => null)) as {
		data?: string;
		error?: { description?: string } | null;
	} | null;

	if (!response.ok) {
		throw new Error(
			translateCreateError(
				json?.error?.description || `Tạo tài khoản thất bại (${response.status}).`
			)
		);
	}

	const sagaId = typeof json?.data === "string" ? json.data : "";

	if (!sagaId) {
		throw new Error("Máy chủ không trả về mã Saga. Vui lòng thử lại.");
	}

	return waitForCreatedAccount(sagaId, payload);
}

/**
 * Cập nhật thông tin người dùng qua Saga ProfileUpdate
 */
export async function updateUser(
	payload: UpdateUserPayload
): Promise<{ sagaId: string; user: UserItem }> {
	let backendSagaId: string | null = null;

	try {
		const formData = new FormData();
		const requestBody = {
			accountId: payload.accountId,
			doctorId: payload.doctorId,
			email: payload.email,
			phone: payload.phone,
			password: payload.password || undefined,
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

		const updateBase = typeof window !== "undefined" ? CLIENT_API_BASE : API_V1;
		const response = await fetch(`${updateBase}/profile/update`, {
			method: "POST",
			headers: { Accept: "application/json" },
			body: formData,
			signal: AbortSignal.timeout(45000),
		});

		const json = (await response.json().catch(() => null)) as {
			data?: string;
			id?: string;
			error?: { description?: string } | null;
			message?: string;
		} | null;

		if (!response.ok) {
			throw new Error(
				json?.error?.description ||
					json?.message ||
					`Cập nhật hồ sơ thất bại (${response.status}).`
			);
		}

		backendSagaId = json?.data || json?.id || null;
	} catch (e) {
		if (e instanceof Error) throw e;
		throw new Error("Không thể kết nối tới máy chủ. Vui lòng thử lại.");
	}

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
			isEmailConfirmed: true,
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

	const deleteBase = typeof window !== "undefined" ? CLIENT_API_BASE : API_V1;
	const response = await fetch(`${deleteBase}/profile/delete`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify({
			accountId,
			doctorId: doctorId || EMPTY_GUID,
			mediaId: mediaId || EMPTY_GUID,
		}),
		signal: AbortSignal.timeout(30000),
	});

	const json = (await response.json().catch(() => null)) as {
		data?: string;
		id?: string;
		error?: { description?: string } | null;
		message?: string;
	} | null;

	if (!response.ok) {
		throw new Error(
			json?.error?.description ||
				json?.message ||
				`Xóa người dùng thất bại (${response.status}).`
		);
	}

	backendSagaId = json?.data || json?.id || null;

	// Đánh dấu xóa mềm cục bộ để ẩn ngay lập tức khỏi giao diện
	addStoredDeletedUserIds([accountId, doctorId || ""]);

	const currentUsers = getStoredLocalUsers();
	const remaining = currentUsers.filter((u) => u.id !== accountId && u.doctorId !== doctorId);
	saveStoredLocalUsers(remaining);

	return { sagaId: backendSagaId || `saga-delete-${Date.now()}` };
}

/**
 * Bật/tắt trạng thái Active / Inactive của người dùng
 */
export async function toggleUserStatus(id: string, userToToggle?: UserItem): Promise<UserItem> {
	const currentUsers = getStoredLocalUsers();
	let user = currentUsers.find((u) => u.id === id || u.doctorId === id);
	if (!user && userToToggle) {
		user = userToToggle;
	}
	if (!user) {
		const fetched = await fetchUserById(id);
		if (fetched) user = fetched;
	}
	if (!user) throw new Error("Không tìm thấy người dùng");

	const newStatus: UserStatus = user.status === "Active" ? "Inactive" : "Active";
	const updated: UserItem = { ...user, status: newStatus };

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

