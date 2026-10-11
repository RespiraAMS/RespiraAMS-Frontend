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
				"flex items-center gap-3.5 px-4 transition-all group relative select-none",
				active
					? "rounded-[16px] bg-[#F0F7FF] border border-[#E0F0FE] text-[#0088FF] font-semibold py-3 shadow-[0_2px_8px_rgba(0,136,255,0.06)]"
					: "rounded-[12px] text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium py-2.5 border border-transparent"
			)}
		>
			<Icon
				className={cn(
					"shrink-0 h-5 w-5 transition-colors",
					active
						? "text-[#0088FF]"
						: "text-slate-400 group-hover:text-slate-600"
				)}
			/>

			{!collapsed && (
				<div className="flex-1 leading-snug">
					{label === "Thống kê & Giám sát AMR" ? (
						<>
							<span className="block text-[13.5px] leading-tight">Thống kê & Giám sát</span>
							<span className="block text-[13.5px] leading-tight font-bold">AMR</span>
						</>
					) : (
						<span className="text-[13.5px] leading-tight">{label}</span>
					)}
				</div>
			)}

			{!collapsed && active && (
				<span className="h-2 w-2 rounded-full bg-[#0088FF] shrink-0 self-center ml-2" />
			)}

			{!collapsed && !active && badge != null && (
				<span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-100 px-1.5 text-[11px] font-semibold text-slate-600">
					{badge}
				</span>
			)}

			{collapsed && (
				active ? (
					<span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#0088FF]" />
				) : badge != null ? (
					<span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-slate-400" />
				) : null
			)}
		</Link>
	);

	if (collapsed) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>{linkContent}</TooltipTrigger>
				<TooltipContent side="right" className="flex items-center gap-2 font-medium rounded-[8px]">
					{label}
					{badge != null && (
						<span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-100 px-1 text-[10px] font-bold text-[#0088FF]">
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
					collapsed ? "w-20" : "w-[260px]"
				)}
			>
				{/* Top Logo / Brand with horizontal divider border-b */}
				<div
					className={cn(
						"flex items-center h-[72px] px-5 border-b border-slate-100 shrink-0",
						collapsed ? "justify-center" : "justify-start"
					)}
				>
					<Link
						href="/doctor/statistics"
						className="flex items-center gap-3 min-w-0"
						id="doctor-brand-link"
					>
						{/* App Icon with explicit rounded-[16px] and soft glow shadow */}
						<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-[#0088FF] text-white font-bold text-lg shadow-[0_4px_14px_rgba(0,136,255,0.3)]">
							R.
						</div>

						{/* Brand Titles */}
						{!collapsed && (
							<div className="min-w-0 flex-1">
								<div className="flex items-center text-lg leading-tight">
									<span className="font-bold text-slate-900 tracking-tight">
										Respira
									</span>
									<span className="font-bold text-[#0088FF] tracking-tight">
										AMS
									</span>
								</div>
								<span className="text-[9.5px] font-semibold text-slate-400 tracking-wider uppercase block mt-0.5 leading-none">
									Hệ thống vi sinh lâm sàng
								</span>
							</div>
						)}
					</Link>
				</div>

				{/* Category Section Header */}
				{!collapsed ? (
					<div className="px-5 pt-6 pb-2.5">
						<span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
							Danh mục chuyên môn
						</span>
					</div>
				) : (
					<div className="h-3" />
				)}

				{/* Navigation Links */}
				<nav
					aria-label="Doctor navigation"
					className="flex-1 overflow-y-auto overflow-x-hidden px-3 space-y-1.5"
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
				<div className="p-3.5 shrink-0 border-t border-slate-100">
					<AccountSection collapsed={collapsed} />
				</div>
			</aside>
		</TooltipProvider>
	);
}

export default DoctorSidebar;
