import { AdminSidebar } from "@/features/admin/components/sidebar";
import { AdminHeader } from "@/features/admin/components/header";

export default function AdminLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="flex min-h-screen bg-[#F8FAFC] antialiased">
			<AdminSidebar />
			<div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
				<AdminHeader />
				<main className="flex-1 overflow-y-auto bg-[#F8FAFC]">{children}</main>
			</div>
		</div>
	);
}

