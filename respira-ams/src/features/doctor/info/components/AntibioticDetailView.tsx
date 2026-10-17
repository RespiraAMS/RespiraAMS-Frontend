import Link from "next/link";
import { ArrowLeft, Pill } from "lucide-react";
import { AntibioticLookupItem } from "../types";

export function AntibioticDetailView({
	antibiotic,
}: {
	antibiotic: AntibioticLookupItem;
}) {
	const { dosage } = antibiotic;
	const rows = [
		{ label: "Đường dùng", value: dosage.route },
		{ label: "Liều chuẩn", value: dosage.standard },
		{ label: "Liều tối đa", value: dosage.max },
	];

	return (
		<div className="min-h-full bg-[#F8FAFC] p-6 lg:p-8 space-y-6">
			<Link
				href="/doctor/info"
				className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#0EA5E9] hover:text-[#25B4F8] transition-colors"
			>
				<ArrowLeft className="h-4 w-4" />
				<span>Danh sách kháng sinh</span>
			</Link>

			{/* Hero */}
			<div
				style={{ borderRadius: "14px" }}
				className="bg-[#E0F2FE]/70 border border-sky-100 rounded-[14px] px-7 py-6 flex items-center gap-5"
			>
				<div className="h-14 w-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-2xs">
					<Pill className="h-6 w-6 text-[#0EA5E9] -rotate-45" />
				</div>
				<div>
					<h2 className="text-xl font-bold text-slate-900 tracking-tight">
						{antibiotic.name}
					</h2>
					<p className="text-xs text-slate-500 mt-1">{antibiotic.subtitle}</p>
					<span className="inline-flex items-center mt-2 px-3 py-1 rounded-full bg-white text-[#0EA5E9] text-[11px] font-semibold shadow-2xs">
						Kháng sinh
					</span>
				</div>
			</div>

			{/* Dosage */}
			<section>
				<h3 className="text-[15px] font-bold text-slate-900 mb-3">Liều dùng</h3>
				<div
					style={{ borderRadius: "14px" }}
					className="bg-white rounded-[14px] border border-slate-100/90 shadow-2xs overflow-hidden divide-y divide-slate-100"
				>
					{rows.map((r) => (
						<div
							key={r.label}
							className="flex items-center justify-between px-5 py-1.5 text-[12.5px]"
						>
							<span className="text-slate-400">{r.label}</span>
							<span className="font-bold text-slate-900">{r.value}</span>
						</div>
					))}
				</div>
			</section>

			{/* GFR */}
			<section>
				<h3 className="text-[15px] font-bold text-slate-900 mb-3">
					Điều chỉnh theo GFR
				</h3>
				<div className="space-y-4">
					{antibiotic.gfr.map((g) => (
						<div
							key={g.range}
							style={{ borderRadius: "14px" }}
							className="bg-white rounded-[14px] border border-slate-100/90 shadow-2xs px-5 py-4 flex items-center justify-between"
						>
							<div>
								<p className="text-[13.5px] font-bold text-slate-900">{g.range}</p>
								<p className="text-xs text-slate-400 mt-0.5">{g.route}</p>
							</div>
							<span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#E0F2FE] text-[#0EA5E9] text-xs font-semibold">
								{g.label}
							</span>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}

export default AntibioticDetailView;
