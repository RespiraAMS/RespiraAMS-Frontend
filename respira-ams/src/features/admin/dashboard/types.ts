export interface DashboardMetrics {
	totalPatients: number;
	totalAntibiotics: number;
	totalPathogens: number;
	totalAntibioticGroups: number;
	totalTreatments: number;
	totalUsers: number;
	systemUptime: string;
	activeServicesCount: number;
	totalServicesCount: number;
}

export type ServiceHealthStatus = "operational" | "degraded" | "down";

export interface MicroserviceStatus {
	id: string;
	name: string;
	service: string;
	description: string;
	port: number | string;
	status: ServiceHealthStatus;
	latencyMs: number;
	uptime: string;
	version: string;
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
	ipAddress: string;
}

