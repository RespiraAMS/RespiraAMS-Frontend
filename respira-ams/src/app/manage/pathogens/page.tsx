import { PathogensView } from "@/features/manager/pathogens/components/PathogensView";

export const metadata = {
	title: "Tác nhân gây bệnh | RespiraAMS",
	description: "Quản lý danh sách tác nhân gây bệnh hô hấp trong hệ thống RespiraAMS.",
};

export default function Page() {
	return (
		<div className="container mx-auto px-4 py-8">
			<PathogensView />
		</div>
	);
}
