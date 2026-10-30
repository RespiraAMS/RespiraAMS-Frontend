import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AntibioticDetailView } from "@/features/doctor/info/components/AntibioticDetailView";
import { fetchAntibioticById } from "@/features/doctor/info/services/antibioticApi";

interface PageProps {
	params: Promise<{ id: string }>;
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { id } = await params;
	const antibiotic = await fetchAntibioticById(id);

	if (!antibiotic) {
		return {
			title: "Không tìm thấy kháng sinh | RespiraAMS",
		};
	}

	return {
		title: `${antibiotic.name} | Chi tiết kháng sinh | RespiraAMS`,
		description: `Thông tin liều dùng và hướng dẫn chỉnh liều theo GFR của ${antibiotic.name}.`,
	};
}

export default async function AntibioticDetailPage({ params }: PageProps) {
	const { id } = await params;
	const antibiotic = await fetchAntibioticById(id);

	if (!antibiotic) {
		notFound();
	}

	return <AntibioticDetailView antibiotic={antibiotic} />;
}
