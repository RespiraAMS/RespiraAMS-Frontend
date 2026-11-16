import { apiRequest, buildQuery } from "@/lib/api";
import {
	DoctorPathogenItem,
	PagedPathogenItemDto,
	Pagination,
	RiskFactorDto,
	SuspectedCauseDto,
	SearchPathogenItemDto,
} from "./types";

export interface PagedPathogensResult {
	items: DoctorPathogenItem[];
	totalCount: number;
	totalPages: number;
}

function mapToDoctorPathogen(
	dto: PagedPathogenItemDto | SearchPathogenItemDto
): DoctorPathogenItem {
	return {
		id: dto.id,
		name: dto.name,
		description: dto.description,
		classification: dto.isAtypical ? "atypical" : "typical",
	};
}

function toResult(
	data: Pagination<PagedPathogenItemDto | SearchPathogenItemDto> | undefined
): PagedPathogensResult {
	if (!data || !Array.isArray(data.items)) {
		throw new Error("Phản hồi không hợp lệ từ máy chủ.");
	}
	return {
		items: data.items.map(mapToDoctorPathogen),
		totalCount: data.metadata?.totalItemCount ?? data.items.length,
		totalPages: Math.max(1, data.metadata?.pageCount ?? 1),
	};
}

export async function fetchPagedPathogens(params: {
	page: number;
	size: number;
	isAtypical?: boolean;
}): Promise<PagedPathogensResult> {
	const data = await apiRequest<Pagination<PagedPathogenItemDto>>(
		`/pathogens${buildQuery({
			page: params.page,
			size: params.size,
			isAtypical: params.isAtypical,
		})}`
	);
	return toResult(data);
}

export async function searchPathogens(params: {
	page: number;
	size: number;
	searchTerm: string;
}): Promise<PagedPathogensResult> {
	const trimmed = params.searchTerm.trim();
	if (!trimmed) {
		return fetchPagedPathogens({ page: params.page, size: params.size });
	}

	// Backend yêu cầu searchTerm >= 2 ký tự: với 1 ký tự thì lọc trên dữ liệu thật đã tải.
	if (trimmed.length < 2) {
		const data = await fetchPagedPathogens({ page: 1, size: 100 });
		const lower = trimmed.toLowerCase();
		const filtered = data.items.filter(
			(p) =>
				p.name?.toLowerCase().includes(lower) ||
				p.description?.toLowerCase().includes(lower)
		);
		const start = (params.page - 1) * params.size;
		return {
			items: filtered.slice(start, start + params.size),
			totalCount: filtered.length,
			totalPages: Math.max(1, Math.ceil(filtered.length / params.size)),
		};
	}

	const data = await apiRequest<Pagination<SearchPathogenItemDto>>(
		`/pathogens/search${buildQuery({
			page: params.page,
			size: params.size,
			searchTerm: trimmed,
		})}`
	);
	return toResult(data);
}

export async function fetchSuspectedCauses(
	pathogenId: string
): Promise<SuspectedCauseDto[]> {
	const data = await apiRequest<Pagination<SuspectedCauseDto>>(
		`/suspected-causes${buildQuery({ pathogenId, page: 1, size: 100 })}`
	);
	return data?.items ?? [];
}

export async function fetchRiskFactors(
	pathogenId: string
): Promise<RiskFactorDto[]> {
	const data = await apiRequest<Pagination<RiskFactorDto>>(
		`/risk-factors${buildQuery({ pathogenId, page: 1, size: 100 })}`
	);
	return data?.items ?? [];
}
