import { TreatmentProtocolsView } from "@/features/manager/treatment-protocols/components/TreatmentProtocolsView";

export const metadata = {
    title: "Phác đồ điều trị | RespiraAMS",
    description: "Quản lý danh sách phác đồ điều trị trong hệ thống RespiraAMS.",
};

export default function Page() {
    return (
        <div className="container mx-auto px-4 py-8">
            <TreatmentProtocolsView />
        </div>
    );
}
