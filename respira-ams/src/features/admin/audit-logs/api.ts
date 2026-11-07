import { apiRequest } from "@/lib/api";
import {
	AuditLogFilters,
	AuditLogItem,
	AuditLogStats,
} from "./types";

const AUDIT_LOGS_STORAGE_KEY = "respira_admin_audit_logs_v1";

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
	{
		id: "log-2026-001",
		timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
		actor: "admin@respira.vn",
		actorName: "Quản trị viên Hệ thống",
		role: "Admin",
		action: "Đồng bộ phác đồ điều trị Viêm phổi mắc phải tại cộng đồng (CAP 2026)",
		category: "Protocol",
		target: "Respira.Clinical / ClinicalMetrics / CAP-2026-v2",
		service: "Clinical",
		status: "success",
		severity: "medium",
		ipAddress: "192.168.1.102",
		userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0",
		correlationId: "corr-7f9a2b1c-8821-4f4d",
		durationMs: 142,
		requestPayload: {
			protocolId: "cm-cap-2026",
			version: "2.1.0",
			publisher: "Hội Hô hấp Việt Nam / ATS",
			isApplied: true,
			rulesCount: 14,
		},
		responseSummary: "Phác đồ được kích hoạt thành công cho toàn bộ bác sĩ lâm sàng.",
	},
	{
		id: "log-2026-002",
		timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
		actor: "Saga.Orchestrator",
		actorName: "Wolverine Distributed Saga",
		role: "System",
		action: "Thực thi phân tán Saga tạo tài khoản Bác sĩ BS.CKII Lê Hoàng Minh",
		category: "Profile",
		target: "ProfileCreateSaga / DoctorProfile",
		service: "Saga",
		status: "success",
		severity: "low",
		ipAddress: "127.0.0.1",
		userAgent: "Wolverine.Saga.Host/3.5.0 net10.0",
		correlationId: "saga-9912bc34-11fa-4001",
		durationMs: 385,
		requestPayload: {
			sagaId: "9912bc34-11fa-4001",
			email: "minh.le@respira.com",
			position: "HeadOfDepartment",
			department: "Khoa Hồi sức tích cực ICU",
			compensationEnabled: true,
		},
		responseSummary: "Tài khoản Auth, hồ sơ Bác sĩ và Avatar được tạo đồng bộ.",
	},
	{
		id: "log-2026-003",
		timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
		actor: "minh.le@respira.com",
		actorName: "BS.CKII Lê Hoàng Minh",
		role: "Doctor",
		action: "Đăng nhập xác thực hai yếu tố (2FA)",
		category: "Auth",
		target: "Respira.Authentication / Identity / TokenIssued",
		service: "Auth",
		status: "success",
		severity: "low",
		ipAddress: "192.168.1.45",
		userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edg/130.0.0.0",
		correlationId: "auth-11a22b33-44c5-66d7",
		durationMs: 88,
		requestPayload: {
			grantType: "password_mfa",
			client: "RespiraAMS-Frontend-Doctor",
			tokenExpiration: "12h",
		},
		responseSummary: "JWT Access Token và Refresh Token cấp phát thành công.",
	},
	{
		id: "log-2026-004",
		timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
		actor: "admin@respira.vn",
		actorName: "Quản trị viên Hệ thống",
		role: "Admin",
		action: "Cập nhật tham số ngưỡng đề kháng vi sinh AMR (MRSA / K.pneumoniae)",
		category: "AMR",
		target: "Respira.Clinical / Antibiotics / Vancomycin_MIC",
		service: "Clinical",
		status: "warning",
		severity: "high",
		ipAddress: "192.168.1.102",
		userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0",
		correlationId: "corr-33cc44dd-55ee-66ff",
		durationMs: 210,
		requestPayload: {
			pathogen: "Staphylococcus aureus (MRSA)",
			antibiotic: "Vancomycin",
			breakpointMic: "> 2 mg/L",
			previousValue: "> 1.5 mg/L",
			reason: "Cập nhật theo khuyến cáo mới của CLSI 2026",
		},
		responseSummary: "Ngưỡng cảnh báo cao: 12 bệnh án nội trú có thể bị ảnh hưởng chỉ định.",
	},
	{
		id: "log-2026-005",
		timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
		actor: "113.161.45.88",
		actorName: "Chưa xác thực",
		role: "System",
		action: "Phát hiện đăng nhập thất bại vượt quá giới hạn (Brute-force alert)",
		category: "Auth",
		target: "Respira.Authentication / LoginRateLimiter",
		service: "Auth",
		status: "error",
		severity: "critical",
		ipAddress: "113.161.45.88",
		userAgent: "Python-urllib/3.11",
		correlationId: "sec-99887766-5544-3322",
		durationMs: 12,
		requestPayload: {
			attemptedUsername: "root_admin",
			failuresCount: 6,
			windowSeconds: 60,
			actionTaken: "IP_TEMP_BLOCKED_15M",
		},
		errorMessage: "HTTP 429 Too Many Requests: Khóa tạm thời IP 113.161.45.88 trong 15 phút.",
	},
	{
		id: "log-2026-006",
		timestamp: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
		actor: "manager@respira.ams",
		actorName: "PGS.TS Vũ Hoàng Long",
		role: "Manager",
		action: "Phê duyệt bổ sung Kháng sinh nhóm Carbapenem dự trữ (Meropenem-Vaborbactam)",
		category: "Protocol",
		target: "Respira.Clinical / Antibiotics / Reserve-List",
		service: "Clinical",
		status: "success",
		severity: "medium",
		ipAddress: "192.168.1.15",
		userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
		correlationId: "corr-88aa99bb-00cc-11dd",
		durationMs: 165,
		requestPayload: {
			antibioticName: "Meropenem / Vaborbactam",
			whoAwareClass: "Reserve",
			indication: "Nhiễm khuẩn vi khuẩn Gram âm đa kháng sinh tiết KPC",
			isApprovalRequired: true,
		},
		responseSummary: "Thuốc được đưa vào danh mục Kháng sinh Dự trữ cần hội chẩn.",
	},
	{
		id: "log-2026-007",
		timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
		actor: "bs.huong@respira.vn",
		actorName: "BS.CKI Trần Thu Hương",
		role: "Doctor",
		action: "Thực hiện Chẩn đoán & Khuyến nghị Phác đồ điều trị theo kinh nghiệm",
		category: "Patient",
		target: "Respira.Clinical / Diagnose / BA-2026-00129",
		service: "Clinical",
		status: "success",
		severity: "low",
		ipAddress: "192.168.1.78",
		userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0",
		correlationId: "diag-aa11bb22-33cc-44dd",
		durationMs: 312,
		requestPayload: {
			patientCode: "BA-2026-00129",
			suspectedPathogen: "Streptococcus pneumoniae",
			scoreCur65: 2,
			allergiesExcluded: ["Penicillin G", "Amoxicillin"],
			selectedRegimen: "Levofloxacin 750mg IV q24h",
		},
		responseSummary: "Đã xuất chỉ định kháng sinh, cảnh báo dị ứng nhóm Penicillin được kích hoạt.",
	},
	{
		id: "log-2026-008",
		timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
		actor: "System Gateway",
		actorName: "YARP Reverse Proxy Gateway",
		role: "Gateway",
		action: "Tự động kiểm tra trạng thái khả dụng 7 Vi dịch vụ (Heartbeat Check)",
		category: "System",
		target: "Respira.Gateway / HealthChecks / AllClusters",
		service: "Gateway",
		status: "success",
		severity: "low",
		ipAddress: "127.0.0.1",
		userAgent: "Respira.Gateway.HealthMonitor/1.0",
		correlationId: "gw-health-009988-aabb",
		durationMs: 45,
		requestPayload: {
			clustersTested: [
				"clinical-cluster",
				"patient-cluster",
				"auth-cluster",
				"doctor-cluster",
				"media-cluster",
				"saga-cluster",
			],
			allHealthy: true,
		},
		responseSummary: "Tất cả 7/7 cụm microservices phản hồi 200 OK, độ trễ trung bình 24ms.",
	},
	{
		id: "log-2026-009",
		timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
		actor: "admin@respira.vn",
		actorName: "Quản trị viên Hệ thống",
		role: "Admin",
		action: "Tạm khóa tài khoản Bác sĩ Đặng Đăng Quang (ngừng công tác tạm thời)",
		category: "Profile",
		target: "Respira.Doctor / Doctors / doc-doctor-04",
		service: "Doctor",
		status: "warning",
		severity: "medium",
		ipAddress: "192.168.1.102",
		userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0",
		correlationId: "doc-toggle-445566-7788",
		durationMs: 95,
		requestPayload: {
			doctorId: "doc-doctor-04",
			previousStatus: "Active",
			newStatus: "Inactive",
			revokedTokens: true,
		},
		responseSummary: "Trạng thái chuyển sang Inactive, phiên làm việc lập tức bị thu hồi.",
	},
	{
		id: "log-2026-010",
		timestamp: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
		actor: "Saga.Orchestrator",
		actorName: "Wolverine Distributed Saga",
		role: "System",
		action: "Bù trừ giao dịch phân tán (Saga Compensation Triggered): Hủy hồ sơ dở dang",
		category: "System",
		target: "ProfileCreateSaga / CompensationStep",
		service: "Saga",
		status: "error",
		severity: "high",
		ipAddress: "127.0.0.1",
		userAgent: "Wolverine.Saga.Host/3.5.0 net10.0",
		correlationId: "saga-comp-112233-4455",
		durationMs: 520,
		requestPayload: {
			failedStep: "MediaClient.UploadAvatar",
			errorReason: "Storage disk quote exceeded on Media Service",
			compensationActions: [
				"AuthClient.DeleteAccount(usr-temp-99)",
				"DoctorClient.DeleteDoctor(doc-temp-99)",
			],
		},
		errorMessage: "Avatar upload thất bại; quy trình bù trừ đã dọn sạch tài khoản Auth & Doctor an toàn.",
	},
	{
		id: "log-2026-011",
		timestamp: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
		actor: "doctor@respira.ams",
		actorName: "ThS.BS Nguyễn Văn An",
		role: "Doctor",
		action: "Tiếp nhận bệnh nhân mới nhập viện & tạo mã bệnh án nội trú",
		category: "Patient",
		target: "Respira.Patient / Patients / BA-2026-00145",
		service: "Patient",
		status: "success",
		severity: "low",
		ipAddress: "192.168.1.60",
		userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0",
		correlationId: "pat-create-9988-1122",
		durationMs: 140,
		requestPayload: {
			code: "BA-2026-00145",
			fullName: "Phạm Thành Đạt",
			gender: "Male",
			admissionDate: "2026-11-07",
			primaryDiagnosis: "Viêm phổi thùy phải tiến triển",
		},
		responseSummary: "Bệnh nhân đã lưu vào CSDL, chỉ số ban đầu được đồng bộ sang Clinical.",
	},
	{
		id: "log-2026-012",
		timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
		actor: "admin@respira.vn",
		actorName: "Quản trị viên Hệ thống",
		role: "Admin",
		action: "Tải lên tài nguyên ảnh chụp X-quang ngực mẫu cho hướng dẫn phác đồ",
		category: "Media",
		target: "Respira.Media / MediaAssets / cxr-pneumonia-sample.jpg",
		service: "Media",
		status: "success",
		severity: "low",
		ipAddress: "192.168.1.102",
		userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0",
		correlationId: "med-upload-3344-5566",
		durationMs: 410,
		requestPayload: {
			filename: "cxr-pneumonia-sample.jpg",
			contentType: "image/jpeg",
			sizeBytes: 1548200,
			acl: "public-read",
		},
		responseSummary: "Ảnh đã được mã hóa lưu trữ trên MinIO / S3 với CDN URL an toàn.",
	},
	{
		id: "log-2026-013",
		timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
		actor: "manager@respira.ams",
		actorName: "PGS.TS Vũ Hoàng Long",
		role: "Manager",
		action: "Xuất báo cáo định kỳ Giám sát Đề kháng Kháng sinh AMR Quý 4/2026",
		category: "AMR",
		target: "Respira.Clinical / Statistics / AMR-Surveillance-Report",
		service: "Clinical",
		status: "success",
		severity: "low",
		ipAddress: "192.168.1.15",
		userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
		correlationId: "amr-rep-5566-7788",
		durationMs: 620,
		requestPayload: {
			period: "2026-Q4",
			includedWards: ["ICU", "Respiratory", "Infectious"],
			format: "PDF_XLSX",
		},
		responseSummary: "Báo cáo WHONET và tỷ lệ nhạy cảm kháng sinh xuất bản thành công.",
	},
	{
		id: "log-2026-014",
		timestamp: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
		actor: "admin@respira.vn",
		actorName: "Quản trị viên Hệ thống",
		role: "Admin",
		action: "Thêm biến số lâm sàng mới: Mức lọc cầu thận ước tính (eGFR theo CKD-EPI)",
		category: "Protocol",
		target: "Respira.Clinical / ClinicalVariables / eGFR_CKDEPI",
		service: "Clinical",
		status: "success",
		severity: "medium",
		ipAddress: "192.168.1.102",
		userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0",
		correlationId: "var-create-7788-9900",
		durationMs: 130,
		requestPayload: {
			name: "eGFR (CKD-EPI 2021)",
			category: "Biochemical",
			canonicalUnit: "mL/min/1.73m²",
			acceptedRange: { min: 0, max: 200 },
			normalRange: { min: 60, max: 120 },
		},
		responseSummary: "Biến số đã sẵn sàng gắn vào các công thức hiệu chỉnh liều suy thận.",
	},
	{
		id: "log-2026-015",
		timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
		actor: "doctor@respira.ams",
		actorName: "ThS.BS Nguyễn Văn An",
		role: "Doctor",
		action: "Xác nhận kết thúc đợt điều trị & cho bệnh nhân xuất viện",
		category: "Patient",
		target: "Respira.Patient / Patients / BA-2026-00088 / Discharge",
		service: "Patient",
		status: "success",
		severity: "low",
		ipAddress: "192.168.1.60",
		userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0",
		correlationId: "pat-disch-1234-5678",
		durationMs: 110,
		requestPayload: {
			patientCode: "BA-2026-00088",
			outcome: "Recovered",
			dischargeNotes: "Khỏi bệnh hoàn toàn sau 7 ngày điều trị Ceftriaxone + Azithromycin",
		},
		responseSummary: "Hồ sơ bệnh án được đóng an toàn, lưu vết kiểm toán thành công.",
	},
];

function getStoredLogs(): AuditLogItem[] {
	if (typeof window === "undefined") return INITIAL_AUDIT_LOGS;
	try {
		const raw = localStorage.getItem(AUDIT_LOGS_STORAGE_KEY);
		if (!raw) {
			localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
			return INITIAL_AUDIT_LOGS;
		}
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_AUDIT_LOGS;
	} catch {
		return INITIAL_AUDIT_LOGS;
	}
}

function saveStoredLogs(logs: AuditLogItem[]): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(logs));
	} catch (e) {
		console.error("Failed to save audit logs to localStorage:", e);
	}
}

/**
 * Lấy danh sách nhật ký kiểm toán với lọc, tìm kiếm (hỗ trợ >= 1 ký tự mượt mà) và phân trang
 */
export async function fetchAuditLogs(
	filters?: AuditLogFilters,
	page: number = 1,
	pageSize: number = 10
): Promise<{ items: AuditLogItem[]; total: number; stats: AuditLogStats }> {
	const allLogs = getStoredLogs();

	// Calculate overall stats before filtering
	const total = allLogs.length;
	const successCount = allLogs.filter((l) => l.status === "success").length;
	const warningCount = allLogs.filter((l) => l.status === "warning").length;
	const errorCount = allLogs.filter((l) => l.status === "error").length;
	const uniqueActors = new Set(allLogs.map((l) => l.actor)).size;
	const successRatePercent = total > 0 ? Math.round((successCount / total) * 100) : 100;

	const stats: AuditLogStats = {
		total,
		successCount,
		warningCount,
		errorCount,
		uniqueActorsCount: uniqueActors,
		successRatePercent,
	};

	let filtered = [...allLogs];

	// Filter by search term (smooth 1-char search support)
	if (filters?.search && filters.search.trim().length > 0) {
		const query = filters.search.trim().toLowerCase();
		filtered = filtered.filter(
			(l) =>
				l.action.toLowerCase().includes(query) ||
				l.actor.toLowerCase().includes(query) ||
				l.actorName.toLowerCase().includes(query) ||
				l.target.toLowerCase().includes(query) ||
				l.service.toLowerCase().includes(query) ||
				l.ipAddress.toLowerCase().includes(query) ||
				l.correlationId.toLowerCase().includes(query)
		);
	}

	// Filter by service
	if (filters?.service && filters.service !== "ALL") {
		filtered = filtered.filter((l) => l.service.toLowerCase() === filters.service.toLowerCase());
	}

	// Filter by status
	if (filters?.status && filters.status !== "ALL") {
		filtered = filtered.filter((l) => l.status.toLowerCase() === filters.status.toLowerCase());
	}

	// Filter by severity
	if (filters?.severity && filters.severity !== "ALL") {
		filtered = filtered.filter((l) => l.severity.toLowerCase() === filters.severity.toLowerCase());
	}

	// Filter by timeRange
	if (filters?.timeRange && filters.timeRange !== "ALL") {
		const now = Date.now();
		let maxAgeMs = Infinity;
		if (filters.timeRange === "today" || filters.timeRange === "24h") {
			maxAgeMs = 24 * 60 * 60 * 1000;
		} else if (filters.timeRange === "7d") {
			maxAgeMs = 7 * 24 * 60 * 60 * 1000;
		} else if (filters.timeRange === "30d") {
			maxAgeMs = 30 * 24 * 60 * 60 * 1000;
		}

		filtered = filtered.filter((l) => {
			const itemTime = new Date(l.timestamp).getTime();
			return now - itemTime <= maxAgeMs;
		});
	}

	const filteredTotal = filtered.length;
	const startIndex = (page - 1) * pageSize;
	const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

	return {
		items: paginatedItems,
		total: filteredTotal,
		stats,
	};
}

/**
 * Ghi nhận một sự kiện kiểm toán mới vào hệ thống
 */
export function recordAuditEvent(
	event: Omit<AuditLogItem, "id" | "timestamp" | "correlationId">
): AuditLogItem {
	const currentLogs = getStoredLogs();
	const newLog: AuditLogItem = {
		...event,
		id: `log-live-${Date.now()}`,
		timestamp: new Date().toISOString(),
		correlationId: `corr-${Math.random().toString(36).substring(2, 10)}-${Date.now().toString(36)}`,
	};

	const updated = [newLog, ...currentLogs];
	saveStoredLogs(updated);
	return newLog;
}

/**
 * Khôi phục dữ liệu ban đầu
 */
export function resetAuditLogs(): void {
	if (typeof window === "undefined") return;
	localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
}

/**
 * Xuất dữ liệu nhật ký kiểm toán ra file CSV với hỗ trợ UTF-8 tiếng Việt
 */
export function exportAuditLogsToCsv(logs: AuditLogItem[]): void {
	if (logs.length === 0) return;

	const headers = [
		"Mã sự kiện",
		"Thời gian",
		"Tác nhân",
		"Tên tác nhân",
		"Vai trò",
		"Hành động",
		"Danh mục",
		"Dịch vụ",
		"Đối tượng",
		"Trạng thái",
		"Mức độ",
		"Địa chỉ IP",
		"Mã đối soát (Correlation ID)",
		"Thời gian xử lý (ms)",
	];

	const rows = logs.map((l) => [
		`"${l.id}"`,
		`"${l.timestamp}"`,
		`"${l.actor}"`,
		`"${l.actorName.replace(/"/g, '""')}"`,
		`"${l.role}"`,
		`"${l.action.replace(/"/g, '""')}"`,
		`"${l.category}"`,
		`"${l.service}"`,
		`"${l.target.replace(/"/g, '""')}"`,
		`"${l.status}"`,
		`"${l.severity}"`,
		`"${l.ipAddress}"`,
		`"${l.correlationId}"`,
		l.durationMs,
	]);

	const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.setAttribute("download", `RespiraAMS_AuditLogs_${new Date().toISOString().slice(0, 10)}.csv`);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

/**
 * Xuất dữ liệu nhật ký kiểm toán ra file JSON
 */
export function exportAuditLogsToJson(logs: AuditLogItem[]): void {
	if (logs.length === 0) return;

	const jsonContent = JSON.stringify(logs, null, 2);
	const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.setAttribute("download", `RespiraAMS_AuditLogs_${new Date().toISOString().slice(0, 10)}.json`);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

