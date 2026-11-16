import { ClinicalVariablesView } from "@/features/manager/clinical-variables/components/ClinicalVariablesView";

export const metadata = {
    title: "Biến số lâm sàng | RespiraAMS",
    description: "Quản lý danh sách biến số lâm sàng trong hệ thống RespiraAMS.",
};

export default function Page() {
    return (
        <div className="container mx-auto px-4 py-8">
            <ClinicalVariablesView />
        </div>
    );
}
