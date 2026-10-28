import { apiRequest, buildQuery } from "@/lib/api";
import {
	AntibioticGroupItem,
	AntibioticGroupSimpleDto,
	AntibioticSummaryDto,
	PagedAntibioticGroupItemDto,
	Pagination,
	SearchAntibioticGroupItemDto,
} from "./types";

export interface PagedAntibioticGroupsResult {
	items: AntibioticGroupItem[];
	totalCount: number;
	totalPages: number;
}

export async function fetchPagedAntibioticGroups(params: {
	page: number;
	size: number;
	parentId?: string | null;
}): Promise<PagedAntibioticGroupsResult> {
	const data = await apiRequest<Pagination<PagedAntibioticGroupItemDto>>(
		`/antibiotic-groups${buildQuery({
			page: params.page,
			size: params.size,
			parentId: params.parentId,
		})}`
	);

	return {
		items: data?.items ?? [],
		totalCount: data?.metadata?.totalItemCount ?? 0,
		totalPages: Math.max(1, data?.metadata?.pageCount ?? 1),
	};
}

export async function searchAntibioticGroups(params: {
	page: number;
	size: number;
	searchTerm: string;
}): Promise<PagedAntibioticGroupsResult> {
	const data = await apiRequest<Pagination<SearchAntibioticGroupItemDto>>(
		`/antibiotic-groups/search${buildQuery({
			page: params.page,
			size: params.size,
			searchTerm: params.searchTerm,
		})}`
	);

	return {
		items: data?.items ?? [],
		totalCount: data?.metadata?.totalItemCount ?? 0,
		totalPages: Math.max(1, data?.metadata?.pageCount ?? 1),
	};
}

export async function fetchAllAntibioticGroupsSimple(): Promise<
	AntibioticGroupSimpleDto[]
> {
	const data = await apiRequest<{
		antibioticGroups: AntibioticGroupSimpleDto[];
	}>("/antibiotic-groups/list");
	return data?.antibioticGroups ?? [];
}

export async function fetchAntibioticsInGroup(
	groupId: string
): Promise<AntibioticSummaryDto[]> {
	const data = await apiRequest<Pagination<AntibioticSummaryDto>>(
		`/antibiotics${buildQuery({
			antibioticGroupId: groupId,
			page: 1,
			size: 100,
		})}`
	);
	return data?.items ?? [];
}

