export type AwareClass = "Access" | "Watch" | "Reserve";

export interface GfrAdjustment {
	range: string;
	route: string;
	label: string;
}

export interface AntibioticLookupItem {
	id: string;
	name: string;
	subtitle: string;
	group: string;
	aware: AwareClass;
	dosage: {
		route: string;
		standard: string;
		max: string;
	};
	gfr: GfrAdjustment[];
}
