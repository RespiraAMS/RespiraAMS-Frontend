"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	User,
	Search,
	Bug,
	CheckCircle2,
	Calculator,
	BarChart3,
	type LucideIcon,
} from "lucide-react";
import AccountSection from "@/features/doctor/components/accountSection";
import { useSidebarStore } from "@/features/doctor/components/sidebarStore";

export interface NavItem {
	icon: LucideIcon;
	label: string;
	href: string;
	badge?: number;
}

interface NavItemProps {
	item: NavItem;
	collapsed: boolean;
	active: boolean;
}

export const DOCTOR_NAV_ITEMS: NavItem[] = [
	{
		icon: User,
		label: "Quản lý bệnh nhân",
		href: "/doctor/patients",
	},
	{
		icon: Search,
		label: "Tra cứu",
		href: "/doctor/info",
	},
	{
		icon: Bug,
		label: "Tác nhân gây bệnh",
		href: "/doctor/pathogens",
	},
	{
		icon: CheckCircle2,
		label: "Chẩn đoán lâm sàng",
		href: "/doctor/diagnose",
	},
	{
		icon: Calculator,
		label: "Máy tính y khoa",
		href: "/doctor/calculator",
	},
	{
		icon: BarChart3,
		label: "Thống kê & Giám sát AMR",
		href: "/doctor/statistics",
	},
];

function NavItemLink({ item, collapsed, active }: NavItemProps) {
	const { icon: Icon, label, href, badge } = item;

	const linkContent = (
		<Link
			href={href}
			className={cn(
				"flex items-center gap-3 px-3.5 py-2.5 transition-all group relative select-none",
				active
					? "rounded-[12px] bg-[#F0F7FF] text-[#0EA5E9] font-semibold shadow-[0_1px_4px_rgba(14,165,233,0.12)]"
					: "rounded-[10px] text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
			)}
		>
			<Icon
				className={cn(
					"shrink-0 h-4 w-4 transition-colors",
					active
						? "text-[#0EA5E9]"
						: "text-slate-400 group-hover:text-slate-600"
				)}
			/>

			{!collapsed && (
				<div className="flex-1 leading-snug">
					{label === "Thống kê & Giám sát AMR" ? (
						<>
							<span className="block text-[12.5px] leading-tight">Thống kê & Giám sát</span>
							<span className="block text-[12.5px] leading-tight font-bold">AMR</span>
						</>
					) : (
						<span className="text-[12.5px] leading-tight">{label}</span>
					)}
				</div>
			)}

			{!collapsed && active && (
				<span className="h-1.5 w-1.5 rounded-full bg-[#0EA5E9] shrink-0 self-center ml-2" />
			)}

			{!collapsed && !active && badge != null && (
				<span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-100 px-1 text-[10px] font-semibold text-slate-600">
					{badge}
				</span>
			)}

			{collapsed && (
				active ? (
					<span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-[#0EA5E9]" />
				) : badge != null ? (
					<span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
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
						<span className="flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-sky-100 px-1 text-[9px] font-bold text-[#0EA5E9]">
							{badge}
						</span>
					)}
				</TooltipContent>
			</Tooltip>
		);
	}

	return linkContent;
}

export function DoctorSidebar() {
	const collapsed = useSidebarStore((state) => state.collapsed);
	const pathname = usePathname();

	return (
		<TooltipProvider delayDuration={0}>
			<aside
				className={cn(
					"sticky top-0 flex flex-col h-screen border-r border-slate-100 bg-white z-30 select-none",
					"transition-[width] duration-300 ease-in-out shrink-0",
					collapsed ? "w-16" : "w-[245px]"
				)}
			>
				{/* Top Logo / Brand with horizontal divider border-b */}
				<div
					className={cn(
						"flex items-center h-16 px-4 border-b border-slate-100 shrink-0",
						collapsed ? "justify-center" : "justify-start"
					)}
				>
					<Link
						href="/doctor/patients"
						className="flex items-center gap-2.5 min-w-0"
						id="doctor-brand-link"
					>
						{/* App Icon */}
						<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#0EA5E9] text-white font-bold text-base shadow-[0_3px_10px_rgba(14,165,233,0.25)]">
							R.
						</div>

						{/* Brand Titles */}
						{!collapsed && (
							<div className="min-w-0 flex-1">
								<div className="flex items-center text-base leading-tight">
									<span className="font-bold text-slate-900 tracking-tight">
										Respira
									</span>
									<span className="font-bold text-[#0EA5E9] tracking-tight">
										AMS
									</span>
								</div>
								<span className="text-[9px] font-semibold text-slate-400 tracking-wider uppercase block mt-0.5 leading-none">
									Hệ thống vi sinh lâm sàng
								</span>
							</div>
						)}
					</Link>
				</div>

				{/* Category Section Header */}
				{!collapsed ? (
					<div className="px-4 pt-4 pb-4">
						<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
							Danh mục chuyên môn
						</span>
					</div>
				) : (
					<div className="h-4" />
				)}

				{/* Navigation Links */}
				<nav
					aria-label="Doctor navigation"
					className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 space-y-1"
				>
					{DOCTOR_NAV_ITEMS.map((item) => {
						const isItemActive =
							pathname === item.href ||
							(item.href !== "/doctor" && pathname.startsWith(item.href + "/"));

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
				<div className="p-2.5 shrink-0 border-t border-slate-100">
					<AccountSection collapsed={collapsed} />
				</div>
			</aside>
		</TooltipProvider>
	);
}

export default DoctorSidebar;
