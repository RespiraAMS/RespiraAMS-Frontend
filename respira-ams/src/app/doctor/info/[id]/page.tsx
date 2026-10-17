import { notFound } from "next/navigation";
import { AntibioticDetailView } from "@/features/doctor/info/components/AntibioticDetailView";
import { getAntibioticById } from "@/features/doctor/info/mockData";

export const metadata = {
	title: "Chi tiết kháng sinh | RespiraAMS",
	description: "Thông tin liều dùng và điều chỉnh liều theo GFR.",
};

export default async function AntibioticDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const antibiotic = getAntibioticById(id);
	if (!antibiotic) notFound();
	return <AntibioticDetailView antibiotic={antibiotic} />;
}
