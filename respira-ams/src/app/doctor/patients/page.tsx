import { PatientsView } from "@/features/doctor/patients/components/PatientsView";

export const metadata = {
	title: "Danh sách bệnh nhân | RespiraAMS",
	description: "Theo dõi và quản lý danh sách hồ sơ bệnh nhân.",
};

export default function PatientsPage() {
	return <PatientsView />;
}
