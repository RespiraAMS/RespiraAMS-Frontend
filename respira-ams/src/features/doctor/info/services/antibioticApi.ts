import { apiRequest, buildQuery } from "@/lib/api";
import {
	AntibioticResult,
	ClinicalRange,
	PagedAntibioticItem,
	Pagination,
	RouteOfAdministration,
} from "../types";

/**
 * Format khoảng lọc cầu thận (CrCl / GFR) sang chuỗi tiếng Việt dễ hiểu
 */
export function formatCrclRange(crcl: ClinicalRange | null): string {
	if (!crcl) {
		return "Liều chuẩn";
	}

	const unit = crcl.unit || "mL/phút";
	const isMaxInf = crcl.max == null || crcl.max >= 999999;
	const isMinZero = crcl.min == null || crcl.min <= 0;

	if (isMaxInf) {
		const symbol = crcl.isMinExclusive ? ">" : "≥";
		return `GFR ${symbol} ${crcl.min} ${unit}`;
	}

	if (isMinZero) {
		const symbol = crcl.isMaxExclusive ? "<" : "≤";
		return `GFR ${symbol} ${crcl.max} ${unit}`;
	}

	const minSymbol = crcl.isMinExclusive ? ">" : "≥";
	const maxSymbol = crcl.isMaxExclusive ? "<" : "≤";
	return `GFR ${minSymbol} ${crcl.min} và ${maxSymbol} ${crcl.max} ${unit}`;
}

/**
 * Dịch đường dùng thuốc sang tiếng Việt
 */
export function translateRoute(route: RouteOfAdministration): string {
	if (route === undefined || route === null || route === "")
		return "Chưa xác định";
	const normalized = String(route).toLowerCase();
	if (normalized === "oral" || normalized === "0") {
		return "Đường uống";
	}
	if (normalized === "intravenous" || normalized === "1") {
		return "Tiêm tĩnh mạch";
	}
	return String(route);
}

/**
 * Lấy danh sách kháng sinh phân trang từ Backend
 * GET /api/v1/antibiotics
 */
export async function fetchAntibiotics(params?: {
	page?: number;
	size?: number;
	antibioticGroupId?: string;
	classification?: string;
}): Promise<Pagination<PagedAntibioticItem>> {
	const data = await apiRequest<Pagination<PagedAntibioticItem>>(
		`/antibiotics${buildQuery({
			Page: params?.page ?? 1,
			Size: params?.size ?? 8,
			AntibioticGroupId: params?.antibioticGroupId,
			Classification: params?.classification,
		})}`
	);
	if (!data || !Array.isArray(data.items)) {
		throw new Error("Phản hồi không hợp lệ từ máy chủ");
	}
	return data;
}

/**
 * Tìm kiếm kháng sinh theo từ khóa
 * GET /api/v1/antibiotics/search
 */
export async function searchAntibiotics(params: {
	searchTerm: string;
	page?: number;
	size?: number;
}): Promise<Pagination<PagedAntibioticItem>> {
	const trimmed = params.searchTerm.trim();
	const page = params.page ?? 1;
	const size = params.size ?? 8;

	if (!trimmed) {
		return fetchAntibiotics({ page, size });
	}

	// Backend yêu cầu searchTerm >= 2 ký tự: với 1 ký tự thì lọc trên dữ liệu thật đã tải.
	if (trimmed.length < 2) {
		const all = await fetchAntibiotics({ page: 1, size: 100 });
		const lower = trimmed.toLowerCase();
		const matched = (all.items || []).filter(
			(item) =>
				item.name?.toLowerCase().includes(lower) ||
				item.antibioticGroup?.name?.toLowerCase().includes(lower) ||
				item.classification?.toLowerCase().includes(lower)
		);
		const pageCount = Math.max(1, Math.ceil(matched.length / size));
		return {
			items: matched.slice((page - 1) * size, page * size),
			metadata: {
				currentPage: page,
				pageSize: size,
				totalItemCount: matched.length,
				pageCount,
				hasPreviousPage: page > 1,
				hasNextPage: page < pageCount,
			},
		};
	}

	const data = await apiRequest<Pagination<PagedAntibioticItem>>(
		`/antibiotics/search${buildQuery({
			SearchTerm: trimmed,
			Page: page,
			Size: size,
		})}`
	);
	if (!data || !Array.isArray(data.items)) {
		throw new Error("Phản hồi không hợp lệ từ máy chủ");
	}
	return data;
}

/**
 * Lấy thông tin chi tiết kháng sinh theo ID
 * GET /api/v1/antibiotics/{id}
 */
export async function fetchAntibioticById(
	id: string
): Promise<AntibioticResult> {
	const data = await apiRequest<AntibioticResult>(`/antibiotics/${id}`);
	if (!data) {
		throw new Error("Không tìm thấy thông tin kháng sinh.");
	}
	return data;
}
