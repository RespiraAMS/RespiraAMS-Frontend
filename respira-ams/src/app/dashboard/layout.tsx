import { ManagerSidebar } from "@/features/manager/components/ManagerSidebar";
import { ManagerHeader } from "@/features/manager/components/ManagerHeader";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex h-screen overflow-hidden">
			<ManagerSidebar />
			<div className="flex flex-1 flex-col overflow-hidden">
				<ManagerHeader />
				<main className="flex-1 overflow-auto">{children}</main>
			</div>
		</div>
	);
}
