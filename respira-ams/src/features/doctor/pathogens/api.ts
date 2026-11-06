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

	return {
		items: (data?.items ?? []).map(mapToDoctorPathogen),
		totalCount: data?.metadata?.totalItemCount ?? 0,
		totalPages: Math.max(1, data?.metadata?.pageCount ?? 1),
	};
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

	// Backend validator requires searchTerm >= 2 characters on /pathogens/search.
	// For 1 character search, fetch standard list and filter locally to avoid 400 Bad Request.
	if (trimmed.length < 2) {
		const data = await fetchPagedPathogens({ page: 1, size: 50 });
		const lower = trimmed.toLowerCase();
		const filtered = data.items.filter(
			(p) =>
				p.name?.toLowerCase().includes(lower) ||
				p.description?.toLowerCase().includes(lower)
		);
		return {
			items: filtered,
			totalCount: filtered.length,
			totalPages: 1,
		};
	}

	const data = await apiRequest<Pagination<SearchPathogenItemDto>>(
		`/pathogens/search${buildQuery({
			page: params.page,
			size: params.size,
			searchTerm: trimmed,
		})}`
	);

	return {
		items: (data?.items ?? []).map(mapToDoctorPathogen),
		totalCount: data?.metadata?.totalItemCount ?? 0,
		totalPages: Math.max(1, data?.metadata?.pageCount ?? 1),
	};
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
