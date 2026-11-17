import { ManagerSidebar } from "@/features/manager/components/ManagerSidebar";

export default function ManageLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex h-screen overflow-hidden bg-background text-foreground">
			<ManagerSidebar />
			<div className="flex flex-1 flex-col overflow-hidden">
				<main className="flex-1 overflow-auto bg-background text-foreground">{children}</main>
			</div>
		</div>
	);
}