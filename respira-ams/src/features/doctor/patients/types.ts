export type PatientStatus = "treating" | "recovered" | "deceased";

export type PatientRisk = "normal" | "attention" | "high";

export interface TreatmentMilestone {
	id: string;
	title: string;
	time: string;
	status: "treating" | "completed" | "admitted";
	statusLabel: string;
	type: "active" | "completed" | "admitted";
}

export interface Patient {
	id: string;
	name: string;
	code: string;
	age: number;
	gender: "Nam" | "Nữ";
	status: PatientStatus;
	risk: PatientRisk;
	birthDate?: string;
	bhyt?: string;
	address?: string;
	weightHeight?: string;
	admissionDate?: string;
	diagnosis?: string;
	room?: string;
	notes?: string;
	timeline?: TreatmentMilestone[];
}

export type StatFilter = "all" | "attention" | "high";
