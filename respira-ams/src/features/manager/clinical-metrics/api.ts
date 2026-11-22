import { apiRequest, buildQuery } from "@/lib/api";
import {
	PaginatedClinicalMetrics,
	ClinicalMetricItem,
	ClinicalMetricDetail,
	CreateClinicalMetricRequest,
	UpdateClinicalMetricRequest,
	MetricRuleDetail,
	CreateMetricRuleRequest,
	UpdateMetricRuleRequest,
} from "./types";

/**
 * Lấy danh sách phác đồ / chỉ số lâm sàng thật 100% từ Backend (/clinical-metrics)
 */
export async function getClinicalMetricsList(
	page: number,
	pageSize: number,
	searchTerm?: string,
	isApplied?: boolean | null
): Promise<PaginatedClinicalMetrics> {
	const params: Record<string, string | number | boolean | undefined> = {
		Page: page,
		Size: pageSize,
	};

	if (isApplied !== null && isApplied !== undefined) {
		params.IsApplied = isApplied;
	}

	let endpoint = "/clinical-metrics";
	const trimmed = searchTerm?.trim();
	if (trimmed && trimmed.length >= 2) {
		endpoint = "/clinical-metrics/search";
		params.SearchTerm = trimmed;
	}

	try {
		const query = buildQuery(params);
		const data = await apiRequest<{
			items?: ClinicalMetricItem[];
			metadata?: {
				currentPage: number;
				pageSize: number;
				totalItemCount: number;
				pageCount: number;
				hasNextPage: boolean;
				hasPreviousPage: boolean;
			};
		}>(`${endpoint}${query}`);

		if (data?.items && Array.isArray(data.items)) {
			const metadata = data.metadata || {
				currentPage: page,
				pageSize,
				totalItemCount: data.items.length,
				pageCount: Math.max(1, Math.ceil(data.items.length / pageSize)),
				hasNextPage: false,
				hasPreviousPage: false,
			};
			return {
				metadata,
				items: data.items,
			};
		}
	} catch (err) {
		console.warn("[ProtocolsAPI] Backend call failed:", err);
		throw err;
	}

	throw new Error("Không thể tải danh sách thang điểm lâm sàng từ máy chủ.");
}

/**
 * Lấy chi tiết phác đồ / chỉ số kèm các tiêu chí và quy tắc chấm điểm thật
 */
export async function getClinicalMetricDetail(id: string): Promise<ClinicalMetricDetail> {
	try {
		const result = await apiRequest<ClinicalMetricDetail>(`/clinical-metrics/${id}`);
		if (result) return result;
	} catch (err) {
		console.warn("[ProtocolsAPI] Backend get detail failed:", err);
	}
	throw new Error("Không thể tải thông tin chi tiết phác đồ từ máy chủ.");
}

/**
 * Tạo mới phác đồ / chỉ số lâm sàng
 */
export async function createClinicalMetric(data: CreateClinicalMetricRequest): Promise<unknown> {
	return await apiRequest("/clinical-metrics", {
		method: "POST",
		body: data,
	});
}

/**
 * Cập nhật thông tin hoặc trạng thái áp dụng của phác đồ
 */
export async function updateClinicalMetric(
	id: string,
	data: UpdateClinicalMetricRequest
): Promise<void> {
	await apiRequest(`/clinical-metrics/${id}`, {
		method: "PUT",
		body: data,
	});
}

/**
 * Xóa phác đồ
 */
export async function deleteClinicalMetric(id: string): Promise<void> {
	await apiRequest(`/clinical-metrics/${id}`, {
		method: "DELETE",
	});
}

/**
 * Lấy chi tiết quy tắc tính điểm
 */
export async function getMetricRuleDetail(ruleId: string): Promise<MetricRuleDetail> {
	return await apiRequest<MetricRuleDetail>(`/clinical-metrics/rules/${ruleId}`);
}

/**
 * Tạo quy tắc tính điểm mới
 */
export async function createMetricRule(
	metricId: string,
	data: CreateMetricRuleRequest
): Promise<void> {
	await apiRequest(`/clinical-metrics/${metricId}/rules`, {
		method: "POST",
		body: data,
	});
}

/**
 * Cập nhật quy tắc tính điểm
 */
export async function updateMetricRule(
	metricId: string,
	ruleId: string,
	data: UpdateMetricRuleRequest
): Promise<void> {
	await apiRequest(`/clinical-metrics/${metricId}/rules/${ruleId}`, {
		method: "PUT",
		body: data,
	});
}

/**
 * Xóa quy tắc tính điểm
 */
export async function deleteMetricRule(ruleId: string): Promise<void> {
	await apiRequest(`/clinical-metrics/rules/${ruleId}`, {
		method: "DELETE",
	});
}
