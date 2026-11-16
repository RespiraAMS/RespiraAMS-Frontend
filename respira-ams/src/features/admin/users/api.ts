import { apiRequest, ApiError, buildQuery } from "@/lib/api";
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
	softDeleted: boolean;
}

interface SagaStatus {
	sagaId?: string;
	step?: string | number;
	accountId?: string;
	doctorId?: string;
	failureReason?: string | null;
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
	isDeleted?: boolean;
	createdAt?: string | null;
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
		// Ưu tiên ngày tạo account; hồ sơ bác sĩ chỉ là fallback cho dữ liệu cũ.
		createdAt: account.createdAt
			? String(account.createdAt)
			: profile?.createdAt || "",
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

	// Tài khoản đã xoá mềm không được hiển thị trong danh sách quản trị.
	const visibleAccounts = accounts.filter((account) => account.isDeleted !== true);

	const allUsers: UserItem[] = visibleAccounts.map((account) =>
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

/**
 * Poll a saga status endpoint until it finishes. Wolverine deletes a saga as soon
 * as it completes, so a 404 after the run was observed in flight means success.
 */
async function waitForSagaCompletion(
	endpoint: string,
	sagaId: string,
	timeoutMs = 45000
): Promise<void> {
	const startedAt = Date.now();
	let sawInFlight = false;

	while (Date.now() - startedAt < timeoutMs) {
		try {
			const status = await apiRequest<SagaStatus>(`${endpoint}/${sagaId}`);
			if (status?.failureReason) {
				throw new Error(translateCreateError(status.failureReason));
			}
			sawInFlight = true;
		} catch (error) {
			if (error instanceof ApiError && error.status === 404) {
				if (sawInFlight || Date.now() - startedAt >= 2500) {
					return;
				}
			} else {
				throw error;
			}
		}

		await delay(800);
	}

	throw new Error(
		"Thao tác chưa hoàn tất. Vui lòng kiểm tra lại danh sách hoặc nhật ký hệ thống."
	);
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
		const profiles = await fetchAllDoctorProfiles();
		const normalizedEmail = email.trim().toLowerCase();
		const match = [...profiles.values()].find(
			(item) => (item.email || "").trim().toLowerCase() === normalizedEmail
		);
		return match ? mapBackendDoctorToUser(match) : null;
	} catch {
		return null;
	}
}

export interface DoctorDuplicateInput {
	email: string;
	phone?: string;
	citizenId?: string;
}

export interface DoctorDuplicateResult {
	emailExists: boolean;
	phoneExists: boolean;
	citizenIdExists: boolean;
}

const DUPLICATE_CACHE_TTL_MS = 30_000;

let directoryCache: {
	at: number;
	accounts: BackendAccountDto[];
	doctors: BackendDoctorDto[];
} | null = null;

function normalizeDigits(value?: string | null): string {
	return (value || "").replace(/\s+/g, "");
}

async function loadDirectory(): Promise<{
	accounts: BackendAccountDto[];
	doctors: BackendDoctorDto[];
}> {
	if (directoryCache && Date.now() - directoryCache.at < DUPLICATE_CACHE_TTL_MS) {
		return directoryCache;
	}

	const [accounts, doctorMap] = await Promise.all([
		fetchAllAccounts(),
		fetchAllDoctorProfiles().catch(() => new Map<string, BackendDoctorDto>()),
	]);

	const snapshot = {
		at: Date.now(),
		accounts,
		doctors: [...doctorMap.values()],
	};
	directoryCache = snapshot;
	return snapshot;
}

/**
 * Kiểm tra trùng hồ sơ bác sĩ qua /doctors (duyệt toàn bộ trang) và đối chiếu
 * thêm /auth/accounts theo email, vì tài khoản có thể tồn tại trước khi có hồ sơ.
 */
export async function checkDoctorDuplicates(
	input: DoctorDuplicateInput
): Promise<DoctorDuplicateResult> {
	const { accounts, doctors } = await loadDirectory();

	const email = input.email.trim().toLowerCase();
	const phone = normalizeDigits(input.phone);
	const citizenId = normalizeDigits(input.citizenId);

	const emailExists =
		accounts.some(
			(account) =>
				account.isDeleted !== true &&
				(account.email || "").trim().toLowerCase() === email
		) ||
		doctors.some(
			(doctor) => (doctor.email || "").trim().toLowerCase() === email
		);

	const phoneExists = phone
		? doctors.some((doctor) => normalizeDigits(doctor.phone) === phone)
		: false;

	const citizenIdExists = citizenId
		? doctors.some(
				(doctor) => normalizeDigits(doctor.citizenIdentificationNumber) === citizenId
		  )
		: false;

	return { emailExists, phoneExists, citizenIdExists };
}

export function invalidateDoctorDirectoryCache(): void {
	directoryCache = null;
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
			softDeleted: items.some(
				(entry) =>
					entry.correlationId === sagaId &&
					(entry.action === "Authentication.AccountSoftDeleted" ||
						entry.action === "Doctor.ProfileSoftDeleted")
			),
		};
	} catch {
		return { created: false, emailFailed: false, softDeleted: false };
	}
}

function buildAccountOnlyUser(
	accountId: string,
	payload: CreateUserPayload
): UserItem {
	return {
		id: accountId,
		email: payload.email,
		phone: payload.phone,
		role: payload.role,
		status: "Active",
		isEmailConfirmed: false,
		firstName: payload.firstName || "",
		lastName: payload.lastName || "",
		degrees: payload.degrees || [],
		academicTitle: payload.academicTitle || "None",
		position: payload.position || "StaffDoctor",
		gender: payload.gender || "Male",
		citizenIdentificationNumber: payload.citizenIdentificationNumber || "",
		dateOfBirth: payload.dateOfBirth,
		address: payload.address || "",
		createdAt: new Date().toISOString(),
	};
}

async function waitForCreatedAccount(
	sagaId: string,
	payload: CreateUserPayload
): Promise<CreateUserResult> {
	const startedAt = Date.now();
	const deadline = startedAt + CREATE_TIMEOUT_MS;
	let lastFailure: string | null = null;
	let lastAudit: AuditOutcome = { created: false, emailFailed: false, softDeleted: false };
	let lastAccountUser: UserItem | null = null;

	while (Date.now() < deadline) {
		const status = await getCreateSagaStatus(sagaId);
		if (status?.failureReason) lastFailure = status.failureReason;

		const accountUser =
			status?.accountId && status.accountId !== EMPTY_GUID
				? buildAccountOnlyUser(status.accountId, payload)
				: null;
		if (accountUser) lastAccountUser = accountUser;

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
			}
			return { sagaId, user: lastAccountUser, emailSent: !lastAudit.emailFailed };
		}

		if (lastFailure) {
			await delay(700);
			const finalAudit = await readCreateAudit(sagaId);
			if (finalAudit.created) {
				return { sagaId, user: lastAccountUser, emailSent: !finalAudit.emailFailed };
			}
			throw new Error(translateCreateError(lastFailure));
		}

		await delay(Date.now() - startedAt < 5000 ? 500 : CREATE_POLL_INTERVAL_MS);
	}

	if (lastAudit.created) {
		return { sagaId, user: lastAccountUser, emailSent: !lastAudit.emailFailed };
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

	const duplicates = await checkDoctorDuplicates({
		email: payload.email,
		phone: isManager ? undefined : payload.phone,
		citizenId: isManager ? undefined : payload.citizenIdentificationNumber,
	});

	if (duplicates.emailExists) {
		throw new Error("Email này đã được sử dụng.");
	}
	if (duplicates.citizenIdExists) {
		throw new Error("Số CCCD/CMND này đã được sử dụng cho một bác sĩ khác.");
	}
	if (duplicates.phoneExists) {
		throw new Error("Số điện thoại này đã được sử dụng cho một bác sĩ khác.");
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

	const result = await waitForCreatedAccount(sagaId, payload);

	// A later saga step can still compensate (for example when the avatar upload
	// fails). Give it a short window to settle so we do not report success for an
	// account that is about to be soft-deleted.
	await delay(1200);
	const finalAudit = await readCreateAudit(sagaId);
	if (finalAudit.softDeleted) {
		throw new Error(
			"Tạo tài khoản thất bại và đã được hoàn tác. Vui lòng kiểm tra cấu hình lưu trữ ảnh đại diện."
		);
	}

	invalidateDoctorDirectoryCache();

	return result;
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

	if (!backendSagaId) {
		throw new Error("Máy chủ không trả về mã Saga. Vui lòng thử lại.");
	}

	await waitForSagaCompletion("/profile/update", backendSagaId);

	const updatedUser: UserItem = {
		id: payload.accountId,
		doctorId: payload.doctorId,
		role: payload.role || "Doctor",
		status: payload.status || "Active",
		isEmailConfirmed: false,
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
		createdAt: "",
	};

	return {
		sagaId: backendSagaId,
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

	if (!backendSagaId) {
		throw new Error("Máy chủ không trả về mã Saga. Vui lòng thử lại.");
	}

	await waitForSagaCompletion("/profile/delete", backendSagaId);

	return { sagaId: backendSagaId };
}

/**
 * Bật/tắt trạng thái Active / Inactive của người dùng.
 * Gọi PATCH /auth/accounts/{id}/status để backend khóa hoặc mở khóa tài khoản.
 */
export async function toggleUserStatus(id: string, userToToggle?: UserItem): Promise<UserItem> {
	if (!userToToggle) {
		throw new Error("Không tìm thấy người dùng để cập nhật trạng thái.");
	}

	const nextStatus: UserStatus = userToToggle.status === "Active" ? "Inactive" : "Active";

	const account = await apiRequest<BackendAccountDto>(`/auth/accounts/${id}/status`, {
		method: "PATCH",
		body: { status: nextStatus },
	});

	return {
		...userToToggle,
		email: account.email || userToToggle.email,
		phone: account.phone || userToToggle.phone,
		status: account.status === "Inactive" ? "Inactive" : "Active",
		isEmailConfirmed: account.isEmailConfirmed ?? userToToggle.isEmailConfirmed,
	};
}

