import { apiRequest, buildQuery } from "@/lib/api";
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

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";
const CREATE_POLL_INTERVAL_MS = 1200;
const CREATE_TIMEOUT_MS = 30000;
const LIST_PAGE_SIZE = 100;
const LIST_MAX_PAGES = 10;

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

interface BackendPaginationMetadata {
	totalItemCount?: number;
	pageCount?: number;
}

interface BackendAccountDto {
	id: string;
	email: string;
	phone?: string | null;
	role?: string | null;
	isEmailConfirmed?: boolean;
	status?: string | null;
}

const ACCOUNT_ROLE_TO_USER_ROLE: Record<string, UserRole> = {
	Doctor: "Doctor",
	HeadDepartmentDoctor: "HeadDepartmentDoctor",
	MedicalRegulationReviewer: "Manager",
	Manager: "Manager",
	Admin: "Admin",
};

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
		dateOfBirth: doc.dateOfBirth ? String(doc.dateOfBirth) : undefined,
		address: doc.address || "",
		avatarUrl: doc.avatarUrl || undefined,
		createdAt: doc.createdAt ? String(doc.createdAt) : "",
	};
}

function mapBackendAccountToUser(
	account: BackendAccountDto,
	doctor?: BackendDoctorDto
): UserItem {
	const role = ACCOUNT_ROLE_TO_USER_ROLE[account.role || ""] || "Doctor";
	const profile = doctor ? mapBackendDoctorToUser(doctor) : null;

	return {
		id: account.id,
		doctorId: doctor?.id,
		mediaId: doctor?.mediaId || undefined,
		email: account.email || profile?.email || "",
		phone: account.phone || profile?.phone || "",
		role,
		status: account.status === "Inactive" ? "Inactive" : "Active",
		isEmailConfirmed: account.isEmailConfirmed ?? profile?.isEmailConfirmed ?? false,
		firstName: profile?.firstName || "",
		lastName: profile?.lastName || "",
		degrees: profile?.degrees || [],
		academicTitle: profile?.academicTitle || "None",
		position: profile?.position || "StaffDoctor",
		gender: profile?.gender || "Male",
		citizenIdentificationNumber: profile?.citizenIdentificationNumber || "",
		dateOfBirth: profile?.dateOfBirth,
		address: profile?.address || "",
		avatarUrl: profile?.avatarUrl,
		createdAt: profile?.createdAt || "",
	};
}

async function fetchAllAccounts(): Promise<BackendAccountDto[]> {
	const accounts: BackendAccountDto[] = [];

	for (let page = 1; page <= LIST_MAX_PAGES; page += 1) {
		const res = await apiRequest<{
			items?: BackendAccountDto[];
			metadata?: BackendPaginationMetadata;
		}>(`/auth/accounts${buildQuery({ Page: page, Size: LIST_PAGE_SIZE })}`);

		const items = res?.items ?? [];
		accounts.push(...items);

		const total = res?.metadata?.totalItemCount ?? accounts.length;
		if (items.length < LIST_PAGE_SIZE || accounts.length >= total) break;
	}

	return accounts;
}

async function fetchAllDoctorProfiles(): Promise<Map<string, BackendDoctorDto>> {
	const profiles = new Map<string, BackendDoctorDto>();

	for (let page = 1; page <= LIST_MAX_PAGES; page += 1) {
		const res = await apiRequest<{
			items?: BackendDoctorDto[];
			metadata?: BackendPaginationMetadata;
		}>(`/doctors${buildQuery({ Page: page, Size: LIST_PAGE_SIZE })}`);

		const items = res?.items ?? [];
		for (const item of items) {
			if (item.accountId) profiles.set(item.accountId, item);
		}

		const total = res?.metadata?.totalItemCount ?? profiles.size;
		if (items.length < LIST_PAGE_SIZE || profiles.size >= total) break;
	}

	return profiles;
}

/**
 * Lấy danh sách người dùng thật từ Backend: tài khoản lấy từ /auth/accounts
 * (bao gồm MedicalRegulationReviewer), hồ sơ bác sĩ lấy từ /doctors để bổ sung
 * họ tên, học vị và ảnh đại diện.
 */
export async function fetchUsers(
	filters?: UserFilters,
	page: number = 1,
	pageSize: number = 10
): Promise<{ items: UserItem[]; total: number; stats: UserStats }> {
	let accounts: BackendAccountDto[] = [];
	let doctorProfiles = new Map<string, BackendDoctorDto>();

	try {
		[accounts, doctorProfiles] = await Promise.all([
			fetchAllAccounts(),
			fetchAllDoctorProfiles().catch(() => new Map<string, BackendDoctorDto>()),
		]);
	} catch (e) {
		console.warn("[AdminUsersAPI] Không thể tải danh sách tài khoản từ Backend:", e);
	}

	const allUsers: UserItem[] = accounts.map((account) =>
		mapBackendAccountToUser(account, doctorProfiles.get(account.id))
	);

	const searchTerm = filters?.search?.trim().toLowerCase() || "";

	const filtered = allUsers.filter((user) => {
		if (filters?.role && filters.role !== "ALL" && user.role !== filters.role) {
			return false;
		}
		if (filters?.status && filters.status !== "ALL" && user.status !== filters.status) {
			return false;
		}
		if (!searchTerm) return true;

		return (
			user.email.toLowerCase().includes(searchTerm) ||
			user.phone.toLowerCase().includes(searchTerm) ||
			`${user.lastName} ${user.firstName}`.toLowerCase().includes(searchTerm) ||
			user.citizenIdentificationNumber.toLowerCase().includes(searchTerm) ||
			user.address.toLowerCase().includes(searchTerm)
		);
	});

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

	return { items, total: filtered.length, stats };
}

/**
 * Lấy chi tiết một bác sĩ/người dùng theo ID
 */
export async function fetchUserById(id: string): Promise<UserItem | null> {
	try {
		const res = await apiRequest<BackendDoctorDto>(`/doctors/${id}`);
		if (res) return mapBackendDoctorToUser(res);
	} catch {
		return null;
	}

	return null;
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
			`/doctors${buildQuery({ Page: 1, Size: LIST_PAGE_SIZE })}`
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

	const updatedUser: UserItem = {
		id: payload.accountId,
		doctorId: payload.doctorId,
		role: payload.role || "Doctor",
		status: payload.status || "Active",
		isEmailConfirmed: true,
		email: payload.email,
		phone: payload.phone,
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

	return { sagaId: backendSagaId || `saga-delete-${Date.now()}` };
}

/**
 * Bật/tắt trạng thái Active / Inactive của người dùng.
 * Backend hiện chưa cung cấp endpoint đổi trạng thái tài khoản, nên hàm này
 * báo lỗi thay vì giả lập thay đổi cục bộ.
 */
export async function toggleUserStatus(id: string, userToToggle?: UserItem): Promise<UserItem> {
	void id;
	void userToToggle;

	throw new Error(
		"Backend chưa hỗ trợ thay đổi trạng thái tài khoản. Vui lòng liên hệ quản trị hệ thống."
	);
}

