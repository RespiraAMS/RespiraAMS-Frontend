"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { PanelLeft } from "lucide-react";
import { useAdminSidebarStore } from "@/features/admin/components/sidebarStore";

const PAGE_TITLE_KEYS: Record<string, string> = {
	"/admin": "pageAuditLogs",
	"/admin/dashboard": "pageAuditLogs",
	"/admin/audit-logs": "pageAuditLogs",
	"/admin/users": "pageUsers",
	"/admin/regulation-reviews": "pageRegulationReviews",
	"/admin/protocols": "pageProtocols",
	"/admin/settings": "pageSettings",
};

export function AdminHeader() {
	const pathname = usePathname();
	const t = useTranslations("admin.header");
	const toggleSidebar = useAdminSidebarStore((state) => state.toggle);

	const titleKey =
		PAGE_TITLE_KEYS[pathname] ??
		Object.entries(PAGE_TITLE_KEYS)
			.filter(([href]) => href !== "/admin")
			.find(([href]) => pathname.startsWith(href + "/"))?.[1];

	const title = titleKey ? t(titleKey as any) : t("defaultTitle");

	return (
		<header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white px-6">
			{/* Left: Sidebar Toggle & Page Title */}
			<div className="flex items-center gap-3 min-w-0">
				<button
					type="button"
					onClick={toggleSidebar}
					className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
					title="Thu gọn / Mở rộng thanh điều hướng"
					aria-label="Thu gọn / Mở rộng thanh điều hướng"
				>
					<PanelLeft className="h-4 w-4" />
				</button>
				<div className="h-4 w-px bg-slate-200" />
				<h1 className="truncate text-lg font-bold tracking-tight text-slate-900">
					{title}
				</h1>
			</div>
		</header>
	);
}

export default AdminHeader;
