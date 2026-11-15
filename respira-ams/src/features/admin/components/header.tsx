"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { PanelLeft, Shield } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAdminSidebarStore } from "@/features/admin/components/sidebarStore";

const PAGE_TITLE_KEYS: Record<string, string> = {
	"/admin": "pageDashboard",
	"/admin/dashboard": "pageDashboard",
	"/admin/users": "pageUsers",
	"/admin/protocols": "pageProtocols",
	"/admin/audit-logs": "pageAuditLogs",
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
		<header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border-subtle bg-surface px-6">
			{/* Left: Sidebar Toggle & Page Title */}
			<div className="flex items-center gap-3 min-w-0">
				<button
					type="button"
					onClick={toggleSidebar}
					className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
					title="Thu gọn / Mở rộng thanh điều hướng"
					aria-label="Thu gọn / Mở rộng thanh điều hướng"
				>
					<PanelLeft className="h-4 w-4" />
				</button>
				<div className="h-4 w-px bg-surface-tertiary" />
				<h1 className="truncate text-lg font-bold tracking-tight text-text-primary">
					{title}
				</h1>
			</div>

			{/* Right: Status badge & System indicator */}
			<div className="flex items-center gap-3">
				<LanguageSwitcher />
			</div>
		</header>
	);
}

export default AdminHeader;
