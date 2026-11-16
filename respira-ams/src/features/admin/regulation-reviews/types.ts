export interface RegulationReviewItem {
	id: string;
	email: string;
	phone: string;
	role: "MedicalRegulationReviewer";
	status: "Active" | "Inactive";
	isEmailConfirmed: boolean;
	isDeleted?: boolean;
	createdAt?: string;
}

export interface CreateRegulationReviewPayload {
	email: string;
	password: string;
	phone: string;
}

export interface UpdateRegulationReviewPayload {
	accountId: string;
	email: string;
	phone: string;
	password?: string;
	status?: "Active" | "Inactive";
}

export interface RegulationReviewFilters {
	search: string;
	status: string;
}

export interface RegulationReviewStats {
	total: number;
	active: number;
	inactive: number;
	emailConfirmed: number;
}
