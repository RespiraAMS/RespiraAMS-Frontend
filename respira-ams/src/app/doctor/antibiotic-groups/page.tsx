import { AntibioticGroupsView } from "@/features/manager/antibiotic-groups/components/AntibioticGroupsView";

export const metadata = {
	title: "Nhóm kháng sinh | RespiraAMS",
	description: "Quản lý danh sách nhóm kháng sinh trong hệ thống RespiraAMS.",
};

export default function Page() {
	return (
		<div className="container mx-auto px-4 py-8">
			<AntibioticGroupsView readOnly={true}/>
		</div>
	);
}
