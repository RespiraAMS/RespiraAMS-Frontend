import { redirect } from "next/navigation";
import { ManagerSidebar } from "@/features/manager/components/ManagerSidebar";
import { canAccessArea, getDefaultDashboard } from "@/lib/roles";
import { getSession } from "@/lib/session";

export default async function ManageLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getSession();

	if (!canAccessArea(session.role, "manage")) {
		redirect(getDefaultDashboard(session.role));
	}

	return (
		<div className="flex h-screen overflow-hidden bg-background text-foreground">
			<ManagerSidebar />
			<div className="flex flex-1 flex-col overflow-hidden">
				<main className="flex-1 overflow-auto bg-background text-foreground">{children}</main>
			</div>
		</div>
	);
}