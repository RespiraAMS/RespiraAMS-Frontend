"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
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
	Pill,
	Atom,
	BarChart2,
	ChevronLeft,
	ChevronRight,
	type LucideIcon,
	ShieldAlert,
	ClipboardCheck,
	Sliders,
	Activity,
	HelpCircle,
	FolderTree,
} from "lucide-react";
import { AccountSection } from "./AccountSection";
import { useSidebarStore } from "../stores/sidebarStore";

export interface NavItemConfig {
	key: string;
	icon: LucideIcon;
	href: string;
	badge?: number;
}

export const NAV_CONFIGS: NavItemConfig[] = [
	{ key: "dashboard", icon: LayoutDashboard, href: "/manage/dashboard" },
	{ key: "doctors", icon: Contact, href: "/manage/doctors" },
	{ key: "antibioticGroups", icon: FolderTree, href: "/manage/antibiotic-groups" },
	{ key: "antibiotics", icon: Pill, href: "/manage/antibiotics" },
	{ key: "pathogens", icon: Atom, href: "/manage/pathogens" },
	{ key: "suspectedCauses", icon: HelpCircle, href: "/manage/suspected-causes" },
	{ key: "treatments", icon: Activity, href: "/manage/treatments" },
	{ key: "clinicalVariables", icon: Sliders, href: "/manage/clinical-variables" },
	{ key: "criteria", icon: ClipboardCheck, href: "/manage/criteria" },
	{ key: "clinicalMetrics", icon: BarChart2, href: "/manage/clinical-metrics" },
	{ key: "riskFactors", icon: ShieldAlert, href: "/manage/risk-factors" },
];

function NavItemLink({
	item,
	label,
	collapsed,
	active,
}: {
	item: NavItemConfig;
	label: string;
	collapsed: boolean;
	active: boolean;
}) {
	const { icon: Icon, href, badge } = item;

	const linkContent = (
		<Link
			href={href}
			className={cn(
				"flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative",
				active
					? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
					: "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
			)}
		>
			<Icon
				className={cn(
					"shrink-0 h-4 w-4 transition-colors",
					active
						? "text-sidebar-primary-foreground"
						: "text-muted-foreground group-hover:text-sidebar-foreground"
				)}
			/>
			{!collapsed && <span className="truncate leading-none">{label}</span>}
			{!collapsed && badge != null && (
				<span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-primary/15 px-1.5 text-[11px] font-semibold text-sidebar-primary">
					{badge}
				</span>
			)}
			{collapsed && badge != null && (
				<span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-sidebar-primary" />
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

export function ManagerSidebar({
	className,
	navConfigs = NAV_CONFIGS,
}: {
	className?: string;
	navConfigs?: NavItemConfig[];
}) {
	const pathname = usePathname();
	const tNav = useTranslations("manager.nav");
	const [logoError, setLogoError] = useState(false);
	const collapsed = useSidebarStore((state) => state.collapsed);
	const collapse = useSidebarStore((state) => state.collapse);
	const expand = useSidebarStore((state) => state.expand);

	return (
		<TooltipProvider delayDuration={0}>
			<aside
				className={cn(
					"relative flex flex-col h-screen border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
					"transition-[width] duration-300 ease-in-out",
					collapsed ? "w-16" : "w-60",
					className
				)}
			>
				{/* Logo / Header */}
				<div
					className={cn(
						"flex items-center h-16 px-3 border-b border-sidebar-border shrink-0 overflow-hidden",
						collapsed ? "justify-center" : "justify-between"
					)}
				>
					<Link
						href="/"
						className="flex items-center gap-2.5 min-w-0 overflow-hidden"
					>
						<div className="relative h-8 w-8 shrink-0">
							{logoError && (
								<span className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-sm font-bold">
									R
								</span>
							)}
							<Image
								src="/Background.png"
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

					{!collapsed && (
						<Button
							variant="ghost"
							size="icon"
							className="h-7 w-7 shrink-0 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
							onClick={collapse}
							aria-label={tNav("collapseSidebar")}
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
							className="h-6 w-6 rounded-full bg-background border-border shadow-md hover:bg-accent"
							onClick={expand}
							aria-label={tNav("expandSidebar")}
							id="sidebar-expand-btn"
						>
							<ChevronRight className="h-3 w-3" />
						</Button>
					</div>
				)}

				{/* Nav Links */}
				<nav
					aria-label={tNav("mainNavigation")}
					className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-0.5"
				>
					{navConfigs.map((item) => (
						<NavItemLink
							key={item.href}
							item={item}
							label={tNav(item.key)}
							collapsed={collapsed}
							active={
								pathname === item.href ||
								pathname.startsWith(item.href + "/")
							}
						/>
					))}
				</nav>

				{/* Account Section */}
				<div className="border-t border-sidebar-border px-2 py-3 shrink-0">
					<AccountSection collapsed={collapsed} />
				</div>
			</aside>
		</TooltipProvider>
	);
}