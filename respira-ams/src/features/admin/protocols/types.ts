export type ProtocolFilter = "ALL" | "APPLIED" | "NOT_APPLIED";

export interface ProtocolFormValues {
	name: string;
	code: string;
	description: string;
	version: string;
	publisher: string;
	isApplied: boolean;
}

export function filterToIsApplied(filter: ProtocolFilter): boolean | null {
	if (filter === "APPLIED") return true;
	if (filter === "NOT_APPLIED") return false;
	return null;
}

