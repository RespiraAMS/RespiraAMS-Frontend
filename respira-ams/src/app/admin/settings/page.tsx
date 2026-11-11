import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
	return (
		<div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
			<div>
				<div className="flex items-center gap-2">
					<div className="p-2 rounded-xl bg-sky-50 text-[#0EA5E9]">
						<Settings className="w-5 h-5" />
					</div>
					<h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
						Cấu hình hệ thống
					</h1>
				</div>
				<p className="text-xs sm:text-sm text-slate-500 mt-1">
					Thiết lập các thông số môi trường kết nối hạ tầng vi dịch vụ và bảo mật
				</p>
			</div>

			<div className="rounded-[12px] border border-slate-200/80 bg-white p-8 text-center text-slate-500 shadow-2xs">
				<p className="text-sm">Giao diện Cấu hình hệ thống nâng cao đang được cập nhật.</p>
			</div>
		</div>
	);
}

