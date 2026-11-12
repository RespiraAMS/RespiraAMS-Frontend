import { cn } from "@/lib/utils";
import { ClinicalVariable } from "../types";
import { FieldMeta, FieldStatus, normalPlaceholder } from "../utils";

interface VariableFieldProps {
	variable: ClinicalVariable;
	meta?: FieldMeta;
	value: string;
	status?: FieldStatus;
	onChange: (id: string, value: string) => void;
	registerRef: (id: string, el: HTMLDivElement | null) => void;
}

const SEGMENT_BASE =
	"flex-1 px-3 py-2 text-xs font-bold transition-all text-center select-none cursor-pointer";
const SEGMENT_ACTIVE = "bg-[#0EA5E9] text-white";
const SEGMENT_IDLE = "bg-slate-50 hover:bg-slate-100 text-slate-700";

export function VariableField({
	variable: v,
	meta,
	value,
	status,
	onChange,
	registerRef,
}: VariableFieldProps) {
	const id = String(v.id || v.Id);
	const name = v.name || v.Name || "Chỉ số";
	const desc = v.description || v.Description;
	const vt = v.valueType || v.ValueType;
	const isReq = meta?.isRequired;

	const hasError = !!status?.error;
	const hasWarning = !hasError && !!status?.warning;

	const labelColor = hasError
		? "text-red-600"
		: hasWarning
		? "text-amber-800"
		: "text-slate-900";

	const controlBorder = hasError
		? "border-red-500 ring-2 ring-red-500/20"
		: hasWarning
		? "border-amber-400 ring-2 ring-amber-400/20"
		: "border-slate-200";

	const options = v.acceptedValues || v.AcceptedValues || [];

	return (
		<div
			ref={(el) => registerRef(id, el)}
			className={cn(
				"rounded-xl p-3.5 sm:p-4 border transition-all",
				hasError
					? "border-red-500 bg-red-50/70"
					: hasWarning
					? "border-amber-400 bg-amber-50/70"
					: "border-slate-200 bg-[#FBFCFE] focus-within:border-[#0EA5E9] focus-within:bg-[#F0F9FF]/50"
			)}
		>
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
				<div className="flex-1 min-w-[160px]">
					<label htmlFor={`var-${id}`} className={cn("font-bold text-sm block", labelColor)}>
						{name}
						{isReq && <span className="text-red-500 ml-1 font-bold">*</span>}
					</label>
					{desc && (
						<p className="text-xs text-slate-500 mt-0.5 leading-snug">{desc}</p>
					)}
				</div>

				{vt === "Numeric" && (
					<div
						className={cn(
							"flex items-stretch border rounded-lg overflow-hidden shrink-0 min-w-[220px] bg-white transition-all",
							hasError || hasWarning
								? controlBorder
								: "border-slate-200 focus-within:border-[#0EA5E9] focus-within:ring-2 focus-within:ring-[#0EA5E9]/20"
						)}
					>
						<input
							type="number"
							id={`var-${id}`}
							step="any"
							value={value}
							onChange={(e) => onChange(id, e.target.value)}
							placeholder={normalPlaceholder(meta?.normalRange)}
							className="w-full px-3 py-2 text-sm font-semibold text-slate-900 outline-none border-none bg-transparent placeholder:text-slate-400 placeholder:font-normal"
						/>
						{meta?.unit && (
							<span className="flex items-center px-3 bg-slate-50 text-slate-500 font-bold text-xs border-l border-slate-200 whitespace-nowrap select-none">
								{meta.unit}
							</span>
						)}
					</div>
				)}

				{vt === "Categorical" && (
					<div
						className={cn(
							"flex flex-wrap border rounded-lg overflow-hidden shrink-0 min-w-[220px] max-w-full bg-white",
							hasError ? controlBorder : "border-slate-200"
						)}
					>
						{options.map((opt, idx) => {
							const isActive = value === opt;
							return (
								<button
									key={opt}
									type="button"
									onClick={() => onChange(id, isActive ? "" : opt)}
									className={cn(
										SEGMENT_BASE,
										idx > 0 && "border-l border-slate-200",
										isActive ? SEGMENT_ACTIVE : SEGMENT_IDLE
									)}
								>
									{String(opt).replace(/_/g, " ")}
								</button>
							);
						})}
					</div>
				)}

				{vt === "Boolean" && (
					<div
						className={cn(
							"flex border rounded-lg overflow-hidden shrink-0 min-w-[220px] max-w-full bg-white",
							hasError ? controlBorder : "border-slate-200"
						)}
					>
						<button
							type="button"
							onClick={() => onChange(id, value === "false" ? "" : "false")}
							className={cn(
								SEGMENT_BASE,
								"px-4",
								value === "false" ? SEGMENT_ACTIVE : SEGMENT_IDLE
							)}
						>
							Không
						</button>
						<button
							type="button"
							onClick={() => onChange(id, value === "true" ? "" : "true")}
							className={cn(
								SEGMENT_BASE,
								"px-4 border-l border-slate-200",
								value === "true" ? SEGMENT_ACTIVE : SEGMENT_IDLE
							)}
						>
							Có
						</button>
					</div>
				)}
			</div>

			{hasError && (
				<div className="w-full flex items-start gap-1.5 mt-2.5 text-red-600 text-xs font-bold leading-snug">
					<span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-extrabold shrink-0 mt-0.5">
						!
					</span>
					<span>{status?.error}</span>
				</div>
			)}

			{hasWarning && (
				<div className="w-full flex items-start gap-1.5 mt-2.5 text-amber-700 text-xs font-semibold leading-snug">
					<span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-extrabold shrink-0 mt-0.5">
						!
					</span>
					<span>{status?.warning}</span>
				</div>
			)}
		</div>
	);
}
