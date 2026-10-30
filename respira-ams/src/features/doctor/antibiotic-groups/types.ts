export interface PaginationMetadata {
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	totalItemCount: number;
	pageCount: number;
	currentPage: number;
	pageSize: number;
}

export interface Pagination<T> {
	metadata: PaginationMetadata;
	items: T[];
}

export interface PagedAntibioticGroupItemDto {
	id: string;
	name: string;
	parentId: string | null;
	parentName: string | null;
	description: string;
}

export interface SearchAntibioticGroupItemDto {
	id: string;
	name: string;
	parentId: string | null;
	parentName: string | null;
	description: string;
	rank: number;
}

export interface AntibioticGroupSimpleDto {
	id: string;
	name: string;
}

export interface AntibioticGroupItem {
	id: string;
	name: string;
	description: string;
	parentId: string | null;
	parentName: string | null;
}

export interface AntibioticSummaryDto {
	id: string;
	name: string;
	classification: string;
}
