"use client";

import { usePathname } from "next/navigation";
import { Download } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
	"/doctor/patients": "Quản lý bệnh nhân",
	"/doctor/info": "Tra cứu",
	"/doctor/diagnose": "Chẩn đoán lâm sàng",
	"/doctor/calculator": "Máy tính y khoa",
	"/doctor/statistics": "Thống kê & Giám sát Vi sinh Lâm sàng",
	"/doctor/history": "Lịch sử điều trị",
};

export function DoctorHeader() {
	const pathname = usePathname();
	const title =
		Object.entries(PAGE_TITLES).find(
			([href]) => pathname === href || pathname.startsWith(href + "/")
		)?.[1] ?? "RespiraAMS";

	return (
		<header className="sticky top-0 z-20 flex h-[72px] shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white px-8">
			<h1 className="truncate text-xl font-bold tracking-tight text-slate-900">
				{title}
			</h1>

			<button
				type="button"
				id="doctor-export-report-btn"
				className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-[10px] bg-[#0088FF] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#0077EE]"
			>
				<Download className="h-4 w-4" />
				<span>Xuất báo cáo Vi sinh</span>
			</button>
		</header>
	);
}

export default DoctorHeader;
