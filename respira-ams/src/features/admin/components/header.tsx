"use client";

import { usePathname } from "next/navigation";
import { PanelLeft, Shield, Activity } from "lucide-react";
import { useAdminSidebarStore } from "@/features/admin/components/sidebarStore";

const PAGE_TITLES: Record<string, string> = {
	"/admin": "Tổng quan hệ thống",
	"/admin/dashboard": "Tổng quan hệ thống",
	"/admin/users": "Quản lý người dùng & Phân quyền",
	"/admin/protocols": "Quản lý phác đồ & Phiên bản",
	"/admin/audit-logs": "Nhật ký kiểm toán & Bảo mật",
	"/admin/settings": "Cấu hình hệ thống",
};

export function AdminHeader() {
	const pathname = usePathname();
	const toggleSidebar = useAdminSidebarStore((state) => state.toggle);

	const title =
		Object.entries(PAGE_TITLES).find(
			([href]) => pathname === href || pathname.startsWith(href + "/")
		)?.[1] ?? "Quản trị hệ thống";

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

			{/* Right: Status badge & System indicator */}
			<div className="flex items-center gap-3">
				{/* Online Status Pill */}
				<div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-3 py-1 text-xs font-medium text-emerald-700">
					<span className="relative flex h-2 w-2">
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
						<span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
					</span>
					<span>Hệ thống trực tuyến</span>
				</div>

				{/* Admin Console Pill */}
				<div className="hidden sm:inline-flex items-center gap-1.5 rounded-[10px] bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
					<Shield className="h-3.5 w-3.5 text-[#0EA5E9]" />
					<span>Admin Portal</span>
				</div>
			</div>
		</header>
	);
}

export default AdminHeader;

