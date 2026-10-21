import { SuspectedCausesView } from "@/features/manager/suspected-causes/components/SuspectedCausesView";

export const metadata = {
    title: "Tác nhân nghi ngờ | RespiraAMS",
    description: "Quản lý danh sách tác nhân nghi ngờ gây bệnh hô hấp trong hệ thống RespiraAMS.",
};

export default function Page() {
    return (
        <div className="container mx-auto px-4 py-8">
            <SuspectedCausesView />
        </div>
    );
}
