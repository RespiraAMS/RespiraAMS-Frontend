import { AnalysisReportsView } from "@/features/doctor/analysis/components/AnalysisReportsView";

export const metadata = {
	title: "Nhóm kháng sinh | RespiraAMS",
	description: "Xem báo cáo và xuất file excel.",
};

export default function Page() {
	return (
		<div className="container mx-auto px-4 py-8">
			<AnalysisReportsView/>
		</div>
	);
}
