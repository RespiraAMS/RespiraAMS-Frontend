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
			color: "text-primary bg-primary/10 border-primary/30",
		},
		{
			title: t("actionProtocolsTitle", { defaultMessage: "Phiên bản phác đồ" }),
			description: t("actionProtocolsDesc", { defaultMessage: "Theo dõi thay đổi và rollback phác đồ kháng sinh" }),
			href: "/admin/protocols",
			icon: FileText,
			color: "text-info bg-info/10 border-info/30",
		},
		{
			title: t("actionAuditsTitle", { defaultMessage: "Nhật ký kiểm toán" }),
			description: t("actionAuditsDesc", { defaultMessage: "Tra cứu sự kiện truy cập và an toàn thông tin" }),
			href: "/admin/audit-logs",
			icon: ShieldAlert,
			color: "text-warning bg-warning/10 border-warning/30",
		},
		{
			title: t("actionSettingsTitle", { defaultMessage: "Cấu hình hệ thống" }),
			description: t("actionSettingsDesc", { defaultMessage: "Thiết lập thông số vi dịch vụ và kết nối" }),
			href: "/admin/settings",
			icon: Sliders,
			color: "text-success bg-success/10 border-success/30",
		},
	];

	return (
		<div className="bg-surface rounded-[12px] p-5 border border-border-subtle shadow-2xs">
			<div className="mb-4 pb-3 border-b border-border-subtle">
				<h3 className="text-sm font-bold text-text-primary">
					{t("quickActionsTitle", { defaultMessage: "Tác vụ Quản trị Nhanh" })}
				</h3>
				<p className="text-xs text-text-secondary">
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
							className="group relative flex flex-col justify-between p-3.5 rounded-[10px] border border-border-default/80 bg-surface hover:border-primary/50 hover:bg-primary/5 hover:shadow-xs transition-all duration-200"
						>
							<div className="flex items-start justify-between">
								<div className={`flex h-9 w-9 items-center justify-center rounded-[8px] border ${action.color}`}>
									<Icon className="h-4 w-4" />
								</div>
								<ArrowUpRight className="h-4 w-4 text-text-tertiary group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
							</div>
							<div className="mt-3">
								<h4 className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors">
									{action.title}
								</h4>
								<p className="text-[11px] text-text-secondary line-clamp-2 mt-0.5">
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

