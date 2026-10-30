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
	const data = await apiRequest<Pagination<SearchPathogenItemDto>>(
		`/pathogens/search${buildQuery({
			page: params.page,
			size: params.size,
			searchTerm: params.searchTerm,
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
