import { DoctorSidebar } from "@/features/doctor/components/sidebar";
import { DoctorHeader } from "@/features/doctor/components/header";

export default function DoctorLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="flex min-h-screen">
			<DoctorSidebar />
			<div className="flex flex-1 flex-col min-h-screen overflow-x-hidden">
				<DoctorHeader />
				<main className="flex-1 overflow-y-auto">
					{children}
				</main>
			</div>
		</div>
	);
}
