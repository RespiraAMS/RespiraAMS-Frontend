import { API_BASE_URL } from "@/lib/api-config";
import {
	AntibioticResult,
	ApiResult,
	ClinicalRange,
	PagedAntibioticItem,
	Pagination,
	RouteOfAdministration,
} from "../types";
import { FALLBACK_ANTIBIOTICS } from "../mockData";

/**
 * Format khoảng lọc cầu thận (CrCl / GFR) sang chuỗi tiếng Việt dễ hiểu
 */
export function formatCrclRange(crcl: ClinicalRange | null): string {
	if (!crcl) {
		return "Liều chuẩn";
	}

	const unit = crcl.unit || "mL/phút";
	const isMaxInf = crcl.max >= 999999 || crcl.max == null;
	const isMinZero = crcl.min <= 0 || crcl.min == null;

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
	if (!route) return "Chưa xác định";
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
	const page = params?.page ?? 1;
	const size = params?.size ?? 8;
	const query = new URLSearchParams({
		Page: page.toString(),
		Size: size.toString(),
	});

	if (params?.antibioticGroupId) {
		query.append("AntibioticGroupId", params.antibioticGroupId);
	}
	if (params?.classification) {
		query.append("Classification", params.classification);
	}

	const url = `${API_BASE_URL}/antibiotics?${query.toString()}`;

	try {
		const res = await fetch(url, {
			method: "GET",
			headers: {
				Accept: "application/json",
			},
			cache: "no-store",
		});

		if (!res.ok) {
			throw new Error(`API error: ${res.status} ${res.statusText}`);
		}

		const json: ApiResult<Pagination<PagedAntibioticItem>> = await res.json();
		if (json.data && Array.isArray(json.data.items)) {
			return json.data;
		}
		throw new Error("Phản hồi không hợp lệ từ máy chủ");
	} catch (err) {
		console.warn(
			`[AntibioticAPI] Không thể kết nối tới ${url}. Sử dụng dữ liệu dự phòng.`,
			err
		);
		return getFallbackPagination(page, size);
	}
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
	if (!trimmed) {
		return fetchAntibiotics({ page: params.page, size: params.size });
	}

	const page = params.page ?? 1;
	const size = params.size ?? 8;
	const query = new URLSearchParams({
		SearchTerm: trimmed,
		Page: page.toString(),
		Size: size.toString(),
	});

	const url = `${API_BASE_URL}/antibiotics/search?${query.toString()}`;

	try {
		const res = await fetch(url, {
			method: "GET",
			headers: {
				Accept: "application/json",
			},
			cache: "no-store",
		});

		if (!res.ok) {
			throw new Error(`API error: ${res.status} ${res.statusText}`);
		}

		const json: ApiResult<Pagination<PagedAntibioticItem>> = await res.json();
		if (json.data && Array.isArray(json.data.items)) {
			return json.data;
		}
		throw new Error("Phản hồi không hợp lệ từ máy chủ");
	} catch (err) {
		console.warn(
			`[AntibioticAPI] Tìm kiếm thất bại tại ${url}. Lọc dữ liệu dự phòng.`,
			err
		);
		const filtered = FALLBACK_ANTIBIOTICS.filter((a) =>
			a.name.toLowerCase().includes(trimmed.toLowerCase())
		);
		const total = filtered.length;
		const pageCount = Math.max(1, Math.ceil(total / size));
		const paged = filtered.slice((page - 1) * size, page * size).map((a) => ({
			id: a.id,
			name: a.name,
			antibioticGroup: a.antibioticGroup,
			classification: a.classification,
		}));

		return {
			metadata: {
				currentPage: page,
				pageSize: size,
				pageCount,
				totalItemCount: total,
				hasNextPage: page < pageCount,
				hasPreviousPage: page > 1,
			},
			items: paged,
		};
	}
}

/**
 * Lấy thông tin chi tiết kháng sinh theo ID
 * GET /api/v1/antibiotics/{id}
 */
export async function fetchAntibioticById(
	id: string
): Promise<AntibioticResult | null> {
	if (!id) return null;

	const url = `${API_BASE_URL}/antibiotics/${id}`;

	try {
		const res = await fetch(url, {
			method: "GET",
			headers: {
				Accept: "application/json",
			},
			cache: "no-store",
		});

		if (res.status === 404) {
			return null;
		}

		if (!res.ok) {
			throw new Error(`API error: ${res.status} ${res.statusText}`);
		}

		const json: ApiResult<AntibioticResult> = await res.json();
		if (json.data) {
			return json.data;
		}
		return null;
	} catch (err) {
		console.warn(
			`[AntibioticAPI] Không thể tải chi tiết kháng sinh ${id} từ ${url}. Thử tìm trong dữ liệu dự phòng.`,
			err
		);
		const found = FALLBACK_ANTIBIOTICS.find(
			(a) => a.id.toLowerCase() === id.toLowerCase()
		);
		return found ?? null;
	}
}

function getFallbackPagination(
	page: number,
	size: number
): Pagination<PagedAntibioticItem> {
	const total = FALLBACK_ANTIBIOTICS.length;
	const pageCount = Math.max(1, Math.ceil(total / size));
	const items = FALLBACK_ANTIBIOTICS.slice(
		(page - 1) * size,
		page * size
	).map((a) => ({
		id: a.id,
		name: a.name,
		antibioticGroup: a.antibioticGroup,
		classification: a.classification,
	}));

	return {
		metadata: {
			currentPage: page,
			pageSize: size,
			pageCount,
			totalItemCount: total,
			hasNextPage: page < pageCount,
			hasPreviousPage: page > 1,
		},
		items,
	};
}
