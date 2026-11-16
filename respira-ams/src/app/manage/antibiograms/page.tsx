import { AntibiogramsView } from "@/features/manager/antibiograms/components/AntibiogramsView";

export const metadata = {
    title: "Kháng sinh đồ | RespiraAMS",
    description: "Quản lý danh sách kháng sinh đồ trong hệ thống RespiraAMS.",
};

export default function Page() {
    return (
        <div className="container mx-auto px-4 py-8">
            <AntibiogramsView/>
        </div>
    );
}
