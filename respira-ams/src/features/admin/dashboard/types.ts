export interface DashboardMetrics {
	totalAntibiotics: number;
	totalPathogens: number;
	totalAntibioticGroups: number;
	totalClinicalMetrics: number;
	totalUsers: number;
	activeServicesCount: number;
	totalServicesCount: number;
}

export type ServiceHealthStatus = "operational" | "degraded" | "down";

export interface MicroserviceStatus {
	id: string;
	name: string;
	service: string;
	status: ServiceHealthStatus;
	latencyMs: number;
}

export type AuditLogStatus = "success" | "warning" | "error";

export interface AuditLogItem {
	id: string;
	timestamp: string;
	actor: string;
	role: string;
	action: string;
	target: string;
	service: string;
	status: AuditLogStatus;
}

