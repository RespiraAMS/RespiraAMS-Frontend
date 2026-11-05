import { apiRequest } from "@/lib/api";
import {
	UserItem,
	CreateUserPayload,
	UpdateUserPayload,
	UserFilters,
	UserStats,
	UserStatus,
} from "./types";

const USERS_STORAGE_KEY = "respira_admin_users_v1";

export const INITIAL_USERS: UserItem[] = [
	{
		id: "usr-admin-01",
		doctorId: "doc-admin-01",
		email: "admin@respira.ams",
		phone: "0901234567",
		role: "Admin",
		status: "Active",
		isEmailConfirmed: true,
		firstName: "Hệ Thống",
		lastName: "Quản Trị Viên",
		degrees: ["Master", "Bachelor"],
		academicTitle: "None",
		position: "Director",
		gender: "Male",
		citizenIdentificationNumber: "001085012345",
		dateOfBirth: "1980-01-15T00:00:00.000Z",
		address: "Số 1 Tôn Thất Tùng, Đống Đa, Hà Nội",
		createdAt: "2026-01-10T08:00:00.000Z",
	},
	{
		id: "usr-manager-01",
		doctorId: "doc-manager-01",
		email: "manager@respira.ams",
		phone: "0912345678",
		role: "Manager",
		status: "Active",
		isEmailConfirmed: true,
		firstName: "Hoàng Long",
		lastName: "PGS.TS Vũ",
		degrees: ["PhD", "Master", "Doctor"],
		academicTitle: "AssociateProfessor",
		position: "HeadOfDepartment",
		gender: "Male",
		citizenIdentificationNumber: "001078023456",
		dateOfBirth: "1978-04-20T00:00:00.000Z",
		address: "Khoa Vi sinh Lâm sàng, Bệnh viện Đại học Y Dược",
		createdAt: "2026-01-15T09:30:00.000Z",
	},
	{
		id: "usr-doctor-01",
		doctorId: "doc-doctor-01",
		email: "doctor@respira.ams",
		phone: "0987654321",
		role: "Doctor",
		status: "Active",
		isEmailConfirmed: true,
		firstName: "Hoàng Minh",
		lastName: "BS.CKII Lê",
		degrees: ["Doctor", "Master"],
		academicTitle: "None",
		position: "SeniorDoctor",
		gender: "Male",
		citizenIdentificationNumber: "079085034567",
		dateOfBirth: "1985-08-12T00:00:00.000Z",
		address: "Khoa Hô Hấp, Bệnh viện Chợ Rẫy, TP.HCM",
		createdAt: "2026-02-01T10:15:00.000Z",
	},
	{
		id: "usr-doctor-02",
		doctorId: "doc-doctor-02",
		email: "bs.minh@respira.vn",
		phone: "0934567890",
		role: "Doctor",
		status: "Active",
		isEmailConfirmed: true,
		firstName: "Văn An",
		lastName: "ThS.BS Nguyễn",
		degrees: ["Master", "Doctor"],
		academicTitle: "None",
		position: "StaffDoctor",
		gender: "Male",
		citizenIdentificationNumber: "001088045678",
		dateOfBirth: "1988-11-25T00:00:00.000Z",
		address: "Khoa Hồi sức tích cực ICU, Bệnh viện Bạch Mai",
		createdAt: "2026-02-15T14:20:00.000Z",
	},
	{
		id: "usr-doctor-03",
		doctorId: "doc-doctor-03",
		email: "bs.huong@respira.vn",
		phone: "0945678901",
		role: "Doctor",
		status: "Active",
		isEmailConfirmed: true,
		firstName: "Thu Hương",
		lastName: "BS.CKI Trần",
		degrees: ["Doctor"],
		academicTitle: "None",
		position: "StaffDoctor",
		gender: "Female",
		citizenIdentificationNumber: "001090056789",
		dateOfBirth: "1990-03-08T00:00:00.000Z",
		address: "Trung tâm Bệnh Nhiệt Đới, Hà Nội",
		createdAt: "2026-03-01T11:00:00.000Z",
	},
	{
		id: "usr-manager-02",
		doctorId: "doc-manager-02",
		email: "bs.tung@respira.vn",
		phone: "0967890123",
		role: "Manager",
		status: "Active",
		isEmailConfirmed: false,
		firstName: "Thanh Tùng",
		lastName: "TS.BS Phạm",
		degrees: ["PhD", "Doctor"],
		academicTitle: "None",
		position: "DepartmentDeputyHead",
		gender: "Male",
		citizenIdentificationNumber: "001082067890",
		dateOfBirth: "1982-09-18T00:00:00.000Z",
		address: "Khoa Truyền nhiễm, Bệnh viện Bệnh Nhiệt đới TW",
		createdAt: "2026-03-10T16:45:00.000Z",
	},
	{
		id: "usr-doctor-04",
		doctorId: "doc-doctor-04",
		email: "bs.quang@respira.vn",
		phone: "0978901234",
		role: "Doctor",
		status: "Inactive",
		isEmailConfirmed: true,
		firstName: "Đăng Quang",
		lastName: "BS. Đặng",
		degrees: ["Doctor", "Bachelor"],
		academicTitle: "None",
		position: "StaffDoctor",
		gender: "Male",
		citizenIdentificationNumber: "001093078901",
		dateOfBirth: "1993-07-22T00:00:00.000Z",
		address: "Khoa Nội tổng hợp, Bệnh viện Đa khoa Đà Nẵng",
		createdAt: "2026-03-20T09:10:00.000Z",
	},
];

function getStoredUsers(): UserItem[] {
	if (typeof window === "undefined") return INITIAL_USERS;
	try {
		const raw = localStorage.getItem(USERS_STORAGE_KEY);
		if (!raw) {
			localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
			return INITIAL_USERS;
		}
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_USERS;
	} catch {
		return INITIAL_USERS;
	}
}

function saveStoredUsers(users: UserItem[]): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
	} catch (e) {
		console.error("Failed to save users to localStorage:", e);
	}
}

/**
 * Lấy danh sách người dùng với tìm kiếm, lọc vai trò, lọc trạng thái
 */
export async function fetchUsers(
	filters?: UserFilters,
	page: number = 1,
	pageSize: number = 10
): Promise<{ items: UserItem[]; total: number; stats: UserStats }> {
	const allUsers = getStoredUsers();

	let filtered = [...allUsers];

	if (filters?.search) {
		const query = filters.search.trim().toLowerCase();
		filtered = filtered.filter(
			(u) =>
				u.email.toLowerCase().includes(query) ||
				u.phone.toLowerCase().includes(query) ||
				`${u.lastName} ${u.firstName}`.toLowerCase().includes(query) ||
				u.citizenIdentificationNumber.includes(query) ||
				u.address.toLowerCase().includes(query)
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
		managers: allUsers.filter((u) => u.role === "Manager").length,
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
	// Thử gọi API backend thật nếu có doctorId
	try {
		const res = await apiRequest<UserItem>(`/doctors/${id}`);
		if (res) return res;
	} catch {
		// Fallback local store
	}

	const all = getStoredUsers();
	return all.find((u) => u.id === id || u.doctorId === id) || null;
}

/**
 * Tạo người dùng mới qua Saga ProfileCreate hoặc lưu local
 */
export async function createUser(
	payload: CreateUserPayload
): Promise<{ sagaId: string; user: UserItem }> {
	let backendSagaId: string | null = null;

	// Thử gửi multipart form-data tới Backend Saga Orchestrator
	try {
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
		if (payload.avatarFile) {
			formData.append("avatar", payload.avatarFile);
		}

		// Gọi endpoint ProfileCreate
		const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
		const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5016/api/v1").replace(/\/$/, "");

		const response = await fetch(`${API_BASE}/profile/create`, {
			method: "POST",
			headers: {
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
			body: formData,
		});

		if (response.ok) {
			const json = await response.json();
			backendSagaId = json?.data || json?.id;
		}
	} catch (e) {
		console.warn("Backend Saga create is unreachable, falling back to local creation:", e);
	}

	const sagaId = backendSagaId || `saga-create-${Date.now()}`;
	const newId = `usr-${Date.now()}`;
	const newDoctorId = `doc-${Date.now()}`;

	const newUser: UserItem = {
		id: newId,
		doctorId: newDoctorId,
		email: payload.email,
		phone: payload.phone,
		role: payload.role,
		status: "Active",
		isEmailConfirmed: true,
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

	const currentUsers = getStoredUsers();
	saveStoredUsers([newUser, ...currentUsers]);

	return { sagaId, user: newUser };
}

/**
 * Cập nhật thông tin người dùng qua Saga ProfileUpdate hoặc lưu local
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

		const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
		const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5016/api/v1").replace(/\/$/, "");

		const response = await fetch(`${API_BASE}/profile/update`, {
			method: "POST",
			headers: {
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
			body: formData,
		});

		if (response.ok) {
			const json = await response.json();
			backendSagaId = json?.data || json?.id;
		}
	} catch (e) {
		console.warn("Backend Saga update is unreachable, updating local store:", e);
	}

	const currentUsers = getStoredUsers();
	const existing = currentUsers.find((u) => u.id === payload.accountId || u.doctorId === payload.doctorId);

	if (!existing) {
		throw new Error("Không tìm thấy người dùng cần cập nhật");
	}

	const updatedUser: UserItem = {
		...existing,
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
		avatarUrl: payload.avatarFile ? URL.createObjectURL(payload.avatarFile) : existing.avatarUrl,
	};

	const updatedList = currentUsers.map((u) => (u.id === existing.id ? updatedUser : u));
	saveStoredUsers(updatedList);

	return {
		sagaId: backendSagaId || `saga-update-${Date.now()}`,
		user: updatedUser,
	};
}

/**
 * Xóa tài khoản & hồ sơ qua Saga ProfileDelete hoặc local
 */
export async function deleteUser(
	accountId: string,
	doctorId?: string,
	mediaId?: string
): Promise<{ sagaId: string }> {
	let backendSagaId: string | null = null;

	try {
		const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
		const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5016/api/v1").replace(/\/$/, "");

		const response = await fetch(`${API_BASE}/profile/delete`, {
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
		console.warn("Backend Saga delete is unreachable, removing locally:", e);
	}

	const currentUsers = getStoredUsers();
	const remaining = currentUsers.filter((u) => u.id !== accountId && u.doctorId !== doctorId);
	saveStoredUsers(remaining);

	return { sagaId: backendSagaId || `saga-delete-${Date.now()}` };
}

/**
 * Bật/tắt trạng thái Active / Inactive của người dùng
 */
export async function toggleUserStatus(id: string): Promise<UserItem> {
	const currentUsers = getStoredUsers();
	const user = currentUsers.find((u) => u.id === id || u.doctorId === id);
	if (!user) throw new Error("Không tìm thấy người dùng");

	const newStatus: UserStatus = user.status === "Active" ? "Inactive" : "Active";
	const updated: UserItem = { ...user, status: newStatus };

	const updatedList = currentUsers.map((u) => (u.id === user.id ? updated : u));
	saveStoredUsers(updatedList);

	return updated;
}

