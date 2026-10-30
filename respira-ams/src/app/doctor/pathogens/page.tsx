import { DoctorPathogensView } from "@/features/doctor/pathogens/components/DoctorPathogensView";

export const metadata = {
	title: "Danh sách tác nhân gây bệnh | RespiraAMS",
	description: "Tra cứu danh sách tác nhân vi sinh gây bệnh đường hô hấp và phân loại.",
};

export default function DoctorPathogensPage() {
	return <DoctorPathogensView />;
}
