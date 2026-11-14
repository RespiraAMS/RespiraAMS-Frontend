import { RiskFactorsView } from "@/features/manager/risk-factors/components/RiskFactorView";

export const metadata = {
    title: "Yếu tố nguy cơ | RespiraAMS",
    description: "Quản lý danh sách yếu tố nguy cơ gây bệnh hô hấp trong hệ thống RespiraAMS.",
};

export default function Page() {
    return (
        <div className="container mx-auto px-4 py-8">
            <RiskFactorsView />
        </div>
    );
}
