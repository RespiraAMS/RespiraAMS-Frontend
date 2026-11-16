import { DoctorsView } from "@/features/doctor/doctors/components/DoctorsView";

export const metadata = {
    title: "Bác sĩ | RespiraAMS",
    description: "Quản lý bác sĩ trong hệ thống RespiraAMS.",
};

export default function Page() {
    return (
        <div className="container mx-auto px-4 py-8">
            <DoctorsView />
        </div>
    );
}
