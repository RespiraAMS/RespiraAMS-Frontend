"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	LayoutDashboard,
	Contact,
	Microscope,
	Pill,
	Atom,
	Biohazard,
	BarChart2,
	FileText,
	Settings,
	ChevronLeft,
	ChevronRight,
	type LucideIcon,
} from "lucide-react";
import { AccountSection } from "./AccountSection";
import { useSidebarStore } from "../stores/sidebarStore";

// ─── Nav Items ────────────────────────────────────────────────────────────────

interface NavItem {
	icon: LucideIcon;
	label: string;
	href: string;
	badge?: number;
}

const NAV_ITEMS: NavItem[] = [
	{ icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
	{ icon: Contact, label: "Bác sĩ", href: "/manager/doctors" },
	{ icon: Microscope, label: "Phổ kháng sinh", href: "/manager/antibiotic-spectra" },
	{ icon: Pill, label: "Kháng sinh", href: "/manager/antibiotics" },
	{ icon: Atom, label: "Tác nhân gây bệnh", href: "/manager/pathogens" },
	{ icon: Biohazard, label: "Bệnh truyền nhiễm", href: "/manager/diseases" },
	{ icon: BarChart2, label: "Phân tích & Thống kê", href: "/analytics" },
	{ icon: FileText, label: "Báo cáo", href: "/reports" },
	{ icon: Settings, label: "Cài đặt", href: "/settings" },
];

// ─── NavItemLink ──────────────────────────────────────────────────────────────

function NavItemLink({
	item,
	collapsed,
	active,
}: {
	item: NavItem;
	collapsed: boolean;
	active: boolean;
}) {
	const { icon: Icon, label, href, badge } = item;

	const linkContent = (
		<Link
			href={href}
			className={cn(
				"flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
				"transition-all duration-150 group relative",
				active
					? "bg-primary text-primary-foreground shadow-sm"
					: "text-muted-foreground hover:text-foreground hover:bg-accent"
			)}
		>
			<Icon
				className={cn(
					"shrink-0 h-4 w-4 transition-colors",
					active
						? "text-primary-foreground"
						: "text-muted-foreground group-hover:text-foreground"
				)}
			/>
			{!collapsed && (
				<span className="truncate leading-none">{label}</span>
			)}
			{/* Badge – expanded */}
			{!collapsed && badge != null && (
				<span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/15 px-1.5 text-[11px] font-semibold text-primary">
					{badge}
				</span>
			)}
			{/* Badge dot – collapsed */}
			{collapsed && badge != null && (
				<span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
			)}
		</Link>
	);

	if (collapsed) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>{linkContent}</TooltipTrigger>
				<TooltipContent side="right" className="flex items-center gap-2">
					{label}
					{badge != null && (
						<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/15 px-1.5 text-[11px] font-semibold text-primary">
							{badge}
						</span>
					)}
				</TooltipContent>
			</Tooltip>
		);
	}

	return linkContent;
}

// ─── ManagerSidebar ───────────────────────────────────────────────────────────

export function ManagerSidebar({
	className,
	navItems = NAV_ITEMS,
}: {
	className?: string;
	navItems?: NavItem[];
}) {
	const pathname = usePathname();
	const [logoError, setLogoError] = useState(false);
	const collapsed = useSidebarStore((state) => state.collapsed);
	const collapse = useSidebarStore((state) => state.collapse);
	const expand = useSidebarStore((state) => state.expand);

	return (
		<TooltipProvider delayDuration={0}>
			<aside
				className={cn(
					"relative flex flex-col h-screen border-r bg-background",
					"transition-[width] duration-300 ease-in-out",
					collapsed ? "w-16" : "w-60",
					className
				)}
			>
				{/* Logo / Header */}
				<div
					className={cn(
						"flex items-center h-16 px-3 border-b shrink-0 overflow-hidden",
						collapsed ? "justify-center" : "justify-between"
					)}
				>
					<Link
						href="/"
						className="flex items-center gap-2.5 min-w-0 overflow-hidden"
					>
						<div className="relative h-8 w-8 shrink-0">
							{logoError && (
								<span className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
									R
								</span>
							)}
							<Image
								src="/logo.png"
								alt="RespiraAMS logo"
								fill
								sizes="32px"
								className={cn(
									"rounded-lg object-cover",
									logoError ? "hidden" : "block"
								)}
								onError={() => setLogoError(true)}
							/>
						</div>
						<span
							className={cn(
								"overflow-hidden transition-all duration-300",
								collapsed ? "max-w-0 opacity-0" : "max-w-40 opacity-100"
							)}
						>
							<span className="font-semibold text-sm truncate block">
								RespiraAMS
							</span>
						</span>
					</Link>

					{/* Collapse button – shown when expanded */}
					{!collapsed && (
						<Button
							variant="ghost"
							size="icon"
							className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
							onClick={collapse}
							aria-label="Thu gọn sidebar"
							id="sidebar-collapse-btn"
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
					)}
				</div>

				{/* Expand button floating when collapsed */}
				{collapsed && (
					<div className="absolute -right-3 top-[52px] z-10">
						<Button
							variant="outline"
							size="icon"
							className="h-6 w-6 rounded-full bg-background shadow-md border"
							onClick={expand}
							aria-label="Mở rộng sidebar"
							id="sidebar-expand-btn"
						>
							<ChevronRight className="h-3 w-3" />
						</Button>
					</div>
				)}

				{/* Nav Links */}
				<nav
					aria-label="Main navigation"
					className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-0.5"
				>
					{navItems.map((item) => (
						<NavItemLink
							key={item.href}
							item={item}
							collapsed={collapsed}
							active={
								pathname === item.href ||
								pathname.startsWith(item.href + "/")
							}
						/>
					))}
				</nav>

				{/* Account Section */}
				<div className="border-t px-2 py-3 shrink-0">
					<AccountSection collapsed={collapsed} />
				</div>
			</aside>
		</TooltipProvider>
	);
}
