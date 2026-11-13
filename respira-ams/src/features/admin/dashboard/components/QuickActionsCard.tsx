"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { UserPlus, FileText, ShieldAlert, Sliders, ArrowUpRight } from "lucide-react";

export function QuickActionsCard() {
	const t = useTranslations("admin.dashboard");

	const actions = [
		{
			title: t("actionUsersTitle", { defaultMessage: "Cấp phát tài khoản" }),
			description: t("actionUsersDesc", { defaultMessage: "Khởi tạo tài khoản Bác sĩ / Quản lý qua Saga" }),
			href: "/admin/users",
			icon: UserPlus,
			color: "text-[#0EA5E9] bg-sky-50 border-sky-100",
		},
		{
			title: t("actionProtocolsTitle", { defaultMessage: "Phiên bản phác đồ" }),
			description: t("actionProtocolsDesc", { defaultMessage: "Theo dõi thay đổi và rollback phác đồ kháng sinh" }),
			href: "/admin/protocols",
			icon: FileText,
			color: "text-blue-600 bg-blue-50 border-blue-100",
		},
		{
			title: t("actionAuditsTitle", { defaultMessage: "Nhật ký kiểm toán" }),
			description: t("actionAuditsDesc", { defaultMessage: "Tra cứu sự kiện truy cập và an toàn thông tin" }),
			href: "/admin/audit-logs",
			icon: ShieldAlert,
			color: "text-amber-600 bg-amber-50 border-amber-100",
		},
		{
			title: t("actionSettingsTitle", { defaultMessage: "Cấu hình hệ thống" }),
			description: t("actionSettingsDesc", { defaultMessage: "Thiết lập thông số vi dịch vụ và kết nối" }),
			href: "/admin/settings",
			icon: Sliders,
			color: "text-purple-600 bg-purple-50 border-purple-100",
		},
	];

	return (
		<div className="bg-white rounded-[12px] p-5 border border-slate-100 shadow-2xs">
			<div className="mb-4 pb-3 border-b border-slate-100">
				<h3 className="text-sm font-bold text-slate-900">
					{t("quickActionsTitle", { defaultMessage: "Tác vụ Quản trị Nhanh" })}
				</h3>
				<p className="text-xs text-slate-500">
					{t("quickActionsDesc", { defaultMessage: "Truy cập nhanh các phân hệ chức năng quản trị trọng yếu" })}
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
				{actions.map((action) => {
					const Icon = action.icon;
					return (
						<Link
							key={action.href}
							href={action.href}
							className="group relative flex flex-col justify-between p-3.5 rounded-[10px] border border-slate-200/80 bg-white hover:border-[#0EA5E9]/50 hover:bg-[#F0F7FF]/30 hover:shadow-xs transition-all duration-200"
						>
							<div className="flex items-start justify-between">
								<div className={`flex h-9 w-9 items-center justify-center rounded-[8px] border ${action.color}`}>
									<Icon className="h-4 w-4" />
								</div>
								<ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-[#0EA5E9] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
							</div>
							<div className="mt-3">
								<h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0EA5E9] transition-colors">
									{action.title}
								</h4>
								<p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
									{action.description}
								</p>
							</div>
						</Link>
					);
				})}
			</div>
		</div>
	);
}

