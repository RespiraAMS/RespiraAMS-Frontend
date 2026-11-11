import { apiFetch, API_BASE, API_BASE_SERVER } from "@/lib/api";
import { 
    PaginatedClinicalMetrics, 
    ClinicalMetricItem,
    ClinicalMetricDetail,
    CreateClinicalMetricRequest, 
    UpdateClinicalMetricRequest, 
    MetricRuleDetail,
    CreateMetricRuleRequest, 
    UpdateMetricRuleRequest
} from "./types";

const PROTOCOLS_STORAGE_KEY = "respira_admin_protocols_v1";

export const INITIAL_CLINICAL_METRICS: ClinicalMetricItem[] = [
	{
		id: "cm-001",
		name: "ICU hospitalization criteria by IDSA/ATS",
		code: "IDSA/ATS",
		description: "IDSA/ATS metrics to assess whether patient needs ICU admission",
		version: "v2026",
		publisher: "Hiệp hội Bệnh nhiễm trùng Mỹ (IDSA) và Hiệp hội Lồng ngực Mỹ (ATS)",
		isApplied: true,
	},
	{
		id: "cm-002",
		name: "Pneumonia Severity Index (PSI)",
		code: "PSI",
		description: "PSI metrics to assess severity of a patient with community-acquired pneumonia",
		version: "v1997",
		publisher: "Đội ngũ Nghiên cứu Kết quả Điều trị Viêm phổi (PORT)",
		isApplied: true,
	},
	{
		id: "cm-003",
		name: "Severity metrics CURB-65",
		code: "CURB-65",
		description: "CURB-65 metrics to assess severity of community-acquired pneumonia",
		version: "v2002-2003",
		publisher: "Hiệp hội Lồng ngực Anh (BTS)",
		isApplied: true,
	},
];

function getStoredProtocols(): ClinicalMetricItem[] {
	if (typeof window === "undefined") return INITIAL_CLINICAL_METRICS;
	try {
		const raw = localStorage.getItem(PROTOCOLS_STORAGE_KEY);
		if (!raw) {
			localStorage.setItem(PROTOCOLS_STORAGE_KEY, JSON.stringify(INITIAL_CLINICAL_METRICS));
			return INITIAL_CLINICAL_METRICS;
		}
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CLINICAL_METRICS;
	} catch {
		return INITIAL_CLINICAL_METRICS;
	}
}

function saveStoredProtocols(items: ClinicalMetricItem[]): void {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(PROTOCOLS_STORAGE_KEY, JSON.stringify(items));
	} catch (e) {
		console.error("Failed to save protocols:", e);
	}
}

export async function getClinicalMetricsList(
    page: number, 
    pageSize: number,
    searchTerm?: string,
    isApplied?: boolean | null
): Promise<PaginatedClinicalMetrics> {
    const params = new URLSearchParams({
        Page: page.toString(),
        Size: pageSize.toString(),
    });

    if (isApplied !== null && isApplied !== undefined) {
        params.append("IsApplied", isApplied.toString());
    }

    let endpoint = `${API_BASE_SERVER}${API_BASE}/clinical-metrics`;
    
    // BE validator requires SearchTerm to have at least 2 characters on /clinical-metrics/search.
    // If searchTerm is provided but shorter than 2 chars, fallback to normal list to avoid 400 Bad Request.
    const trimmed = searchTerm?.trim();
    if (trimmed && trimmed.length >= 2) {
        endpoint = `${API_BASE_SERVER}${API_BASE}/clinical-metrics/search`;
        params.append("SearchTerm", trimmed);
    }

    let result: PaginatedClinicalMetrics | null = null;
    try {
        result = await apiFetch<PaginatedClinicalMetrics>(`${endpoint}?${params.toString()}`);
        if (result?.items && result.items.length > 0) {
            saveStoredProtocols(result.items);
        }
    } catch (err) {
        console.warn("[ProtocolsAPI] Backend unavailable, using cached protocols:", err);
    }

    if (!result) {
        // Fallback to local stored protocols
        let all = getStoredProtocols();
        if (isApplied !== null && isApplied !== undefined) {
            all = all.filter((i) => i.isApplied === isApplied);
        }
        if (trimmed) {
            const lower = trimmed.toLowerCase();
            all = all.filter(
                (i) =>
                    i.name?.toLowerCase().includes(lower) ||
                    i.code?.toLowerCase().includes(lower) ||
                    i.description?.toLowerCase().includes(lower) ||
                    i.publisher?.toLowerCase().includes(lower)
            );
        }
        const total = all.length;
        const pageCount = Math.max(1, Math.ceil(total / pageSize));
        const start = (page - 1) * pageSize;
        const items = all.slice(start, start + pageSize);

        return {
            metadata: {
                currentPage: page,
                pageSize,
                totalItemCount: total,
                pageCount,
                hasNextPage: page < pageCount,
                hasPreviousPage: page > 1,
            },
            items,
        };
    }

    if (trimmed && trimmed.length === 1 && result.items) {
        const lower = trimmed.toLowerCase();
        const filtered = result.items.filter(item =>
            item.name?.toLowerCase().includes(lower) ||
            item.code?.toLowerCase().includes(lower) ||
            item.description?.toLowerCase().includes(lower) ||
            item.publisher?.toLowerCase().includes(lower)
        );
        return {
            ...result,
            items: filtered,
            metadata: {
                ...result.metadata,
                totalItemCount: filtered.length,
                pageCount: 1,
            }
        };
    }

    return result;
}

export async function getClinicalMetricDetail(id: string): Promise<ClinicalMetricDetail> {
    try {
        const result = await apiFetch<ClinicalMetricDetail>(`${API_BASE_SERVER}${API_BASE}/clinical-metrics/${id}`);
        if (result) return result;
    } catch (err) {
        console.warn("[ProtocolsAPI] Backend get detail failed, using local fallback:", err);
    }
    const local = getStoredProtocols().find((p) => p.id === id);
    if (local) {
        return {
            ...local,
            rules: [],
        };
    }
    throw new Error("Failed to fetch clinical metric detail");
}

export async function createClinicalMetric(data: CreateClinicalMetricRequest): Promise<unknown> {
    try {
        const res = await apiFetch<unknown>(`${API_BASE_SERVER}${API_BASE}/clinical-metrics`, {
            method: "POST",
            body: JSON.stringify(data),
        });
        if (res) return res;
    } catch (err) {
        console.warn("[ProtocolsAPI] Backend create failed, saving to local cache:", err);
    }
    const current = getStoredProtocols();
    const newItem: ClinicalMetricItem = {
        id: `cm-${Date.now()}`,
        name: data.name,
        code: data.code,
        description: data.description,
        version: data.version,
        publisher: data.publisher,
        isApplied: true,
    };
    saveStoredProtocols([newItem, ...current]);
    return newItem;
}

export async function updateClinicalMetric(id: string, data: UpdateClinicalMetricRequest): Promise<void> {
    try {
        await apiFetch(`${API_BASE_SERVER}${API_BASE}/clinical-metrics/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
        return;
    } catch (err) {
        console.warn("[ProtocolsAPI] Backend update failed, updating local cache:", err);
    }
    const current = getStoredProtocols();
    const updated = current.map((p) => (p.id === id ? { ...p, ...data } : p));
    saveStoredProtocols(updated);
}

export async function deleteClinicalMetric(id: string): Promise<void> {
    try {
        await apiFetch(`${API_BASE_SERVER}${API_BASE}/clinical-metrics/${id}`, {
            method: "DELETE",
        });
        return;
    } catch (err) {
        console.warn("[ProtocolsAPI] Backend delete failed, updating local cache:", err);
    }
    const current = getStoredProtocols();
    saveStoredProtocols(current.filter((p) => p.id !== id));
}

export async function getMetricRuleDetail(ruleId: string): Promise<MetricRuleDetail> {
    const result = await apiFetch<MetricRuleDetail>(`${API_BASE_SERVER}${API_BASE}/clinical-metrics/rules/${ruleId}`);
    if (!result) throw new Error("Failed to fetch metric rule detail");
    return result;
}

export async function createMetricRule(metricId: string, data: CreateMetricRuleRequest): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/clinical-metrics/${metricId}/rules`, {
        method: "POST",
        body: JSON.stringify(data, (key, value) => (value === null ? undefined : value)),
    });
}

export async function updateMetricRule(metricId: string, ruleId: string, data: UpdateMetricRuleRequest): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/clinical-metrics/${metricId}/rules/${ruleId}`, {
        method: "PUT",
        body: JSON.stringify(data, (key, value) => (value === null ? undefined : value)),
    });
}

export async function deleteMetricRule(ruleId: string): Promise<void> {
    await apiFetch(`${API_BASE_SERVER}${API_BASE}/clinical-metrics/rules/${ruleId}`, {
        method: "DELETE",
    });
}
