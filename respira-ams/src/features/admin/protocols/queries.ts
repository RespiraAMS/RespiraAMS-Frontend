import { useQuery } from "@tanstack/react-query";
import { getClinicalMetricsList, getStoredProtocolCount } from "@/features/manager/clinical-metrics/api";
import { clinicalMetricKeys } from "@/features/manager/clinical-metrics/queries";

export {
	useClinicalMetricsList as useProtocolsList,
	useClinicalMetricDetail as useProtocolDetail,
	useClinicalMetricMutations as useProtocolMutations,
} from "@/features/manager/clinical-metrics/queries";

/**
 * Đếm số phác đồ theo trạng thái áp dụng (null = tất cả) bằng cách lấy 1 bản ghi
 * và đọc metadata.totalItemCount. Key nằm dưới `lists()` nên tự làm mới khi có thay đổi.
 */
export function useProtocolCount(isApplied: boolean | null) {
	return useQuery({
		queryKey: [...clinicalMetricKeys.lists(), "count", isApplied] as const,
		queryFn: async () => {
			const res = await getClinicalMetricsList(1, 1, undefined, isApplied);
			return res.metadata?.totalItemCount ?? 0;
		},
		staleTime: 60 * 1000,
	});
}

