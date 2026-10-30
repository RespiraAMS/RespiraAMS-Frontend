import { PatientDetailsView } from "@/features/doctor/patients/components/PatientDetailsView";

export const metadata = {
	title: "Chi tiết bệnh nhân | RespiraAMS",
	description: "Hồ sơ chi tiết và tiến trình điều trị bệnh nhân.",
};

export default async function PatientDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const resolvedParams = await params;
	return <PatientDetailsView patientId={resolvedParams.id} />;
}
