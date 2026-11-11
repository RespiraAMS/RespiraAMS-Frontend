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

export const INITIAL_PATHOGENS: DoctorPathogenItem[] = [
	{
		id: "path-001",
		name: "Streptococcus pneumoniae (Phế cầu)",
		description: "Tác nhân vi khuẩn hàng đầu gây viêm phổi mắc phải tại cộng đồng (CAP)",
		classification: "typical",
	},
	{
		id: "path-002",
		name: "Mycoplasma pneumoniae",
		description: "Vi khuẩn không điển hình thường gặp ở người trẻ tuổi và viêm phổi không triệu chứng rầm rộ",
		classification: "atypical",
	},
	{
		id: "path-003",
		name: "Haemophilus influenzae",
		description: "Trực khuẩn gram âm thường gây đợt cấp COPD và viêm phổi ở người lớn tuổi",
		classification: "typical",
	},
	{
		id: "path-004",
		name: "Legionella pneumophila",
		description: "Vi khuẩn không điển hình phát triển trong hệ thống điều hòa và nguồn nước ô nhiễm",
		classification: "atypical",
	},
	{
		id: "path-005",
		name: "Klebsiella pneumoniae",
		description: "Trực khuẩn gram âm nguy cơ kháng thuốc cao (ESBL, CRE), gặp ở bệnh nhân đái tháo đường, nghiện rượu",
		classification: "typical",
	},
	{
		id: "path-006",
		name: "Pseudomonas aeruginosa (Trực khuẩn mủ xanh)",
		description: "Tác nhân gram âm kháng đa thuốc nguy hiểm ở bệnh nhân giãn phế quản hoặc xơ nang",
		classification: "typical",
	},
];

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
	try {
		const data = await apiRequest<Pagination<PagedPathogenItemDto>>(
			`/pathogens${buildQuery({
				page: params.page,
				size: params.size,
				isAtypical: params.isAtypical,
			})}`
		);
		if (data?.items) {
			return {
				items: (data.items ?? []).map(mapToDoctorPathogen),
				totalCount: data?.metadata?.totalItemCount ?? 0,
				totalPages: Math.max(1, data?.metadata?.pageCount ?? 1),
			};
		}
	} catch (err) {
		console.warn("[PathogensAPI] Backend unavailable, using fallback:", err);
	}

	let filtered = INITIAL_PATHOGENS;
	if (params.isAtypical !== undefined) {
		const targetClass = params.isAtypical ? "atypical" : "typical";
		filtered = filtered.filter((p) => p.classification === targetClass);
	}
	const start = (params.page - 1) * params.size;
	return {
		items: filtered.slice(start, start + params.size),
		totalCount: filtered.length,
		totalPages: Math.max(1, Math.ceil(filtered.length / params.size)),
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

	try {
		const data = await apiRequest<Pagination<SearchPathogenItemDto>>(
			`/pathogens/search${buildQuery({
				page: params.page,
				size: params.size,
				searchTerm: trimmed,
			})}`
		);
		if (data?.items) {
			return {
				items: (data.items ?? []).map(mapToDoctorPathogen),
				totalCount: data?.metadata?.totalItemCount ?? 0,
				totalPages: Math.max(1, data?.metadata?.pageCount ?? 1),
			};
		}
	} catch (err) {
		console.warn("[PathogensAPI] Backend search unavailable, searching locally:", err);
	}

	const lower = trimmed.toLowerCase();
	const filtered = INITIAL_PATHOGENS.filter(
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

export async function fetchSuspectedCauses(
	pathogenId: string
): Promise<SuspectedCauseDto[]> {
	try {
		const data = await apiRequest<Pagination<SuspectedCauseDto>>(
			`/suspected-causes${buildQuery({ pathogenId, page: 1, size: 100 })}`
		);
		return data?.items ?? [];
	} catch (err) {
		console.warn("[PathogensAPI] fetchSuspectedCauses failed, returning empty:", err);
		return [];
	}
}

export async function fetchRiskFactors(
	pathogenId: string
): Promise<RiskFactorDto[]> {
	try {
		const data = await apiRequest<Pagination<RiskFactorDto>>(
			`/risk-factors${buildQuery({ pathogenId, page: 1, size: 100 })}`
		);
		return data?.items ?? [];
	} catch (err) {
		console.warn("[PathogensAPI] fetchRiskFactors failed, returning empty:", err);
		return [];
	}
}
