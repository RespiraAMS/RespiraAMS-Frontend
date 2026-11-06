import { useState } from "react";
import { cn } from "@/lib/utils";
import { PathogenResult } from "../types";
import { ResultCard } from "./ResultCard";

interface InfectionAssessmentCardProps {
	heavy: PathogenResult[];
	worth: PathogenResult[];
}

export function InfectionAssessmentCard({ heavy, worth }: InfectionAssessmentCardProps) {
	const [worthExpanded, setWorthExpanded] = useState(false);

	return (
		<ResultCard step={3} title="Infection Assessment">
			{/* Heavy Suspected */}
			<div className="bg-linear-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-4 mb-4">
				<h3 className="flex items-center gap-1.5 text-red-800 font-extrabold text-sm mb-1">
					<svg
						className="w-4 h-4 text-red-700"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<circle cx="12" cy="12" r="10" />
						<line x1="12" y1="8" x2="12" y2="12" />
						<line x1="12" y1="16" x2="12.01" y2="16" />
					</svg>
					<span>Heavy Suspected</span>
				</h3>
				<p className="text-xs text-red-700/80 mb-3">
					Ranked from most to least suspected - rank 1 is the most likely.
				</p>

				{heavy.length === 0 ? (
					<div className="text-xs italic text-slate-400 py-1">
						No heavy suspected pathogens
					</div>
				) : (
					<div className="space-y-1">
						{heavy.map((p, idx) => (
							<div
								key={idx}
								className="flex items-center gap-3 py-2 border-t border-red-100 first:border-t-0 text-sm font-semibold text-slate-900"
							>
								<span
									className={cn(
										"inline-flex items-center justify-center min-w-[2rem] h-6 px-1.5 rounded-full text-xs font-extrabold shrink-0",
										idx === 0 ? "bg-red-800 text-white" : "bg-red-100 text-red-800"
									)}
								>
									#{idx + 1}
								</span>
								<span className="italic flex-1">{p.name || p.Name}</span>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Worth Suspected */}
			<div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
				<button
					type="button"
					onClick={() => setWorthExpanded((prev) => !prev)}
					className="w-full flex items-center gap-2 text-slate-700 font-bold text-sm text-left cursor-pointer"
				>
					<svg
						className={cn(
							"w-4 h-4 shrink-0 transition-transform duration-150",
							worthExpanded && "rotate-90"
						)}
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<polyline points="9 6 15 12 9 18" />
					</svg>
					<span>Worth Suspected</span>
					<span className="ml-auto rounded-full bg-slate-200 text-slate-600 px-2 py-0.5 text-xs font-extrabold">
						{worth.length}
					</span>
				</button>

				{worthExpanded && (
					<div className="mt-3 pt-3 border-t border-slate-200/80 space-y-1">
						{worth.length === 0 ? (
							<div className="text-xs italic text-slate-400 py-1">
								No worth suspected pathogens
							</div>
						) : (
							worth.map((p, idx) => (
								<div
									key={idx}
									className="py-1.5 text-sm font-semibold italic text-slate-800 border-t border-slate-200/50 first:border-t-0"
								>
									{p.name || p.Name}
								</div>
							))
						)}
					</div>
				)}
			</div>
		</ResultCard>
	);
}

