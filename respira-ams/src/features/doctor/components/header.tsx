"use client";

import { usePathname } from "next/navigation";
import { Download } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
	"/doctor/patients": "Danh sách bệnh nhân",
	"/doctor/pathogens": "Danh sách tác nhân gây bệnh",
	"/doctor/info": "Danh sách kháng sinh",
	"/doctor/diagnose": "Chẩn đoán lâm sàng",
	"/doctor/calculator": "Máy tính y khoa",
	"/doctor/statistics": "Thống kê & Giám sát Vi sinh Lâm sàng",
	"/doctor/history": "Lịch sử điều trị",
};

export function DoctorHeader() {
	const pathname = usePathname();
	let title = "RespiraAMS";

	if (pathname.startsWith("/doctor/patients/")) {
		title = "Chi tiết bệnh nhân";
	} else if (pathname.startsWith("/doctor/pathogens/")) {
		title = "Chi tiết tác nhân gây bệnh";
	} else if (pathname.startsWith("/doctor/info/")) {
		title = "Chi tiết kháng sinh";
	} else {
		title =
			Object.entries(PAGE_TITLES).find(
				([href]) => pathname === href || pathname.startsWith(href + "/")
			)?.[1] ?? "RespiraAMS";
	}

	const showExportBtn = pathname === "/doctor/statistics";

	return (
		<header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white px-6">
			<h1 className="truncate text-lg font-bold tracking-tight text-slate-900">
				{title}
			</h1>

			{showExportBtn && (
				<button
					type="button"
					id="doctor-export-report-btn"
					style={{ borderRadius: "10px" }}
					className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-[10px] bg-[#0EA5E9] hover:bg-[#25B4F8] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:shadow-md hover:shadow-sky-500/15 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
				>
					<Download className="h-4 w-4" />
					<span>Xuất báo cáo Vi sinh</span>
				</button>
			)}
		</header>
	);
}

export default DoctorHeader;
