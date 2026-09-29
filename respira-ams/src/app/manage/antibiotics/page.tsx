import { AntibioticsView } from "@/features/manager/antibiotics/components/AntibioticsView";

export const metadata = {
	title: "Kháng sinh | RespiraAMS",
	description: "Quản lý danh sách kháng sinh theo phổ và phân loại AWaRe.",
};

export default function Page() {
	return (
		<div className="container mx-auto px-4 py-8">
			<AntibioticsView />
		</div>
	);
}
