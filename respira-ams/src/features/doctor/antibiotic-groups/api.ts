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

function toResult(
	data: Pagination<PagedAntibioticGroupItemDto | SearchAntibioticGroupItemDto> | undefined
): PagedAntibioticGroupsResult {
	if (!data || !Array.isArray(data.items)) {
		throw new Error("Phản hồi không hợp lệ từ máy chủ.");
	}
	return {
		items: data.items.map((dto) => ({
			id: dto.id,
			name: dto.name,
			description: dto.description,
			parentId: dto.parentId,
			parentName: dto.parentName,
		})),
		totalCount: data.metadata?.totalItemCount ?? data.items.length,
		totalPages: Math.max(1, data.metadata?.pageCount ?? 1),
	};
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
	return toResult(data);
}

export async function searchAntibioticGroups(params: {
	page: number;
	size: number;
	searchTerm: string;
}): Promise<PagedAntibioticGroupsResult> {
	const trimmed = params.searchTerm.trim();
	if (!trimmed) {
		return fetchPagedAntibioticGroups({ page: params.page, size: params.size });
	}

	// Backend yêu cầu searchTerm >= 2 ký tự: với 1 ký tự thì lọc trên dữ liệu thật đã tải.
	if (trimmed.length < 2) {
		const data = await fetchPagedAntibioticGroups({ page: 1, size: 100 });
		const lower = trimmed.toLowerCase();
		const matched = data.items.filter(
			(g) =>
				g.name?.toLowerCase().includes(lower) ||
				g.description?.toLowerCase().includes(lower) ||
				g.parentName?.toLowerCase().includes(lower)
		);
		const start = (params.page - 1) * params.size;
		return {
			items: matched.slice(start, start + params.size),
			totalCount: matched.length,
			totalPages: Math.max(1, Math.ceil(matched.length / params.size)),
		};
	}

	const data = await apiRequest<Pagination<SearchAntibioticGroupItemDto>>(
		`/antibiotic-groups/search${buildQuery({
			page: params.page,
			size: params.size,
			searchTerm: trimmed,
		})}`
	);
	return toResult(data);
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
