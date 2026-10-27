import { ClinicalMetricsView } from "@/features/manager/clinical-metrics/components/ClinicalMetricsView";

export const metadata = {
    title: "Thang đo lâm sàng | RespiraAMS",
    description: "Quản lý danh sách thang đo lâm sàng trong hệ thống RespiraAMS.",
};

export default function Page() {
    return (
        <div className="container mx-auto px-4 py-8">
            <ClinicalMetricsView/>
        </div>
    );
}
