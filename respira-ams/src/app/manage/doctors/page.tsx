import { DoctorsManagementView } from "@/features/manager/doctor/components/DoctorsManagementView";

export const metadata = {
	title: "Quản lý Bác sĩ | RespiraAMS",
	description: "Quản lý hồ sơ, tài khoản và quyền truy cập của bác sĩ trong hệ thống.",
};

export default function Page() {
	return (
		<div className="container mx-auto px-4 py-8">
			<DoctorsManagementView />
		</div>
	);
}
