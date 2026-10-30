import { DiseasesView } from "@/features/manager/diseases/components/DiseasesView";

export const metadata = {
	title: "Bệnh truyền nhiễm | RespiraAMS",
	description: "Quản lý danh sách bệnh truyền nhiễm và tiêu chí nhập ICU trong hệ thống RespiraAMS.",
};

export default function Page() {
	return (
		<div className="container mx-auto px-4 py-8">
			<DiseasesView />
		</div>
	);
}
