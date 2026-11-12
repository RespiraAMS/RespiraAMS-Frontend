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

export const INITIAL_ANTIBIOTIC_GROUPS: AntibioticGroupItem[] = [
	{
		id: "grp-001",
		name: "Beta-lactam (Penicillins & Cephalosporins)",
		description: "Nhóm kháng sinh diệt khuẩn ức chế tổng hợp thành tế bào vi khuẩn",
		parentId: null,
		parentName: null,
	},
	{
		id: "grp-002",
		name: "Macrolides (Azithromycin, Clarithromycin)",
		description: "Ức chế tổng hợp protein vi khuẩn tại tiểu phần ribosome 50S, hiệu quả với tác nhân không điển hình",
		parentId: null,
		parentName: null,
	},
	{
		id: "grp-003",
		name: "Fluoroquinolones hô hấp (Levofloxacin, Moxifloxacin)",
		description: "Ức chế DNA gyrase và topoisomerase IV của vi khuẩn, phổ rộng cả gram âm và gram dương",
		parentId: null,
		parentName: null,
	},
	{
		id: "grp-004",
		name: "Aminoglycosides (Amikacin, Gentamicin)",
		description: "Kháng sinh diệt khuẩn phụ thuộc nồng độ, phối hợp trong nhiễm khuẩn gram âm nặng",
		parentId: null,
		parentName: null,
	},
	{
		id: "grp-005",
		name: "Carbapenems (Meropenem, Imipenem)",
		description: "Kháng sinh phổ cực rộng dự trữ cho các trường hợp nhiễm khuẩn đa kháng hoặc sốc nhiễm khuẩn",
		parentId: null,
		parentName: null,
	},
];

export async function fetchPagedAntibioticGroups(params: {
	page: number;
	size: number;
	parentId?: string | null;
}): Promise<PagedAntibioticGroupsResult> {
	try {
		const data = await apiRequest<Pagination<PagedAntibioticGroupItemDto>>(
			`/antibiotic-groups${buildQuery({
				page: params.page,
				size: params.size,
				parentId: params.parentId,
			})}`
		);
		if (data?.items) {
			return {
				items: data.items ?? [],
				totalCount: data?.metadata?.totalItemCount ?? 0,
				totalPages: Math.max(1, data?.metadata?.pageCount ?? 1),
			};
		}
	} catch (err) {
		console.warn("[AntibioticGroupsAPI] Backend unavailable, using fallback:", err instanceof Error ? err.message : String(err));
	}

	const start = (params.page - 1) * params.size;
	return {
		items: INITIAL_ANTIBIOTIC_GROUPS.slice(start, start + params.size),
		totalCount: INITIAL_ANTIBIOTIC_GROUPS.length,
		totalPages: Math.max(1, Math.ceil(INITIAL_ANTIBIOTIC_GROUPS.length / params.size)),
	};
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

	if (trimmed.length < 2) {
		const list = await fetchPagedAntibioticGroups({ page: 1, size: 50 });
		const lower = trimmed.toLowerCase();
		const matched = list.items.filter(
			(g) =>
				g.name?.toLowerCase().includes(lower) ||
				g.description?.toLowerCase().includes(lower)
		);
		return {
			items: matched,
			totalCount: matched.length,
			totalPages: 1,
		};
	}

	try {
		const data = await apiRequest<Pagination<SearchAntibioticGroupItemDto>>(
			`/antibiotic-groups/search${buildQuery({
				page: params.page,
				size: params.size,
				searchTerm: trimmed,
			})}`
		);
		if (data?.items) {
			return {
				items: data.items ?? [],
				totalCount: data?.metadata?.totalItemCount ?? 0,
				totalPages: Math.max(1, data?.metadata?.pageCount ?? 1),
			};
		}
	} catch (err) {
		console.warn("[AntibioticGroupsAPI] Backend search failed, searching locally:", err);
	}

	const lower = trimmed.toLowerCase();
	const matched = INITIAL_ANTIBIOTIC_GROUPS.filter(
		(g) =>
			g.name?.toLowerCase().includes(lower) ||
			g.description?.toLowerCase().includes(lower)
	);
	const start = (params.page - 1) * params.size;
	return {
		items: matched.slice(start, start + params.size),
		totalCount: matched.length,
		totalPages: Math.max(1, Math.ceil(matched.length / params.size)),
	};
}

export async function fetchAllAntibioticGroupsSimple(): Promise<
	AntibioticGroupSimpleDto[]
> {
	try {
		const data = await apiRequest<{
			antibioticGroups: AntibioticGroupSimpleDto[];
		}>("/antibiotic-groups/list");
		if (data?.antibioticGroups) return data.antibioticGroups;
	} catch (err) {
		console.warn("[AntibioticGroupsAPI] fetchAllAntibioticGroupsSimple failed:", err);
	}
	return INITIAL_ANTIBIOTIC_GROUPS.map((g) => ({ id: g.id, name: g.name }));
}

export async function fetchAntibioticsInGroup(
	groupId: string
): Promise<AntibioticSummaryDto[]> {
	try {
		const data = await apiRequest<Pagination<AntibioticSummaryDto>>(
			`/antibiotics${buildQuery({
				antibioticGroupId: groupId,
				page: 1,
				size: 100,
			})}`
		);
		return data?.items ?? [];
	} catch (err) {
		console.warn("[AntibioticGroupsAPI] fetchAntibioticsInGroup failed:", err);
		return [];
	}
}
