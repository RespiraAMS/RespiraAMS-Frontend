import { AwareClass } from "../types";
import { cn } from "@/lib/utils";

interface BadgeStyle {
	wrap: string;
	dot: string;
	label: string;
}

const STYLES: Record<string, BadgeStyle> = {
	Access: {
		wrap: "bg-[#0EA5E9] text-white",
		dot: "bg-white",
		label: "Access",
	},
	AccessWatch: {
		wrap: "bg-[#E0F2FE] text-[#0369A1] border border-sky-200",
		dot: "bg-[#0EA5E9]",
		label: "Access-Watch",
	},
	Watch: {
		wrap: "bg-[#FEF3C7] text-[#92400E] border border-amber-200/60",
		dot: "bg-[#D97706]",
		label: "Watch",
	},
	Reserve: {
		wrap: "bg-[#FEE2E2] text-[#991B1B] border border-red-200/60",
		dot: "bg-[#DC2626]",
		label: "Reserve",
	},
	Others: {
		wrap: "bg-slate-100 text-slate-700 border border-slate-200",
		dot: "bg-slate-500",
		label: "Khác",
	},
	Unclassified: {
		wrap: "bg-slate-50 text-slate-500 border border-slate-200",
		dot: "bg-slate-400",
		label: "Chưa phân loại",
	},
};

export function AwareBadge({ value }: { value?: AwareClass | string }) {
	const key = value ? String(value) : "Unclassified";
	const style = STYLES[key] || {
		wrap: "bg-slate-100 text-slate-700 border border-slate-200",
		dot: "bg-slate-400",
		label: key,
	};

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold select-none",
				style.wrap
			)}
		>
			<span className={cn("h-1.5 w-1.5 rounded-full shrink-0", style.dot)} />
			{style.label}
		</span>
	);
}

export default AwareBadge;
