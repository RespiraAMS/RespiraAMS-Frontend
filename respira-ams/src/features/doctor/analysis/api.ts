import { apiRequest } from "@/lib/api";
import {
	AnalysisReportListItem,
	AnalysisReportResult,
	PatientStatItem,
} from "./types";

export interface PaginationMetadata {
	totalItemCount: number;
	pageCount: number;
	currentPage: number;
	pageSize: number;
}

export interface Pagination<T> {
	metadata: PaginationMetadata;
	items: T[];
}

export interface PathogenItemDto {
	id: string;
	name: string;
	description: string;
	isAtypical: boolean;
}

/**
 * Lấy danh sách báo cáo phân tích lâm sàng AMR từ Backend
 */
export async function fetchAnalysisReports(
	page = 1,
	size = 10
): Promise<Pagination<AnalysisReportListItem>> {
	return await apiRequest<Pagination<AnalysisReportListItem>>(
		`/analysis/reports?page=${page}&size=${size}`
	);
}

/**
 * Lấy chi tiết một báo cáo phân tích lâm sàng AMR theo ID
 */
export async function fetchAnalysisReportDetail(
	analysisId: string
): Promise<AnalysisReportResult> {
	return await apiRequest<AnalysisReportResult>(`/analysis/reports/${analysisId}`);
}

/**
 * Tạo một báo cáo phân tích lâm sàng AMR mới trên Backend
 */
export async function createAnalysisReport(
	start: string,
	end: string
): Promise<AnalysisReportResult> {
	return await apiRequest<AnalysisReportResult>("/analysis/reports", {
		method: "POST",
		body: { start, end },
	});
}

/**
 * Tải file báo cáo phân tích lâm sàng dạng Excel (.xlsx) từ Backend
 */
export async function downloadAnalysisReportExcel(analysisId: string): Promise<void> {
	const res = await fetch(`/api/backend/analysis/reports/${analysisId}/excel`);
	if (!res.ok) {
		throw new Error("Không thể tải file báo cáo Excel từ hệ thống");
	}
	const blob = await res.blob();
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `Bao_cao_giam_sat_AMR_${new Date().toISOString().slice(0, 10)}.xlsx`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	window.URL.revokeObjectURL(url);
}

/**
 * Xuất dữ liệu thống kê lâm sàng dưới dạng bảng tính Excel/CSV UTF-8 (BOM)
 */
export function exportClinicalDataCsv(
	patients: PatientStatItem[],
	pathogens: PathogenItemDto[],
	kpis: { title: string; value: string | number; subtitle: string }[]
): void {
	let csv = "\uFEFF"; // UTF-8 BOM để Excel hiển thị tiếng Việt chính xác

	csv += "BÁO CÁO THỐNG KÊ & GIÁM SÁT VI SINH LÂM SÀNG (RESPIRA AMS)\r\n";
	csv += `Thời gian xuất: ${new Date().toLocaleString("vi-VN")}\r\n\r\n`;

	csv += "1. CHỈ SỐ TỔNG HỢP (KPI)\r\n";
	csv += "Chỉ số,Giá trị,Chi tiết\r\n";
	kpis.forEach((k) => {
		csv += `"${k.title}","${k.value}","${k.subtitle}"\r\n`;
	});

	csv += "\r\n2. DANH SÁCH BỆNH NHÂN GHI NHẬN\r\n";
	csv += "STT,Mã bệnh án,Họ và tên,Giới tính,Ngày nhập viện,Tình trạng điều trị\r\n";
	patients.forEach((p, idx) => {
		const name = `${p.lastName || ""} ${p.firstName || ""}`.trim();
		const outcome =
			p.treatmentOutcome === "Recovered"
				? "Hồi phục"
				: p.treatmentOutcome === "Death"
				? "Tử vong"
				: p.treatmentOutcome === "InTreatment"
				? "Đang điều trị"
				: "Ngoài phạm vi";
		const dateStr = p.admission ? new Date(p.admission).toLocaleDateString("vi-VN") : "";
		csv += `${idx + 1},"${p.medicalRecordCode}","${name}","${p.gender === "Male" ? "Nam" : "Nữ"}","${dateStr}","${outcome}"\r\n`;
	});

	csv += "\r\n3. DANH MỤC TÁC NHÂN VI SINH\r\n";
	csv += "STT,Tên tác nhân vi sinh,Phân loại,Mô tả sinh học\r\n";
	pathogens.forEach((pa, idx) => {
		csv += `${idx + 1},"${pa.name}","${pa.isAtypical ? "Vi khuẩn không điển hình" : "Vi khuẩn điển hình"}","${(pa.description || "").replace(/"/g, '""')}"\r\n`;
	});

	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `Bao_cao_vi_sinh_lam_sang_${new Date().toISOString().slice(0, 10)}.csv`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	window.URL.revokeObjectURL(url);
}

/**
 * Lấy toàn bộ danh sách bệnh nhân thực tế để thống kê chỉ số lâm sàng
 */
export async function fetchAllPatients(
	page = 1,
	size = 100
): Promise<Pagination<PatientStatItem>> {
	return await apiRequest<Pagination<PatientStatItem>>(
		`/patients?page=${page}&size=${size}`
	);
}

/**
 * Lấy danh mục tác nhân vi sinh thực tế từ CSDL
 */
export async function fetchTopPathogens(size = 10): Promise<PathogenItemDto[]> {
	try {
		const res = await apiRequest<Pagination<PathogenItemDto>>(`/pathogens?page=1&size=${size}`);
		return res?.items ?? [];
	} catch {
		return [];
	}
}
