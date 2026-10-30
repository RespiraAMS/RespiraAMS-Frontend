import { AntibioticGroupsView } from "@/features/doctor/antibiotic-groups/components/AntibioticGroupsView";

export const metadata = {
	title: "Danh sách nhóm kháng sinh | RespiraAMS",
	description: "Tra cứu các nhóm kháng sinh, cơ chế tác dụng và kháng sinh thuộc nhóm.",
};

export default function AntibioticGroupsPage() {
	return <AntibioticGroupsView />;
}
