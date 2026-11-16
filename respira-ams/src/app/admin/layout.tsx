import { AdminSidebar } from "@/features/admin/components/sidebar";
import { DoctorThemeScope as AdminThemeScope } from "@/features/doctor/components/DoctorThemeScope";
import { AdminHeader } from "@/features/admin/components/header";

export default function AdminLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<AdminThemeScope>
		<div className="flex min-h-screen bg-background antialiased">
			<AdminSidebar />
			<div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
				<AdminHeader />
				<main className="flex-1 overflow-y-auto bg-background">{children}</main>
			</div>
		</div>
		</AdminThemeScope>
	);
}

