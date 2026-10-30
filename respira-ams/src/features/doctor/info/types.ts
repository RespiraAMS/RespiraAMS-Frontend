// ─── WHO AWaRe Classification ──────────────────────────────────────────────
export type AwareClass =
	| "Access"
	| "AccessWatch"
	| "Watch"
	| "Reserve"
	| "Others"
	| "Unclassified";

// ─── Đường dùng ─────────────────────────────────────────────────────────────
export type RouteOfAdministration = "Oral" | "Intravenous" | string;

// ─── Khoảng CrCl / GFR (chức năng thận) ──────────────────────────────────────
export interface ClinicalRange {
	min: number;
	isMinExclusive: boolean;
	max: number;
	isMaxExclusive: boolean;
	unit?: string | null;
}

// ─── Liều dùng (Dosage) từ Backend ──────────────────────────────────────────
export interface DosageResult {
	id: string;
	routeOfAdministration: RouteOfAdministration;
	dose: string;
	/**
	 * Nếu crcl === null, đây là liều chuẩn (standard dose).
	 * Nếu crcl !== null, đây là liều điều chỉnh theo mức lọc cầu thận.
	 */
	crcl: ClinicalRange | null;
}

// ─── Nhóm kháng sinh ────────────────────────────────────────────────────────
export interface AntibioticGroupResult {
	id: string;
	name: string;
	description?: string;
	parentId?: string | null;
	parentName?: string | null;
}

// ─── Kháng sinh trong danh sách phân trang / tìm kiếm ────────────────────────
export interface PagedAntibioticItem {
	id: string;
	name: string;
	antibioticGroup: AntibioticGroupResult;
	classification: AwareClass;
	rank?: number;
}

// ─── Chi tiết kháng sinh từ Backend (GetAntibioticById) ─────────────────────
export interface AntibioticResult {
	id: string;
	name: string;
	antibioticGroup: AntibioticGroupResult;
	classification: AwareClass;
	dosages: DosageResult[];
}

// ─── Pagination Metadata từ Backend ─────────────────────────────────────────
export interface PaginationMetadata {
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	totalItemCount: number;
	pageCount: number;
	currentPage: number;
	pageSize: number;
}

export interface Pagination<T> {
	metadata: PaginationMetadata;
	items: T[];
}

// ─── Chuẩn phản hồi Result<T> từ Backend ────────────────────────────────────
export interface ApiResult<T> {
	statusCode: string;
	error?: {
		statusCode: string;
		message: string;
		details?: unknown;
	} | null;
	data: T;
}
