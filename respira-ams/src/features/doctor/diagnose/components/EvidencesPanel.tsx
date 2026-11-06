import { cn } from "@/lib/utils";
import { Evidence, RelatedObservation } from "../types";

function ObservationRow({ obs }: { obs: RelatedObservation }) {
	const o = obs as Record<string, unknown>;
	const vObj = (o.variable || o.Variable || {}) as {
		code?: string;
		Code?: string;
		name?: string;
		Name?: string;
	};
	const code = vObj.code || vObj.Code || "";
	const name = vObj.name || vObj.Name || "";
	const label = name && code ? `${code} - ${name}` : code || name || "Unknown";

	const num = o.numericValue ?? o.NumericValue;
	const bool = o.booleanValue ?? o.BooleanValue;
	const cat = o.categoricalValue ?? o.CategoricalValue;
	const val =
		num !== undefined && num !== null
			? num
			: bool !== undefined && bool !== null
			? bool
				? "true"
				: "false"
			: cat ?? "(no value)";

	return (
		<div className="flex items-baseline justify-between gap-2 font-mono text-[0.75rem]">
			<span className="text-slate-700">{label}</span>
			<span className="font-bold text-[#0284C7] shrink-0">{String(val)}</span>
		</div>
	);
}

function EvidenceItem({ evidence }: { evidence: Evidence | string }) {
	if (typeof evidence === "string") {
		return (
			<div className="p-3 bg-white border border-dashed border-slate-200 rounded-xl text-xs font-mono whitespace-pre-wrap text-slate-700">
				{evidence}
			</div>
		);
	}

	const ev = evidence;
	const source = ev.source || ev.Source || "Evidence";
	const formula = ev.formula || ev.Formula;
	const related = (ev.relatedObservations || ev.RelatedObservations || []) as RelatedObservation[];
	const missing = (ev.missingVariables || ev.MissingVariables || []) as {
		code?: string;
		Code?: string;
	}[];
	const score = ev.score ?? ev.Score;
	const isMajor = ev.isMajor ?? ev.IsMajor;
	const rawVal = ev.evaluatedValue ?? ev.EvaluatedValue;

	const missingCodes = missing.map((m) => m.code || m.Code).filter(Boolean);
	const hasScore = score !== undefined && score !== null;
	const hasMajor = isMajor !== undefined && isMajor !== null;

	return (
		<div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
			<div className="font-extrabold text-sm text-slate-900">{source}</div>

			{formula && (
				<div className="flex items-baseline justify-between gap-2">
					<span className="font-extrabold uppercase text-[0.7rem] text-slate-400 tracking-wider shrink-0">
						Formula
					</span>
					<code className="font-mono text-xs bg-slate-100 border border-slate-200 rounded px-2 py-0.5 text-slate-700 break-all text-right">
						{formula}
					</code>
				</div>
			)}

			{(related.length > 0 || missingCodes.length > 0) && (
				<div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-2.5 space-y-1">
					<div className="text-[0.7rem] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
						Variables
					</div>
					{related.length > 0 ? (
						related.map((obs, i) => <ObservationRow key={i} obs={obs} />)
					) : (
						<div className="text-slate-400 italic">(none)</div>
					)}
				</div>
			)}

			<div className="flex items-baseline justify-between gap-2">
				<span className="font-extrabold uppercase text-[0.7rem] text-slate-400 tracking-wider shrink-0">
					Value
				</span>
				{missingCodes.length > 0 ? (
					<span className="font-semibold text-amber-700 text-right">
						not evaluated (missing {missingCodes.join(", ")})
					</span>
				) : (
					<span className="font-bold text-slate-900 text-right">
						{rawVal !== null && rawVal !== undefined ? String(rawVal) : "not evaluated"}
					</span>
				)}
			</div>

			{(hasScore || hasMajor) && (
				<div className="flex flex-wrap gap-1.5 pt-1">
					{hasScore && (
						<span className="px-2 py-0.5 rounded-full text-[0.72rem] font-extrabold bg-[#F0F9FF] text-[#0284C7]">
							Score: {score}
						</span>
					)}
					{hasMajor && (
						<span
							className={cn(
								"px-2 py-0.5 rounded-full text-[0.72rem] font-extrabold",
								isMajor ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-600"
							)}
						>
							{isMajor ? "Major criteria" : "Minor criteria"}
						</span>
					)}
				</div>
			)}
		</div>
	);
}

interface EvidencesPanelProps {
	evidences: (Evidence | string)[];
	expanded: boolean;
	onToggle: () => void;
}

export function EvidencesPanel({ evidences, expanded, onToggle }: EvidencesPanelProps) {
	if (evidences.length === 0) return null;

	return (
		<div className="mt-4">
			<button
				type="button"
				onClick={onToggle}
				className="w-full py-2.5 px-4 rounded-xl bg-[#F0F9FF] hover:bg-sky-100 text-[#0284C7] font-bold text-xs border border-[#BAE6FD] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
			>
				{expanded ? "Hide" : "View"} Evidences ({evidences.length})
			</button>

			{expanded && (
				<div className="mt-3 p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-3">
					<h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
						Evidences
					</h3>
					<div className="space-y-2.5">
						{evidences.map((e, i) => (
							<EvidenceItem key={i} evidence={e} />
						))}
					</div>
				</div>
			)}
		</div>
	);
}

