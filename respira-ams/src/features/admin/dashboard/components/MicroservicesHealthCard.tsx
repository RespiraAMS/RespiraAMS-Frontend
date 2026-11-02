"use client";

import { Activity, CheckCircle2, Server } from "lucide-react";
import { MicroserviceStatus } from "../types";

interface MicroservicesHealthCardProps {
	services: MicroserviceStatus[];
}

export function MicroservicesHealthCard({ services }: MicroservicesHealthCardProps) {
	return (
		<div className="bg-white rounded-[12px] p-5 border border-slate-100 shadow-2xs">
			<div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
				<div className="flex items-center gap-2.5">
					<div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-sky-50 text-[#0EA5E9]">
						<Activity className="h-4 w-4" />
					</div>
					<div>
						<h3 className="text-sm font-bold text-slate-900">
							Hạ tầng Vi dịch vụ (Microservices Architecture)
						</h3>
						<p className="text-xs text-slate-500">
							Giám sát tình trạng hoạt động thực tế của cụm dịch vụ Backend .NET 10 & Aspire
						</p>
					</div>
				</div>

				<div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
					<span className="relative flex h-2 w-2">
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
						<span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
					</span>
					<span>7/7 Đang hoạt động</span>
				</div>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full text-left border-collapse text-xs">
					<thead>
						<tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
							<th className="py-2.5 px-3">Tên Dịch vụ</th>
							<th className="py-2.5 px-3">Microservice</th>
							<th className="py-2.5 px-3">Port</th>
							<th className="py-2.5 px-3">Trạng thái</th>
							<th className="py-2.5 px-3">Độ trễ</th>
							<th className="py-2.5 px-3 text-right">Uptime</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-50">
						{services.map((svc) => (
							<tr key={svc.id} className="hover:bg-slate-50/70 transition-colors">
								<td className="py-3 px-3">
									<div className="flex items-center gap-2">
										<Server className="h-3.5 w-3.5 text-slate-400" />
										<span className="font-semibold text-slate-800">{svc.name}</span>
									</div>
									<p className="text-[11px] text-slate-400 line-clamp-1">{svc.description}</p>
								</td>
								<td className="py-3 px-3 font-mono text-[11px] text-slate-600">
									{svc.service}
								</td>
								<td className="py-3 px-3 font-mono text-[11px] text-slate-500">
									:{svc.port}
								</td>
								<td className="py-3 px-3">
									<span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-medium text-emerald-700">
										<CheckCircle2 className="h-3 w-3 text-emerald-600" />
										Operational
									</span>
								</td>
								<td className="py-3 px-3 font-medium text-slate-700">
									<span className="inline-block rounded-[4px] bg-slate-100 px-1.5 py-0.5 text-[10.5px]">
										{svc.latencyMs} ms
									</span>
								</td>
								<td className="py-3 px-3 text-right font-medium text-slate-600">
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

