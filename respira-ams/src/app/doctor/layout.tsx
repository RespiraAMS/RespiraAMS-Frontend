import { DoctorSidebar } from "@/features/doctor/components/sidebar";
import { DoctorHeader } from "@/features/doctor/components/header";
import { DoctorThemeScope } from "@/features/doctor/components/DoctorThemeScope";

export default function DoctorLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<DoctorThemeScope>
			<div className="flex min-h-screen bg-[#F8FAFC] antialiased">
				<DoctorSidebar />
				<div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
					<DoctorHeader />
					<main className="flex-1 overflow-y-auto bg-[#F8FAFC]">{children}</main>
				</div>
			</div>
		</DoctorThemeScope>
	);
}
