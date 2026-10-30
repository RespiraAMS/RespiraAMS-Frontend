import { apiRequest } from "@/lib/api";

export interface PaginationMetadata {
	totalItemCount: number;
	pageCount: number;
	currentPage: number;
	pageSize: number;
}

export interface Pagination<T> {
	metadata: PaginationMetadata;
	items: T[];
}

export interface PathogenItemDto {
	id: string;
	name: string;
	description: string;
	isAtypical: boolean;
}

export async function fetchTotalPatients(): Promise<number> {
	try {
		const res = await apiRequest<Pagination<unknown>>("/patients?page=1&size=1");
		return res?.metadata?.totalItemCount ?? 0;
	} catch {
		return 0;
	}
}

export async function fetchTopPathogens(): Promise<PathogenItemDto[]> {
	try {
		const res = await apiRequest<Pagination<PathogenItemDto>>("/pathogens?page=1&size=5");
		return res?.items ?? [];
	} catch {
		return [];
	}
}

