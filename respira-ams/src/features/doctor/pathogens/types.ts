export type PathogenClassification = "typical" | "atypical";

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

export interface PagedPathogenItemDto {
	id: string;
	name: string;
	description: string;
	isAtypical: boolean;
}

export interface SearchPathogenItemDto {
	id: string;
	name: string;
	description: string;
	isAtypical: boolean;
	rank: number;
}

export interface DoctorPathogenItem {
	id: string;
	name: string;
	description: string;
	classification: PathogenClassification;
}

export interface SuspectedCauseDto {
	id: string;
	pathogenId: string;
	pathogenName: string;
	severity: string;
	treatmentSite: string;
}

export interface RiskFactorDto {
	id: string;
	pathogen: { id: string; name: string };
	criterion: { id: string; name: string; formula: string };
}
