import { DoctorSidebar } from "@/features/doctor/components/sidebar";
import { DoctorHeader } from "@/features/doctor/components/header";

export default function DoctorLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="flex min-h-screen bg-[#F8FAFC] antialiased">
			<DoctorSidebar />
			<div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
				<DoctorHeader />
				<main className="flex-1 overflow-y-auto bg-[#F8FAFC]">{children}</main>
			</div>
		</div>
	);
}
