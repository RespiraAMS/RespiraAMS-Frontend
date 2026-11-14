import { CriteriaView } from "@/features/manager/criteria/components/CriteriaView";

export const metadata = {
    title: "Tiêu chí | RespiraAMS",
    description: "Quản lý danh sách tiêu chí trong hệ thống RespiraAMS.",
};

export default function Page() {
    return (
        <div className="container mx-auto px-4 py-8">
            <CriteriaView />
        </div>
    );
}
