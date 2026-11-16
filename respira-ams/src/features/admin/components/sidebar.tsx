"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	LayoutDashboard,
	Users,
	FileText,
	ShieldCheck,
	Settings,
	type LucideIcon,
} from "lucide-react";
import AdminAccountSection from "@/features/admin/components/accountSection";
import { useAdminSidebarStore } from "@/features/admin/components/sidebarStore";

export interface AdminNavItem {
	icon: LucideIcon;
	label: string;
	href: string;
	key: string;
	badge?: number;
}

interface AdminNavItemProps {
	item: AdminNavItem;
	collapsed: boolean;
	active: boolean;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
	{
		icon: LayoutDashboard,
		label: "Tổng quan hệ thống",
		key: "dashboard",
		href: "/admin/dashboard",
	},
	{
		icon: Users,
		label: "Quản lý người dùng",
		key: "users",
		href: "/admin/users",
	},
	{
		icon: FileText,
		label: "Phác đồ & Phiên bản",
		key: "protocols",
		href: "/admin/protocols",
	},
	{
		icon: ShieldCheck,
		label: "Nhật ký kiểm toán",
		key: "auditLogs",
		href: "/admin/audit-logs",
	},
	{
		icon: Settings,
		label: "Cấu hình hệ thống",
		key: "settings",
		href: "/admin/settings",
	},
];

function NavItemLink({ item, collapsed, active }: AdminNavItemProps) {
	const t = useTranslations("admin.nav");
	const { icon: Icon, href, key, badge } = item;
	const label = t(key as any);

	const linkContent = (
		<Link
			href={href}
			className={cn(
				"flex items-center gap-3 px-3.5 py-2.5 transition-all group relative select-none",
				active
					? "rounded-[12px] bg-primary/5 text-primary font-semibold shadow-sm shadow-primary/10"
					: "rounded-[10px] text-text-secondary hover:text-text-primary hover:bg-surface-secondary font-medium"
			)}
		>
			<Icon
				className={cn(
					"shrink-0 h-4 w-4 transition-colors",
					active
						? "text-primary"
						: "text-text-tertiary group-hover:text-text-secondary"
				)}
			/>

			{!collapsed && (
				<div className="flex-1 leading-snug">
					<span className="text-[12.5px] leading-tight">{label}</span>
				</div>
			)}

			{!collapsed && active && (
				<span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 self-center ml-2" />
			)}

			{!collapsed && !active && badge != null && (
				<span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-surface-secondary px-1 text-[10px] font-semibold text-text-secondary">
					{badge}
				</span>
			)}

			{collapsed && (
				active ? (
					<span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary" />
				) : badge != null ? (
					<span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-text-tertiary" />
				) : null
			)}
		</Link>
	);

	if (collapsed) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>{linkContent}</TooltipTrigger>
				<TooltipContent side="right" className="flex items-center gap-2 font-medium rounded-[6px] text-xs">
					{label}
					{badge != null && (
						<span className="flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary/10 px-1 text-[9px] font-bold text-primary">
							{badge}
						</span>
					)}
				</TooltipContent>
			</Tooltip>
		);
	}

	return linkContent;
}

export function AdminSidebar() {
	const t = useTranslations("admin.nav");
	const collapsed = useAdminSidebarStore((state) => state.collapsed);
	const pathname = usePathname();

	return (
		<TooltipProvider delayDuration={0}>
			<aside
				className={cn(
					"sticky top-0 flex flex-col h-screen border-r border-border-subtle bg-surface z-30 select-none",
					"transition-[width] duration-300 ease-in-out shrink-0",
					collapsed ? "w-16" : "w-[245px]"
				)}
			>
				{/* Top Logo / Brand with horizontal divider border-b */}
				<div
					className={cn(
						"flex items-center h-16 px-4 border-b border-border-subtle shrink-0",
						collapsed ? "justify-center" : "justify-start"
					)}
				>
					<Link
						href="/admin/dashboard"
						className="flex items-center gap-2.5 min-w-0"
						id="admin-brand-link"
					>
						{/* App Icon */}
						<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-primary text-primary-foreground font-bold text-base shadow-md shadow-primary/25">
							R.
						</div>

						{/* Brand Titles */}
						{!collapsed && (
							<div className="min-w-0 flex-1">
								<div className="flex items-center text-base leading-tight">
									<span className="font-bold text-text-primary tracking-tight">
										Respira
									</span>
									<span className="font-bold text-primary tracking-tight">
										AMS
									</span>
								</div>
								<span className="text-[9px] font-semibold text-text-tertiary tracking-wider uppercase block mt-0.5 leading-none">
									{t("brandSubtitle")}
								</span>
							</div>
						)}
					</Link>
				</div>

				{/* Category Section Header */}
				{!collapsed ? (
					<div className="px-4 pt-4 pb-4">
						<span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider block">
							{t("categoryTitle")}
						</span>
					</div>
				) : (
					<div className="h-4" />
				)}

				{/* Navigation Links */}
				<nav
					aria-label="Admin navigation"
					className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 space-y-1"
				>
					{ADMIN_NAV_ITEMS.map((item) => {
						const isItemActive =
							pathname === item.href ||
							(item.href !== "/admin" && pathname.startsWith(item.href + "/"));

						return (
							<NavItemLink
								key={item.href}
								item={item}
								collapsed={collapsed}
								active={isItemActive}
							/>
						);
					})}
				</nav>

				{/* Footer Account Section */}
				<div className="p-2.5 shrink-0 border-t border-border-subtle">
					<AdminAccountSection collapsed={collapsed} />
				</div>
			</aside>
		</TooltipProvider>
	);
}

export default AdminSidebar;
