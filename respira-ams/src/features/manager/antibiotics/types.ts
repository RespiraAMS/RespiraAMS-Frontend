// ─── AWaRe Category ───────────────────────────────────────────────────────────

export enum AwareCategory {
	Access = "Access",
	AccessWatch = "AccessWatch",
	Watch = "Watch",
	Reserve = "Reserve",
	Others = "Others",
	Unclassified = "Unclassified",
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AntibioticItem {
	id: string;
	name: string;
	antibioticSpectrum: {
		id: string;
		name: string;
		description: string;
	};
	category: AwareCategory | string;
	routeOfAdministrations: string[];
	dosages: Record<string, string[]>;
}

export interface CreateAntibioticRequest {
	name: string;
	antibioticSpectrumId: string;
	category: AwareCategory;
	dosages: Record<string, string[]>;
}

// ─── Mock Spectra (dùng để populate dropdown) ─────────────────────────────────

export const MOCK_SPECTRA = [
	{ id: "sp-1", name: "Gram-dương (Gram-positive)" },
	{ id: "sp-2", name: "Gram-âm (Gram-negative)" },
	{ id: "sp-3", name: "Phổ rộng (Broad-spectrum)" },
	{ id: "sp-4", name: "Kỵ khí (Anaerobic)" },
	{ id: "sp-5", name: "Kháng MRSA (Anti-MRSA)" },
];

// ─── Mock Antibiotics ─────────────────────────────────────────────────────────

export const MOCK_ANTIBIOTICS: AntibioticItem[] = [
	{
		id: "1",
		name: "Amoxicillin",
		antibioticSpectrum: { id: "sp-1", name: "Gram-dương (Gram-positive)", description: "" },
		category: AwareCategory.Access,
		routeOfAdministrations: ["oral"],
		dosages: { oral: ["500 mg mỗi 8h", "875 mg mỗi 12h"] },
	},
	{
		id: "2",
		name: "Ciprofloxacin",
		antibioticSpectrum: { id: "sp-3", name: "Phổ rộng (Broad-spectrum)", description: "" },
		category: AwareCategory.Watch,
		routeOfAdministrations: ["oral", "intravenous"],
		dosages: {
			oral: ["500 mg mỗi 12h"],
			intravenous: ["400 mg mỗi 12h"],
		},
	},
	{
		id: "3",
		name: "Meropenem",
		antibioticSpectrum: { id: "sp-3", name: "Phổ rộng (Broad-spectrum)", description: "" },
		category: AwareCategory.Reserve,
		routeOfAdministrations: ["intravenous"],
		dosages: { intravenous: ["1 g mỗi 8h", "2 g mỗi 8h (nặng)"] },
	},
	{
		id: "4",
		name: "Vancomycin",
		antibioticSpectrum: { id: "sp-5", name: "Kháng MRSA (Anti-MRSA)", description: "" },
		category: AwareCategory.Watch,
		routeOfAdministrations: ["intravenous"],
		dosages: { intravenous: ["15–20 mg/kg mỗi 8–12h"] },
	},
	{
		id: "5",
		name: "Metronidazole",
		antibioticSpectrum: { id: "sp-4", name: "Kỵ khí (Anaerobic)", description: "" },
		category: AwareCategory.Access,
		routeOfAdministrations: ["oral", "intravenous"],
		dosages: {
			oral: ["500 mg mỗi 8h"],
			intravenous: ["500 mg mỗi 8h"],
		},
	},
	{
		id: "6",
		name: "Ceftriaxone",
		antibioticSpectrum: { id: "sp-2", name: "Gram-âm (Gram-negative)", description: "" },
		category: AwareCategory.Watch,
		routeOfAdministrations: ["intravenous"],
		dosages: { intravenous: ["1–2 g mỗi 24h"] },
	},
];
