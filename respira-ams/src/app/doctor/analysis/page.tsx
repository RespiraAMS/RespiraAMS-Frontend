import { DoctorStatisticsView } from "@/features/doctor/analysis/components/DoctorStatisticsView";

export const metadata = {
	title: "Thống kê & Giám sát Vi sinh Lâm sàng | RespiraAMS",
	description: "Báo cáo và phân tích chỉ số sử dụng kháng sinh, giám sát tác nhân vi sinh và dữ liệu nhạy cảm kháng sinh AMR.",
};

export default function StatisticsPage() {
	return <DoctorStatisticsView />;
}
