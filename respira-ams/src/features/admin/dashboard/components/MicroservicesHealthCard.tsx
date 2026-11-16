"use client";

import { useTranslations } from "next-intl";
import { Activity, CheckCircle2, Server, XCircle } from "lucide-react";
import { MicroserviceStatus } from "../types";

interface MicroservicesHealthCardProps {
	services: MicroserviceStatus[];
}

export function MicroservicesHealthCard({ services }: MicroservicesHealthCardProps) {
	const t = useTranslations("admin.dashboard");
	const activeCount = services.filter((service) => service.status === "operational").length;
	const allOperational = services.length > 0 && activeCount === services.length;

	return (
		<div className="bg-surface rounded-[12px] p-5 border border-border-subtle shadow-2xs">
			<div className="flex items-center justify-between mb-4 pb-3 border-b border-border-subtle">
				<div className="flex items-center gap-2.5">
					<div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
						<Activity className="h-4 w-4" />
					</div>
					<div>
						<h3 className="text-sm font-bold text-text-primary">
							{t("microservicesTitle")}
						</h3>
						<p className="text-xs text-text-secondary">
							{t("microservicesSubtitle")}
						</p>
					</div>
				</div>

				<div
					className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
						allOperational
							? "bg-success/10 text-success border-success/30"
							: "bg-warning/10 text-warning border-warning/30"
					}`}
				>
					<span className="relative flex h-2 w-2">
						{allOperational && (
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
						)}
						<span
							className={`relative inline-flex h-2 w-2 rounded-full ${
								allOperational ? "bg-success" : "bg-warning"
							}`}
						/>
					</span>
					<span>
						{activeCount}/{services.length} {t("operating")}
					</span>
				</div>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full text-left border-collapse text-xs">
					<thead>
						<tr className="border-b border-border-subtle text-text-tertiary font-semibold uppercase text-[10px] tracking-wider">
							<th className="py-2.5 px-3">{t("colServiceName")}</th>
							<th className="py-2.5 px-3">{t("colMicroservice")}</th>
							<th className="py-2.5 px-3">{t("colStatus")}</th>
							<th className="py-2.5 px-3 text-right">{t("colLatency")}</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border-subtle">
						{services.map((svc) => {
							const operational = svc.status === "operational";
							return (
								<tr key={svc.id} className="hover:bg-surface-secondary/70 transition-colors">
									<td className="py-3 px-3">
										<div className="flex items-center gap-2">
											<Server className="h-3.5 w-3.5 text-text-tertiary" />
											<span className="font-semibold text-text-primary">{svc.name}</span>
										</div>
									</td>
									<td className="py-3 px-3 font-mono text-[11px] text-text-secondary">
										{svc.service}
									</td>
									<td className="py-3 px-3">
										<span
											className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-medium ${
												operational
													? "bg-success/10 text-success"
													: "bg-error/10 text-error"
											}`}
										>
											{operational ? (
												<CheckCircle2 className="h-3 w-3" />
											) : (
												<XCircle className="h-3 w-3" />
											)}
											{operational ? t("statusOperational") : t("statusDown")}
										</span>
									</td>
									<td className="py-3 px-3 text-right font-medium text-text-primary">
										<span className="inline-block rounded-[4px] bg-surface-secondary px-1.5 py-0.5 text-[10.5px]">
											{operational ? `${svc.latencyMs} ms` : "—"}
										</span>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
