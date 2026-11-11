export type AuditLogStatus = "success" | "warning" | "error";

export type AuditLogSeverity = "low" | "medium" | "high" | "critical";

export type AuditServiceType =
	| "Clinical"
	| "Auth"
	| "Patient"
	| "Doctor"
	| "Media"
	| "Saga"
	| "Gateway";

export type AuditActionCategory =
	| "Auth"
	| "Profile"
	| "Protocol"
	| "Patient"
	| "AMR"
	| "System"
	| "Media";

export interface AuditLogItem {
	id: string;
	timestamp: string; // ISO 8601
	timeDisplay?: string;
	actor: string;
	actorName: string;
	role: "Admin" | "Doctor" | "Manager" | "System" | "Gateway" | string;
	action: string;
	category: AuditActionCategory;
	target: string;
	service: AuditServiceType;
	status: AuditLogStatus;
	severity: AuditLogSeverity;
	ipAddress: string;
	userAgent?: string;
	correlationId: string;
	durationMs: number;
	requestPayload?: Record<string, unknown> | string;
	responseSummary?: string;
	errorMessage?: string;
}

export interface AuditLogFilters {
	search: string;
	service: string; // "ALL" | AuditServiceType
	status: string; // "ALL" | AuditLogStatus
	severity: string; // "ALL" | AuditLogSeverity
	timeRange: string; // "ALL" | "today" | "24h" | "7d" | "30d"
}

export interface AuditLogStats {
	total: number;
	successCount: number;
	warningCount: number;
	errorCount: number;
	uniqueActorsCount: number;
	successRatePercent: number;
}

export interface ClinicalRollbackChange {
	entityType: string;
	entityId?: string | null;
	operation: "Insert" | "Update" | "Delete" | string;
	description: string;
	currentJson?: string | null;
	targetJson?: string | null;
	isJoinTable: boolean;
}

export interface ClinicalRollbackConflict {
	entityType: string;
	entityId?: string | null;
	reason: string;
}

export interface ClinicalRollbackPreview {
	auditEntryId: string;
	changeSetId: string;
	action: string;
	occurredAt: string;
	changes: ClinicalRollbackChange[];
	conflicts: ClinicalRollbackConflict[];
	canApply: boolean;
}

export interface ClinicalRollbackResult {
	auditEntryId: string;
	changeSetId: string;
	changesApplied: number;
	rollbackAuditEntryId: string;
	completedAt: string;
}


