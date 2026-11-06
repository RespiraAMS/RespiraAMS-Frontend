import { useMemo } from "react";
import { ClinicalVariable } from "../types";
import {
	CATEGORY_LABELS,
	FieldMeta,
	FieldStatus,
	categoryRank,
	normalizeCategoryKey,
} from "../utils";
import { VariableField } from "./VariableField";

interface ObservationsStepProps {
	variables: ClinicalVariable[];
	metaMap: Record<string, FieldMeta>;
	values: Record<string, string>;
	fieldStatuses: Record<string, FieldStatus>;
	onValueChange: (id: string, value: string) => void;
	registerFieldRef: (id: string, el: HTMLDivElement | null) => void;
	onNext: () => void;
}

export function ObservationsStep({
	variables,
	metaMap,
	values,
	fieldStatuses,
	onValueChange,
	registerFieldRef,
	onNext,
}: ObservationsStepProps) {
	const groups = useMemo(() => {
		const buckets = new Map<string, ClinicalVariable[]>();
		variables.forEach((v) => {
			const key = normalizeCategoryKey(v.category ?? v.Category);
			if (!buckets.has(key)) buckets.set(key, []);
			buckets.get(key)!.push(v);
		});

		return Array.from(buckets.keys())
			.sort((a, b) => categoryRank(a) - categoryRank(b) || a.localeCompare(b))
			.map((key) => ({
				key,
				label: CATEGORY_LABELS[key] || key,
				items: buckets.get(key) || [],
			}));
	}, [variables]);

	return (
		<section>
			<div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 mb-5 shadow-xs">
				<h2 className="flex items-center gap-2.5 text-[1.05rem] font-bold pb-3.5 mb-5 border-b border-slate-200 text-slate-900">
					<span className="h-6 w-6 rounded-full bg-[#0EA5E9] text-white flex items-center justify-center text-xs font-extrabold shrink-0">
						1
					</span>
					Clinical Observations
				</h2>

				<div className="space-y-6">
					{groups.map((group) => (
						<div key={group.key}>
							<div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-dashed border-slate-200 text-xs font-extrabold tracking-wider uppercase text-slate-500">
								<span>{group.label}</span>
								<span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-[0.7rem] font-extrabold min-w-[1.45rem] text-center">
									{group.items.length}
								</span>
							</div>

							<div className="space-y-3">
								{group.items.map((v) => {
									const id = String(v.id || v.Id);
									return (
										<VariableField
											key={id}
											variable={v}
											meta={metaMap[id]}
											value={values[id] ?? ""}
											status={fieldStatuses[id]}
											onChange={onValueChange}
											registerRef={registerFieldRef}
										/>
									);
								})}
							</div>
						</div>
					))}
				</div>
			</div>

			<button
				type="button"
				onClick={onNext}
				className="w-full py-3.5 px-6 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold text-sm shadow-[0_4px_12px_rgba(14,165,233,0.25)] transition-all cursor-pointer"
			>
				Next: Antibiotic Allergies
			</button>
		</section>
	);
}

