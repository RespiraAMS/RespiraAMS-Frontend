import { redirect } from "next/navigation";

export const metadata = {
	title: "Hồ sơ Bác sĩ | RespiraAMS",
	description: "Xem và quản lý thông tin cá nhân và chứng chỉ hành nghề của bác sĩ.",
};

export default function ProfilePage() {
	redirect("/doctor/profile");
}
