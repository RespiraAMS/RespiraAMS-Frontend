import { DashboardView } from "@/features/manager/dashboard/components/DashboardView";

export const metadata = {
	title: "Bảng Thống kê | RespiraAMS",
	description: "Thống kê độ chính xác khuyến nghị và tỷ lệ sử dụng kháng sinh.",
};

export default function Page() {
	return (
		<div className="container mx-auto px-4 py-8">
			<DashboardView />
		</div>
	);
}
