export type PathogenClassification = "typical" | "atypical";

export interface DoctorPathogenItem {
	id: string;
	name: string;
	description: string;
	classification: PathogenClassification;
	characteristics?: string;
	commonDiseases?: string[];
	recommendedAntibiotics?: string[];
}
