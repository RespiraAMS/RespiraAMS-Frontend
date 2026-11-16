import { PatientsView } from "@/features/doctor/patients/components/PatientsView";

export const metadata = {
    title: 'Danh sách bệnh nhân | RespiraAMS',
    description: 'Tra cứu danh sách bệnh nhân.',
};

export default function Page() {
	return (
		<div className="container mx-auto px-4 py-8">
			<PatientsView/>
		</div>
	);
}
