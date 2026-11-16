import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { AntibioticItem } from "../types";

interface AllergiesStepProps {
	antibiotics: AntibioticItem[];
	selectedAllergies: Map<string, string>;
	search: string;
	onSearchChange: (value: string) => void;
	onToggle: (antibiotic: AntibioticItem) => void;
	onRemove: (id: string) => void;
	onBack: () => void;
	isDiagnosing: boolean;
}

export function AllergiesStep({
	antibiotics,
	selectedAllergies,
	search,
	onSearchChange,
	onToggle,
	onRemove,
	onBack,
	isDiagnosing,
}: AllergiesStepProps) {
	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return antibiotics;
		return antibiotics.filter((a) => (a.name || a.Name || "").toLowerCase().includes(q));
	}, [antibiotics, search]);

	return (
		<section>
			<div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 mb-5 shadow-xs">
				<h2 className="flex items-center gap-2.5 text-[1.05rem] font-bold pb-3.5 mb-2 border-b border-slate-200 text-slate-900">
					<span className="h-6 w-6 rounded-full bg-[#0EA5E9] text-white flex items-center justify-center text-xs font-extrabold shrink-0">
						2
					</span>
					Tiền sử dị ứng kháng sinh
				</h2>

				<p className="text-xs text-slate-500 leading-relaxed mb-4">
					Chọn các kháng sinh mà bệnh nhân có tiền sử dị ứng. Kháng sinh được chọn sẽ được loại trừ
					khỏi gợi ý phác đồ điều trị. Nếu bệnh nhân không có tiền sử dị ứng, có thể để trống.
				</p>

				<label
					htmlFor="antibioticSearch"
					className="block font-bold text-xs uppercase tracking-wider text-slate-600 mb-1.5"
				>
					Tìm kiếm kháng sinh
				</label>
				<input
					id="antibioticSearch"
					type="search"
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder="Nhập tên kháng sinh để lọc danh sách..."
					autoComplete="off"
					className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-medium outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all bg-white"
				/>

				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[340px] overflow-y-auto p-1 mt-3">
					{filtered.length === 0 ? (
						<div className="col-span-full py-6 text-center text-xs italic text-slate-400">
							Không tìm thấy kháng sinh phù hợp
						</div>
					) : (
						filtered.map((a) => {
							const id = String(a.id || a.Id);
							const name = a.name || a.Name || id;
							const isChecked = selectedAllergies.has(id);

							return (
								<label
									key={id}
									className={cn(
										"flex items-center gap-2.5 p-2.5 border rounded-lg text-sm font-semibold cursor-pointer transition-all",
										isChecked
											? "border-[#0EA5E9] bg-[#F0F9FF]"
											: "border-slate-200 bg-[#FBFCFE] hover:border-[#0EA5E9]/50"
									)}
								>
									<input
										type="checkbox"
										checked={isChecked}
										onChange={() => onToggle(a)}
										className="accent-[#0EA5E9] h-4 w-4 shrink-0 rounded cursor-pointer"
									/>
									<span className="truncate text-slate-800">{name}</span>
								</label>
							);
						})
					)}
				</div>

				<div className="flex items-center gap-2 mt-5 mb-2 pb-2 border-b border-dashed border-slate-200 text-xs font-extrabold tracking-wider uppercase text-slate-500">
					<span>Kháng sinh đã chọn dị ứng</span>
					<span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-[0.7rem] font-extrabold min-w-[1.45rem] text-center">
						{selectedAllergies.size}
					</span>
				</div>

				<div className="flex flex-wrap gap-2 min-h-[32px] items-center">
					{selectedAllergies.size === 0 ? (
						<div className="text-xs italic text-slate-400 py-1">
							Chưa chọn kháng sinh nào (Không ghi nhận dị ứng)
						</div>
					) : (
						Array.from(selectedAllergies.entries()).map(([id, name]) => (
							<span
								key={id}
								className="inline-flex items-center gap-1.5 py-1 pl-3 pr-1.5 rounded-full bg-[#F0F9FF] text-[#0284C7] text-xs font-bold border border-[#BAE6FD]"
							>
								<span>{name}</span>
								<button
									type="button"
									onClick={() => onRemove(id)}
									className="h-4.5 w-4.5 rounded-full bg-[#0EA5E9]/15 hover:bg-red-500 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
									aria-label={`Bỏ chọn ${name}`}
								>
									&times;
								</button>
							</span>
						))
					)}
				</div>
			</div>

			<div className="flex gap-3 flex-col sm:flex-row">
				<button
					type="button"
					onClick={onBack}
					className="flex-1 py-3.5 px-6 rounded-xl bg-[#F0F9FF] hover:bg-sky-100 text-[#0284C7] font-bold text-sm border border-[#BAE6FD] transition-colors cursor-pointer"
				>
					Quay lại
				</button>
				<button
					type="submit"
					disabled={isDiagnosing}
					className="flex-1 py-3.5 px-6 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold text-sm shadow-[0_4px_12px_rgba(14,165,233,0.25)] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
				>
					{isDiagnosing ? (
						<>
							<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
							<span>Đang chẩn đoán...</span>
						</>
					) : (
						<span>Xác nhận chẩn đoán</span>
					)}
				</button>
			</div>
		</section>
	);
}
