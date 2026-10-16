import { AntibioticSpectraView } from "@/features/manager/antibiotic-spectra/components/AntibioticSpectraView";

export const metadata = {
	title: "Phổ kháng sinh | RespiraAMS",
	description: "Quản lý danh sách phổ kháng sinh trong hệ thống RespiraAMS.",
};

export default function Page() {
	return (
		<div className="container mx-auto px-4 py-8">
			<AntibioticSpectraView />
		</div>
	);
}
