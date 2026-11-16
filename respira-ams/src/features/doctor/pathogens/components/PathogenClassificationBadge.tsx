import { PathogenClassification } from "../types";
import { cn } from "@/lib/utils";

interface PathogenClassificationBadgeProps {
	classification: PathogenClassification;
}

export function PathogenClassificationBadge({
	classification,
}: PathogenClassificationBadgeProps) {
	const isTypical = classification === "typical";

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold select-none",
				isTypical
					? "bg-[#0EA5E9] text-white"
					: "bg-[#FEF3C7] text-[#92400E]"
			)}
		>
			<span
				className={cn(
					"h-1.5 w-1.5 rounded-full shrink-0",
					isTypical ? "bg-white" : "bg-[#D97706]"
				)}
			/>
			{isTypical ? "Điển hình" : "Không điển hình"}
		</span>
	);
}
