import Link from "next/link";
import { ArrowLeft, CheckCircle, FileText, Layers, Pill, ShieldAlert } from "lucide-react";
import { AntibioticResult } from "../types";
import { AwareBadge } from "./AwareBadge";
import { formatCrclRange, translateRoute } from "../services/antibioticApi";

export function AntibioticDetailView({
	antibiotic,
}: {
	antibiotic: AntibioticResult;
}) {
	const standardDosages = (antibiotic.dosages || []).filter((d) => !d.crcl);
	const gfrDosages = (antibiotic.dosages || []).filter((d) => d.crcl !== null);

	return (
		<div className="min-h-full bg-[#F8FAFC] p-6 lg:p-8 space-y-6">
			{/* Back Link */}
			<Link
				href="/doctor/info"
				className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#0EA5E9] hover:text-[#25B4F8] transition-colors"
			>
				<ArrowLeft className="h-4 w-4" />
				<span>Danh sách kháng sinh</span>
			</Link>

			{/* Hero Banner */}
			<div
				style={{ borderRadius: "14px" }}
				className="bg-gradient-to-r from-[#E0F2FE]/80 to-white border border-sky-100/90 rounded-[14px] p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-2xs"
			>
				<div className="flex items-center gap-5">
					<div className="h-16 w-16 rounded-2xl bg-white border border-sky-100 flex items-center justify-center shrink-0 shadow-2xs">
						<Pill className="h-7 w-7 text-[#0EA5E9] -rotate-45" />
					</div>
					<div>
						<div className="flex flex-wrap items-center gap-2.5 mb-1.5">
							<h1 className="text-2xl font-bold text-slate-900 tracking-tight">
								{antibiotic.name}
							</h1>
							<AwareBadge value={antibiotic.classification} />
						</div>
						<p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
							{antibiotic.antibioticGroup?.description ||
								`Thuộc nhóm kháng sinh ${antibiotic.antibioticGroup?.name || "lâm sàng"}.`}
						</p>
					</div>
				</div>

				<div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 shrink-0">
					<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-slate-700 text-xs font-semibold border border-slate-200/70 shadow-2xs">
						<Layers className="h-3.5 w-3.5 text-[#0EA5E9]" />
						<span>{antibiotic.antibioticGroup?.name || "Kháng sinh"}</span>
					</span>
					{antibiotic.antibioticGroup?.parentName && (
						<span className="text-[11px] text-slate-400">
							Nhóm cha: {antibiotic.antibioticGroup.parentName}
						</span>
					)}
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Standard Dosages (Liều chuẩn) */}
				<div className="lg:col-span-1 space-y-3">
					<div className="flex items-center gap-2">
						<CheckCircle className="h-4 w-4 text-[#0EA5E9]" />
						<h2 className="text-[15px] font-bold text-slate-900">Liều dùng chuẩn</h2>
					</div>

					<div
						style={{ borderRadius: "14px" }}
						className="bg-white rounded-[14px] border border-slate-100/90 shadow-2xs overflow-hidden divide-y divide-slate-100/80"
					>
						{standardDosages.length === 0 ? (
							<div className="p-5 text-center text-xs text-slate-400">
								Chưa có thông tin liều chuẩn riêng biệt. Vui lòng tham khảo hướng dẫn điều trị của bệnh viện.
							</div>
						) : (
							standardDosages.map((d, index) => (
								<div key={d.id || index} className="p-4 space-y-1.5">
									<div className="flex items-center justify-between">
										<span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
											{translateRoute(d.routeOfAdministration)}
										</span>
										<span className="px-2 py-0.5 rounded-[4px] bg-sky-50 text-[#0EA5E9] text-[10.5px] font-bold">
											Liều thường quy
										</span>
									</div>
									<p className="text-[13.5px] font-bold text-slate-800 leading-snug">
										{d.dose}
									</p>
								</div>
							))
						)}
					</div>

					{/* Group description box if available */}
					{antibiotic.antibioticGroup?.description && (
						<div
							style={{ borderRadius: "14px" }}
							className="bg-slate-50/70 rounded-[14px] border border-slate-200/60 p-4 space-y-2 text-xs"
						>
							<div className="flex items-center gap-1.5 font-bold text-slate-700">
								<FileText className="h-3.5 w-3.5 text-slate-400" />
								<span>Ghi chú nhóm dược lý</span>
							</div>
							<p className="text-slate-500 leading-relaxed">
								{antibiotic.antibioticGroup.description}
							</p>
						</div>
					)}
				</div>

				{/* GFR Adjustments (Điều chỉnh theo chức năng thận) */}
				<div className="lg:col-span-2 space-y-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<ShieldAlert className="h-4 w-4 text-amber-500" />
							<h2 className="text-[15px] font-bold text-slate-900">
								Điều chỉnh liều theo chức năng thận (GFR / CrCl)
							</h2>
						</div>
						<span className="text-[11px] font-medium text-slate-400">
							{gfrDosages.length} mốc điều chỉnh
						</span>
					</div>

					{gfrDosages.length === 0 ? (
						<div
							style={{ borderRadius: "14px" }}
							className="bg-white rounded-[14px] border border-slate-100/90 shadow-2xs p-6 text-center text-xs text-slate-500 space-y-1"
						>
							<p className="font-semibold text-slate-700">
								Không yêu cầu chỉnh liều đặc biệt theo GFR
							</p>
							<p className="text-slate-400">
								Kháng sinh này thải trừ chủ yếu qua gan hoặc có độc tính thận thấp. Sử dụng liều chuẩn theo hướng dẫn lâm sàng.
							</p>
						</div>
					) : (
						<div className="space-y-3">
							{gfrDosages.map((d, index) => (
								<div
									key={d.id || index}
									style={{ borderRadius: "14px" }}
									className="bg-white rounded-[14px] border border-slate-100/90 shadow-2xs px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-sky-100 transition-colors"
								>
									<div className="space-y-1">
										<div className="flex items-center gap-2">
											<span className="text-[13.5px] font-bold text-slate-900">
												{formatCrclRange(d.crcl)}
											</span>
											<span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-[4px]">
												{translateRoute(d.routeOfAdministration)}
											</span>
										</div>
										<p className="text-xs text-slate-600 font-medium leading-relaxed">
											{d.dose}
										</p>
									</div>

									<span className="inline-flex items-center px-3 py-1 rounded-full bg-[#E0F2FE] text-[#0EA5E9] text-xs font-semibold shrink-0">
										Chỉnh liều
									</span>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default AntibioticDetailView;
