import { apiRequest, buildQuery } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { API_V1, CLIENT_API_BASE } from "@/lib/api-base";
import {
	DoctorProfile,
	ProfileFormState,
	DegreeTypeValue,
	PositionTypeValue,
	AcademicTitleValue,
	defaultDoctor,
	parseIsoToLocalDate,
} from "./types";

const PROFILE_STORAGE_KEY = "respira_doctor_profile_v1";

export interface BackendDoctorProfileDto {
	id: string;
	accountId: string;
	role?: "Doctor" | "HeadDepartmentDoctor" | string;
	firstName: string;
	lastName: string;
	degrees?: DegreeTypeValue[];
	academicTitle?: AcademicTitleValue;
	position?: PositionTypeValue;
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
}

export interface UpdateProfileApiPayload {
	accountId: string;
	doctorId: string;
	email: string;
	phone: string;
	password?: string;
	firstName: string;
	lastName: string;
	degrees: DegreeTypeValue[] | string[];
	academicTitle: string;
	position: string;
	gender: "Male" | "Female";
	citizenIdentificationNumber: string;
	dateOfBirth?: string | null;
	address: string;
}

export interface SagaStatusResponse {
	sagaId: string;
	step?: number | string;
	accountId?: string;
	doctorId?: string;
	mediaId?: string;
	failureReason?: string | null;
}

export interface DoctorPagedResponse {
	items: DoctorProfile[];
	totalCount: number;
	totalPages: number;
	pageIndex: number;
	hasPreviousPage: boolean;
	hasNextPage: boolean;
}

/**
 * Chuyển đổi dữ liệu Doctor Profile từ Backend sang DoctorProfile của Frontend
 */
export function mapBackendDtoToDoctorProfile(dto: BackendDoctorProfileDto): DoctorProfile {
	const degrees = (dto.degrees && dto.degrees.length > 0 ? dto.degrees : ["Doctor"]) as DegreeTypeValue[];
	const isMale = dto.gender !== "Female";
	const dob = parseIsoToLocalDate(dto.dateOfBirth);

	return {
		id: dto.id,
		doctorId: dto.id,
		accountId: dto.accountId,
		role: dto.role || "Doctor",
		firstName: dto.firstName || "",
		lastName: dto.lastName || "",
		email: dto.email || "",
		phoneNumber: dto.phone || "",
		address: dto.address || "",
		gender: isMale,
		dateOfBirth: dob,
		citizenIdentificationCard: dto.citizenIdentificationNumber || "",
		academicTitle: dto.academicTitle || "None",
		degree: degrees.join(", "),
		degrees,
		position: dto.position || "StaffDoctor",
		specialty: undefined,
		certificates: [],
		educations: [],
		mediaId: dto.mediaId || undefined,
		mediaUrl: dto.avatarUrl || undefined,
		avatarUrl: dto.avatarUrl || undefined,
		accountRole: dto.accountRole || dto.role || "Doctor",
		accountStatus: dto.accountStatus || "Active",
		createdAt: dto.createdAt,
	};
}

/**
 * Lấy hồ sơ từ bộ nhớ đệm LocalStorage
 */
export function getStoredDoctorProfile(): DoctorProfile {
	if (typeof window === "undefined") return defaultDoctor;
	try {
		const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			return { ...defaultDoctor, ...parsed };
		}
	} catch {
		// Bỏ qua lỗi parse
	}
	return defaultDoctor;
}

/**
 * Lưu hồ sơ vào LocalStorage & phát thông báo cập nhật
 */
export function saveStoredDoctorProfile(profile: DoctorProfile): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
		window.dispatchEvent(
			new CustomEvent("respira:profile-updated", { detail: profile })
		);
	} catch {
		// Bỏ qua lỗi storage
	}
}

/**
 * API: Lấy thông tin hồ sơ của Bác sĩ hiện tại đang đăng nhập
 * Sử dụng GET /api/v1/doctors/me
 */
export async function fetchCurrentDoctorProfile(): Promise<DoctorProfile> {
	const currentUser = getUser();
	const stored = getStoredDoctorProfile();

	const isCacheValid = Boolean(
		currentUser &&
		stored &&
		(stored.firstName || stored.lastName) &&
		((stored.accountId && stored.accountId === currentUser.id) ||
			(stored.email &&
				currentUser.email &&
				stored.email.toLowerCase() === currentUser.email.toLowerCase()))
	);

	// 1. Backend: load the profile bound to the authenticated account.
	if (currentUser?.id || currentUser?.email) {
		try {
			const me = await apiRequest<BackendDoctorProfileDto>("/doctors/me");
			if (me?.id) {
				const mapped = mapBackendDtoToDoctorProfile(me);
				fillProfileFromSession(mapped, currentUser);
				if (!mapped.avatarUrl && isCacheValid) {
					mapped.avatarUrl = stored.avatarUrl;
					mapped.mediaUrl = stored.mediaUrl;
				}
				saveStoredDoctorProfile(mapped);
				return mapped;
			}
		} catch (err) {
			console.warn("[Profile] Could not fetch /doctors/me:", err);

			// Fallback for accounts that already cached their doctorId.
			if (isCacheValid && stored.doctorId && !stored.doctorId.startsWith("pat-")) {
				try {
					const directRes = await apiRequest<BackendDoctorProfileDto>(
						`/doctors/${stored.doctorId}`
					);
					if (directRes?.id) {
						const mapped = mapBackendDtoToDoctorProfile(directRes);
						fillProfileFromSession(mapped, currentUser);
						saveStoredDoctorProfile(mapped);
						return mapped;
					}
				} catch {
					// Ignore direct lookup errors.
				}
			}
		}
	}

	if (isCacheValid) {
		return stored;
	}

	if (currentUser?.email) {
		return {
			...defaultDoctor,
			id: currentUser.id || undefined,
			doctorId: currentUser.id || undefined,
			accountId: currentUser.id || undefined,
			email: currentUser.email,
			firstName: "",
			lastName: "",
			specialty: "Khoa Hồi sức Tích cực & Hô hấp",
		};
	}

	return defaultDoctor;
}

function fillProfileFromSession(
	profile: DoctorProfile,
	currentUser: ReturnType<typeof getUser>
): void {
	if (!currentUser) return;
	if (currentUser.email && !profile.email) profile.email = currentUser.email;
	if (currentUser.phoneNumber && !profile.phoneNumber) {
		profile.phoneNumber = currentUser.phoneNumber;
	}
	if (!profile.accountRole) profile.accountRole = currentUser.role || profile.role;
	if (!profile.accountStatus) profile.accountStatus = "Active";
}

/**
 * API: Lấy chi tiết hồ sơ Bác sĩ theo ID
 * GET /api/v1/doctors/{doctorId}
 */
export async function fetchDoctorProfileById(
	doctorId: string
): Promise<DoctorProfile | null> {
	try {
		const res = await apiRequest<BackendDoctorProfileDto>(`/doctors/${doctorId}`);
		if (res) return mapBackendDtoToDoctorProfile(res);
	} catch {
		// Fallback
	}
	return null;
}

/**
 * API: Lấy danh sách Bác sĩ phân trang kèm bộ lọc
 * GET /api/v1/doctors?page=1&size=10&role=...&gender=...&academicTitle=...&position=...
 */
export async function fetchPagedDoctors(params?: {
	page?: number;
	size?: number;
	role?: string;
	gender?: string;
	academicTitle?: string;
	position?: string;
}): Promise<DoctorPagedResponse> {
	try {
		const res = await apiRequest<{
			items?: BackendDoctorProfileDto[];
			metadata?: {
				totalItemCount?: number;
				pageCount?: number;
				currentPage?: number;
				hasPreviousPage?: boolean;
				hasNextPage?: boolean;
			};
			pageIndex?: number;
			totalPages?: number;
			totalCount?: number;
			hasPreviousPage?: boolean;
			hasNextPage?: boolean;
		}>(
			`/doctors${buildQuery({
				page: params?.page ?? 1,
				size: params?.size ?? 10,
				role: params?.role,
				gender: params?.gender,
				academicTitle: params?.academicTitle,
				position: params?.position,
			})}`
		);

		if (res?.items) {
			return {
				items: res.items.map(mapBackendDtoToDoctorProfile),
				totalCount: res.metadata?.totalItemCount ?? res.totalCount ?? res.items.length,
				totalPages: res.metadata?.pageCount ?? res.totalPages ?? 1,
				pageIndex: res.metadata?.currentPage ?? res.pageIndex ?? 1,
				hasPreviousPage:
					res.metadata?.hasPreviousPage ?? res.hasPreviousPage ?? false,
				hasNextPage: res.metadata?.hasNextPage ?? res.hasNextPage ?? false,
			};
		}
	} catch {
		// /doctors chỉ dành cho Admin; các vai trò khác nhận danh sách rỗng
		// và dùng tìm kiếm (/doctors/search) để tra cứu đồng nghiệp.
	}

	return {
		items: [],
		totalCount: 0,
		totalPages: 0,
		pageIndex: 1,
		hasPreviousPage: false,
		hasNextPage: false,
	};
}

/**
 * API: Tìm kiếm hồ sơ Bác sĩ theo từ khóa
 * GET /api/v1/doctors/search?searchTerm=...&page=...&size=...
 */
export async function searchDoctorProfiles(
	searchTerm: string,
	page: number = 1,
	size: number = 10
): Promise<{ items: DoctorProfile[]; total: number }> {
	try {
		const res = await apiRequest<{
			items?: BackendDoctorProfileDto[];
			metadata?: { totalItemCount?: number };
			totalCount?: number;
		}>(`/doctors/search${buildQuery({ searchTerm: searchTerm.trim(), page, size })}`);

		if (res?.items) {
			return {
				items: res.items.map(mapBackendDtoToDoctorProfile),
				total: res.totalCount ?? res.metadata?.totalItemCount ?? res.items.length,
			};
		}
	} catch {
		// Fallback
	}
	return { items: [], total: 0 };
}

/**
 * API: Kiểm tra trạng thái thực thi của Saga Profile Update
 * GET /api/v1/profile/update/{sagaId}
 */
export async function getProfileUpdateSagaStatus(
	sagaId: string
): Promise<SagaStatusResponse | null> {
	try {
		return await apiRequest<SagaStatusResponse>(`/profile/update/${sagaId}`);
	} catch {
		return null;
	}
}

/**
 * API: Gửi email xác thực tài khoản
 * POST /api/v1/auth/email-verification
 */
export async function sendEmailVerification(email: string): Promise<boolean> {
	try {
		await apiRequest<boolean>("/auth/email-verification", {
			method: "POST",
			body: { email },
		});
		return true;
	} catch {
		return false;
	}
}

/**
 * API: Cập nhật thông tin Bác sĩ qua phân tán Saga của Backend
 * POST /api/v1/profile/update (multipart/form-data: request JSON + avatar file)
 */
export async function updateDoctorProfile(
	currentDoctor: DoctorProfile,
	form: ProfileFormState,
	avatarFile?: File | null
): Promise<{ sagaId: string; profile: DoctorProfile }> {
	const currentUser = getUser();

	const accountId =
		currentDoctor.accountId ||
		currentUser?.id ||
		"018f0a00-0000-7000-8000-000000000002";

	const doctorId =
		currentDoctor.doctorId ||
		currentDoctor.id ||
		"018f0a00-0000-7000-8000-000000000001";

	const requestPayload: UpdateProfileApiPayload = {
		accountId,
		doctorId,
		email: form.email,
		phone: form.phoneNumber,
		password: form.newPassword?.trim() ? form.newPassword.trim() : undefined,
		firstName: form.firstName.trim(),
		lastName: form.lastName.trim(),
		degrees: form.degrees,
		academicTitle: form.academicTitle,
		position: form.position,
		gender: form.gender ? "Male" : "Female",
		citizenIdentificationNumber: form.citizenIdentificationCard.trim(),
		dateOfBirth: form.dateOfBirth ? `${form.dateOfBirth}T00:00:00.000Z` : null,
		address: form.address.trim(),
	};

	let backendSagaId: string | null = null;

	// 1. Gửi tới endpoint Saga Profile Update của Backend
	try {
		const formData = new FormData();
		formData.append("request", JSON.stringify(requestPayload));
		if (avatarFile) {
			formData.append("avatar", avatarFile);
		}

		const API_BASE = typeof window !== "undefined" ? CLIENT_API_BASE : API_V1;

		const response = await fetch(`${API_BASE}/profile/update`, {
			method: "POST",
			signal: AbortSignal.timeout(30000),
			headers: {
				Accept: "application/json",
			},
			body: formData,
		});

		if (response.ok) {
			const json = await response.json();
			backendSagaId = json?.data || json?.id || null;
		} else {
			const errorJson = await response.json().catch(() => null);
			const errMsg =
				response.status === 401
					? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
					: errorJson?.error?.description ||
					  errorJson?.message ||
					  `Lỗi máy chủ (${response.status})`;
			console.error("Saga profile update error:", errMsg);
			throw new Error(errMsg);
		}
	} catch (err) {
		console.error("Could not reach backend profile update saga:", err);
		throw err;
	}

	// 2. Tạo đối tượng hồ sơ đã cập nhật
	const updatedProfile: DoctorProfile = {
		...currentDoctor,
		accountId,
		doctorId,
		firstName: form.firstName,
		lastName: form.lastName,
		email: form.email,
		phoneNumber: form.phoneNumber,
		address: form.address,
		position: form.position,
		academicTitle: form.academicTitle,
		citizenIdentificationCard: form.citizenIdentificationCard,
		dateOfBirth: form.dateOfBirth,
		gender: form.gender,
		degrees: form.degrees,
		degree: form.degrees.join(", "),
		mediaUrl: avatarFile ? URL.createObjectURL(avatarFile) : currentDoctor.mediaUrl,
		avatarUrl: avatarFile ? URL.createObjectURL(avatarFile) : currentDoctor.avatarUrl,
	};

	// 3. Lưu vào local storage và phát event đồng bộ
	saveStoredDoctorProfile(updatedProfile);

	return {
		sagaId: backendSagaId || `saga-update-${Date.now()}`,
		profile: updatedProfile,
	};
}
