import { AntibioticLookupView } from "@/features/doctor/info/components/AntibioticLookupView";

export const metadata = {
	title: "Danh sách kháng sinh | RespiraAMS",
	description: "Tra cứu danh sách kháng sinh, nhóm thuốc và phân loại AWaRe.",
};

export default function InfoPage() {
	return <AntibioticLookupView />;
}
