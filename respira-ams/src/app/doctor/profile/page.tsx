import { ProfileView } from "@/features/profile/components/ProfileView";

export const metadata = {
	title: "Thông tin cá nhân & Hồ sơ Bác sĩ | RespiraAMS",
	description: "Xem và quản lý thông tin chứng chỉ hành nghề, học vị và thông tin cá nhân của bác sĩ.",
};

export default function DoctorProfilePage() {
	return <ProfileView />;
}

