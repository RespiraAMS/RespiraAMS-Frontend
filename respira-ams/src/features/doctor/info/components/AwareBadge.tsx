import { AwareClass } from "../types";
import { cn } from "@/lib/utils";

const STYLES: Record<AwareClass, { wrap: string; dot: string }> = {
	Access: { wrap: "bg-[#0EA5E9] text-white", dot: "bg-white" },
	Watch: { wrap: "bg-[#FEF3C7] text-[#92400E]", dot: "bg-[#D97706]" },
	Reserve: { wrap: "bg-[#FEE2E2] text-[#991B1B]", dot: "bg-[#DC2626]" },
};

export function AwareBadge({ value }: { value: AwareClass }) {
	const s = STYLES[value];
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
				s.wrap
			)}
		>
			<span className={cn("h-1.5 w-1.5 rounded-full shrink-0", s.dot)} />
			{value}
		</span>
	);
}
