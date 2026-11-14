"use client";

import { useTranslations } from "next-intl";
import { Activity, CheckCircle2, Server } from "lucide-react";
import { MicroserviceStatus } from "../types";

interface MicroservicesHealthCardProps {
	services: MicroserviceStatus[];
}

export function MicroservicesHealthCard({ services }: MicroservicesHealthCardProps) {
	const t = useTranslations("admin.dashboard");

	return (
		<div className="bg-surface rounded-[12px] p-5 border border-border-subtle shadow-2xs">
			<div className="flex items-center justify-between mb-4 pb-3 border-b border-border-subtle">
				<div className="flex items-center gap-2.5">
					<div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
						<Activity className="h-4 w-4" />
					</div>
					<div>
						<h3 className="text-sm font-bold text-text-primary">
							{t("microservicesTitle", { defaultMessage: "Hạ tầng Vi dịch vụ (Microservices Architecture)" })}
						</h3>
						<p className="text-xs text-text-secondary">
							{t("microservicesSubtitle", { defaultMessage: "Giám sát tình trạng hoạt động thực tế của cụm dịch vụ Backend .NET 10 & Aspire" })}
						</p>
					</div>
				</div>

				<div className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success border border-success/30">
					<span className="relative flex h-2 w-2">
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
						<span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
					</span>
					<span>7/7 {t("operating", { defaultMessage: "Đang hoạt động" })}</span>
				</div>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full text-left border-collapse text-xs">
					<thead>
						<tr className="border-b border-border-subtle text-text-tertiary font-semibold uppercase text-[10px] tracking-wider">
							<th className="py-2.5 px-3">{t("colServiceName", { defaultMessage: "Tên Dịch vụ" })}</th>
							<th className="py-2.5 px-3">Microservice</th>
							<th className="py-2.5 px-3">Port</th>
							<th className="py-2.5 px-3">{t("colStatus", { defaultMessage: "Trạng thái" })}</th>
							<th className="py-2.5 px-3">{t("colLatency", { defaultMessage: "Độ trễ" })}</th>
							<th className="py-2.5 px-3 text-right">Uptime</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border-subtle">
						{services.map((svc) => (
							<tr key={svc.id} className="hover:bg-surface-secondary/70 transition-colors">
								<td className="py-3 px-3">
									<div className="flex items-center gap-2">
										<Server className="h-3.5 w-3.5 text-text-tertiary" />
										<span className="font-semibold text-text-primary">{svc.name}</span>
									</div>
									<p className="text-[11px] text-text-tertiary line-clamp-1">{svc.description}</p>
								</td>
								<td className="py-3 px-3 font-mono text-[11px] text-text-secondary">
									{svc.service}
								</td>
								<td className="py-3 px-3 font-mono text-[11px] text-text-secondary">
									:{svc.port}
								</td>
								<td className="py-3 px-3">
									<span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-[10.5px] font-medium text-success">
										<CheckCircle2 className="h-3 w-3 text-success" />
										Operational
									</span>
								</td>
								<td className="py-3 px-3 font-medium text-text-primary">
									<span className="inline-block rounded-[4px] bg-surface-secondary px-1.5 py-0.5 text-[10.5px]">
										{svc.latencyMs} ms
									</span>
								</td>
								<td className="py-3 px-3 text-right font-medium text-text-secondary">
									{svc.uptime}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

