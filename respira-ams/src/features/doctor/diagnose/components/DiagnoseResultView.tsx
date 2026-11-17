"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
	AWARE_LABELS,
	type AwareClassification,
	type DiagnoseAntibioticDto,
	type DiagnosisResultDto,
	INFECTION_TYPES,
	MIC_CATEGORIES,
} from "../types";
import { diagnoseApi } from "../api";
import {
	formatSeverityLabel,
	formatTreatmentSiteLabel,
	getSampleTypeLabel,
} from "../validation";
import { useConfirmTreatmentMutation } from "../queries";

interface DiagnoseResultViewProps {
	patientId: string;
	diagnosis: DiagnosisResultDto;
	allAntibiotics: DiagnoseAntibioticDto[];
	onResetDiagnosis: () => void;
}

const AWARE_BADGE_STYLES: Record<AwareClassification, string> = {
	Access:
		"border border-emerald-500/30 bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400",
	AccessWatch:
		"border border-teal-500/30 bg-teal-500/15 text-teal-700 hover:bg-teal-500/20 dark:text-teal-400",
	Watch:
		"border border-amber-500/30 bg-amber-500/15 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400",
	Reserve:
		"border border-rose-500/30 bg-rose-500/15 text-rose-700 hover:bg-rose-500/20 dark:text-rose-400",
	Others:
		"border border-sky-500/30 bg-sky-500/15 text-sky-700 hover:bg-sky-500/20 dark:text-sky-400",
	Unclassified:
		"border border-border bg-muted text-muted-foreground hover:bg-muted",
};

export function DiagnoseResultView({
	patientId,
	diagnosis,
	allAntibiotics,
	onResetDiagnosis: _onResetDiagnosis,
}: DiagnoseResultViewProps) {
	const t = useTranslations("doctor.diagnose");
	const router = useRouter();

	const [selectedProtocolKey, setSelectedProtocolKey] = useState<string | null>(
		null
	);
	const [selectedProtocolMedicineIds, setSelectedProtocolMedicineIds] =
		useState<string[]>([]);

	const [customSearch, setCustomSearch] = useState("");
	const [customMedicineIds, setCustomMedicineIds] = useState<Set<string>>(
		new Set()
	);
	const [customReason, setCustomReason] = useState("");
	const [customError, setCustomError] = useState<string | null>(null);

	const [showGroupWarningModal, setShowGroupWarningModal] = useState(false);

	const [showWorthSuspected, setShowWorthSuspected] = useState(false);
	const [showEvidences, setShowEvidences] = useState(false);
	const [showMicrobial, setShowMicrobial] = useState(false);

	const [isConfirming, setIsConfirming] = useState(false);
	const confirmTreatmentMutation = useConfirmTreatmentMutation();

	const filteredCustomAntibiotics = useMemo(() => {
		const q = customSearch.trim().toLowerCase();
		if (!q) return allAntibiotics;
		return allAntibiotics.filter(
			(ab) =>
				ab.name.toLowerCase().includes(q) ||
				ab.antibioticGroupName.toLowerCase().includes(q) ||
				ab.classification.toLowerCase().includes(q)
		);
	}, [allAntibiotics, customSearch]);

	const selectedCustomAntibiotics = useMemo(
		() => allAntibiotics.filter((ab) => customMedicineIds.has(ab.id)),
		[allAntibiotics, customMedicineIds]
	);

	const hasReserveSelected = useMemo(
		() =>
			selectedCustomAntibiotics.some((ab) => ab.classification === "Reserve"),
		[selectedCustomAntibiotics]
	);

	const getLocalizedAwareLabel = (classification: AwareClassification) =>
		classification in AWARE_LABELS
			? t(`awareClassifications.${classification}`)
			: classification;

	const getLocalizedInfectionLabel = (code: string) => {
		const found = INFECTION_TYPES.find((i) => i.name === code);
		return found ? t(`infectionTypes.${found.name}`) : code;
	};

	const getLocalizedMicLabel = (mic: string) => {
		const found = MIC_CATEGORIES.find((m) => m.value === mic);
		return found ? t(`micCategories.${found.value}`) : mic;
	};

	const executeConfirmTreatment = async (
		medicineIds: string[],
		reason: string | null
	) => {
		setIsConfirming(true);
		setCustomError(null);
		try {
			await confirmTreatmentMutation.mutateAsync({
				patientId,
				diagnosis,
				medicines: medicineIds,
				reasonForMedicineChoice: reason,
			});

			router.push(`/doctor/patients/${patientId}`);
		} catch (err) {
			setIsConfirming(false);
			setCustomError(
				err instanceof Error
					? err.message
					: t("result.errors.confirmFailed")
			);
		}
	};

	const handleConfirmProtocol = async () => {
		if (selectedProtocolMedicineIds.length === 0) return;
		await executeConfirmTreatment(selectedProtocolMedicineIds, null);
	};

	const handleConfirmCustom = async () => {
		const ids = Array.from(customMedicineIds);
		if (ids.length === 0) {
			setCustomError(t("result.errors.selectAtLeastOne"));
			return;
		}
		if (!customReason.trim()) {
			setCustomError(t("result.errors.reasonRequired"));
			return;
		}

		setIsConfirming(true);
		setCustomError(null);
		try {
			const warnRes = await diagnoseApi.warnAntibioticCombination(ids);
			if (warnRes.needWarning) {
				setIsConfirming(false);
				setShowGroupWarningModal(true);
				return;
			}
			await executeConfirmTreatment(ids, customReason.trim());
		} catch (err) {
			setIsConfirming(false);
			setCustomError(
				err instanceof Error
					? err.message
					: t("result.errors.warnCheckFailed")
			);
		}
	};

	const severityBadgeColor =
		diagnosis.severity === "Severe"
			? "border border-rose-500/30 bg-rose-500/15 text-rose-700 hover:bg-rose-500/20 dark:text-rose-400"
			: diagnosis.severity === "Moderate"
				? "border border-amber-500/30 bg-amber-500/15 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400"
				: "border border-emerald-500/30 bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400";

	return (
		<div className="space-y-4 text-foreground">
			<Tabs defaultValue="protocol" className="w-full">
				<TabsList className="grid w-full grid-cols-2 h-auto! items-stretch bg-primary/10 dark:bg-primary/15 border border-primary/20 p-0 rounded-lg overflow-hidden">
					<TabsTrigger
						value="protocol"
						className="text-primary hover:text-primary/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all h-full py-3"
					>
						{t("result.tabs.protocol")}
					</TabsTrigger>
					<TabsTrigger
						value="custom"
						className="text-primary hover:text-primary/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all h-full py-3"
					>
						{t("result.tabs.custom")}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="protocol" className="mt-4 space-y-4">
					<div className="rounded-xl border border-border bg-card text-card-foreground p-5 shadow-sm space-y-4">
						<h3 className="border-b border-border pb-2.5 text-base font-bold text-foreground">
							{t("result.stratification.title")}
						</h3>

						<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
							<div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3.5">
								<span className="text-xs font-semibold uppercase text-muted-foreground">
									{t("result.stratification.severityLabel")}
								</span>
								<Badge className={severityBadgeColor}>
									{formatSeverityLabel(diagnosis.severity, t)}
								</Badge>
							</div>

							<div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3.5">
								<span className="text-xs font-semibold uppercase text-muted-foreground">
									{t("result.stratification.treatmentSiteLabel")}
								</span>
								<Badge variant="secondary">
									{formatTreatmentSiteLabel(diagnosis.treatmentSite, t)}
								</Badge>
							</div>

							<div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3.5">
								<span className="text-xs font-semibold uppercase text-muted-foreground">
									{t("result.stratification.egfrLabel")}
								</span>
								<span className="text-sm font-bold text-foreground">
									{diagnosis.egfr !== undefined && diagnosis.egfr !== null
										? Number(diagnosis.egfr).toFixed(2)
										: "—"}
								</span>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
							<div
								className={cn(
									"rounded-lg border p-3 text-xs",
									diagnosis.isPatientPregnantOrInLactationPhase
										? "border-destructive/50 bg-destructive/10 text-destructive"
										: "border-border bg-muted/20 text-foreground"
								)}
							>
								<div className="font-bold uppercase text-[11px]">
									{t("result.stratification.pregnancyLabel")}
								</div>
								<div className="mt-0.5 font-medium">
									{diagnosis.isPatientPregnantOrInLactationPhase
										? t("result.stratification.pregnancyYes")
										: t("result.stratification.pregnancyNo")}
								</div>
							</div>

							<div
								className={cn(
									"rounded-lg border p-3 text-xs",
									diagnosis.allergy?.type !== "No"
										? "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300"
										: "border-border bg-muted/20 text-foreground"
								)}
							>
								<div className="font-bold uppercase text-[11px]">
									{t("result.stratification.allergyLabel")}
								</div>
								<div className="mt-0.5 font-medium">
									{diagnosis.allergy?.type === "Yes"
										? diagnosis.allergy.allergicAntibiotics
												.map((a) => a.name)
												.join(", ")
										: diagnosis.allergy?.otherAllergy ||
											t("result.stratification.noAllergy")}
								</div>
							</div>

							<div className="rounded-lg border border-border bg-muted/20 p-3 text-xs text-foreground">
								<div className="font-bold uppercase text-[11px]">
									{t("result.stratification.otherInfectionsLabel")}
								</div>
								<div className="mt-0.5 font-medium">
									{diagnosis.otherInfections?.length > 0
										? diagnosis.otherInfections
												.map((code) => getLocalizedInfectionLabel(code))
												.join(", ")
										: t("result.stratification.noOtherInfections")}
								</div>
							</div>
						</div>

						{diagnosis.metricsSeverityDiagnosis?.length > 0 && (
							<div className="border-t border-dashed border-border pt-4 space-y-2">
								<div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
									{t("result.stratification.scoringMetricsTitle")}
								</div>
								{diagnosis.metricsSeverityDiagnosis.map((m) => {
									const totalScore = m.evidences.reduce(
										(sum, ev) => sum + (ev.score || 0),
										0
									);
									return (
										<div
											key={m.code}
											className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/20 px-3.5 py-2.5 text-xs"
										>
											<div className="flex items-center gap-2">
												<span className="text-sm font-bold text-foreground">
													{m.code}
												</span>
												<Badge variant="secondary">
													{formatSeverityLabel(m.severity, t)}
												</Badge>
											</div>
											<div className="flex items-center gap-2 font-semibold text-muted-foreground">
												<span>
													{t("result.stratification.totalScore", {
														score: totalScore,
													})}
												</span>
												<span>•</span>
												<span>
													{formatTreatmentSiteLabel(m.treatmentSite, t)}
												</span>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>

					{diagnosis.missingVariables?.length > 0 && (
						<div className="rounded-xl border border-amber-500/30 border-l-4 border-l-amber-500 bg-card text-card-foreground p-5 shadow-sm space-y-2">
							<div className="flex items-center gap-2">
								<h3 className="text-sm font-bold text-foreground">
									{t("result.missingVariables.title")}
								</h3>
								<Badge variant="secondary">
									{diagnosis.missingVariables.length}
								</Badge>
							</div>
							<div className="flex flex-wrap gap-1.5">
								{diagnosis.missingVariables.map((mv) => (
									<Badge
										key={mv.id}
										variant="outline"
										className="border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"
									>
										{mv.name || mv.code} ({mv.code})
									</Badge>
								))}
							</div>
						</div>
					)}

					<div className="rounded-xl border border-border bg-card text-card-foreground p-5 shadow-sm space-y-3">
						<h3 className="text-base font-bold text-foreground">
							{t("result.pathogens.title")}
						</h3>

						<div className="rounded-lg border border-destructive/30 bg-destructive/5 dark:bg-destructive/10 p-3.5">
							<div className="text-xs font-bold uppercase text-destructive">
								{t("result.pathogens.heavySuspectedTitle", {
									count: diagnosis.heavySuspected?.length || 0,
								})}
							</div>
							{diagnosis.heavySuspected?.length > 0 ? (
								<div className="mt-2 flex flex-wrap gap-1.5">
									{diagnosis.heavySuspected.map((p) => (
										<Badge
											key={p.id}
											variant="outline"
											className="border-border bg-background text-foreground"
										>
											{p.name}
										</Badge>
									))}
								</div>
							) : (
								<p className="mt-1 text-xs text-muted-foreground">
									{t("result.pathogens.heavySuspectedEmpty")}
								</p>
							)}
						</div>

						<div className="rounded-lg border border-border bg-muted/20 p-3.5">
							<button
								type="button"
								onClick={() => setShowWorthSuspected((prev) => !prev)}
								className="flex w-full items-center justify-between text-xs font-bold text-foreground"
							>
								<span>
									{t("result.pathogens.worthSuspectedTitle", {
										count: diagnosis.worthSuspected?.length || 0,
									})}
								</span>
								{showWorthSuspected ? (
									<ChevronUp className="h-4 w-4 text-muted-foreground" />
								) : (
									<ChevronDown className="h-4 w-4 text-muted-foreground" />
								)}
							</button>
							{showWorthSuspected && (
								<div className="mt-2.5 flex flex-wrap gap-1.5">
									{diagnosis.worthSuspected.map((p) => (
										<Badge key={p.id} variant="secondary">
											{p.name}
										</Badge>
									))}
								</div>
							)}
						</div>
					</div>

					<div className="rounded-xl border border-border bg-card text-card-foreground p-5 shadow-sm space-y-4">
						<div className="flex items-center justify-between border-b border-border pb-2.5">
							<div>
								<h3 className="text-base font-bold text-foreground">
									{t("result.protocols.title")}
								</h3>
								<p className="text-xs text-muted-foreground">
									{t("result.protocols.subtitle")}
								</p>
							</div>
							<Badge variant="secondary">
								{t("result.protocols.count", {
									count: diagnosis.protocols?.length || 0,
								})}
							</Badge>
						</div>

						{!diagnosis.protocols || diagnosis.protocols.length === 0 ? (
							<p className="text-xs italic text-muted-foreground">
								{t("result.protocols.empty")}
							</p>
						) : (
							<div className="space-y-4 max-h-96 overflow-y-auto pr-1">
								{diagnosis.protocols.map((protocol, pIdx) => (
									<div
										key={protocol.id}
										className="rounded-lg border border-border bg-muted/20 p-4 space-y-3"
									>
										<div className="flex flex-wrap items-center justify-between gap-2">
											<span className="text-sm font-bold text-foreground">
												{protocol.name ||
													t("result.protocols.defaultName", {
														index: pIdx + 1,
													})}
											</span>
											<div className="flex flex-wrap gap-1.5">
												<Badge className={severityBadgeColor}>
													{formatSeverityLabel(protocol.severity, t)}
												</Badge>
												<Badge variant="outline" className="border-border">
													{formatTreatmentSiteLabel(
														protocol.treatmentSite,
														t
													)}
												</Badge>
											</div>
										</div>

										<div className="space-y-2">
											{protocol.medicines.map((combo, cIdx) => {
												const optionKey = `${protocol.id}-${cIdx}`;
												const isSelected = selectedProtocolKey === optionKey;
												const comboIds = combo.map((m) => m.id);

												return (
													<button
														key={optionKey}
														type="button"
														onClick={() => {
															setSelectedProtocolKey(optionKey);
															setSelectedProtocolMedicineIds(comboIds);
														}}
														className={cn(
															"w-full rounded-lg border p-3 text-left transition",
															isSelected
																? "border-primary bg-primary/10 dark:bg-primary/15 ring-1 ring-primary"
																: "border-border bg-background hover:border-primary/50"
														)}
													>
														<div className="mb-1.5 flex items-center justify-between">
															<span className="text-[11px] font-bold uppercase text-primary">
																{t("result.protocols.optionLabel", {
																	index: cIdx + 1,
																})}
															</span>
															<span className="text-xs font-semibold text-primary">
																{isSelected
																	? t("result.protocols.selected")
																	: t("result.protocols.selectThis")}
															</span>
														</div>

														<div className="flex flex-wrap items-center gap-1.5">
															{combo.map((med, mIdx) => (
																<React.Fragment key={`${med.id}-${mIdx}`}>
																	{mIdx > 0 && (
																		<span className="text-xs font-bold text-muted-foreground">
																			+
																		</span>
																	)}
																	<span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-foreground">
																		{med.name}
																		<Badge
																			className={cn(
																				"text-[10px] uppercase",
																				AWARE_BADGE_STYLES[
																					med.classification
																				] ||
																					AWARE_BADGE_STYLES.Unclassified
																			)}
																		>
																			{getLocalizedAwareLabel(
																				med.classification
																			)}
																		</Badge>
																	</span>
																</React.Fragment>
															))}
														</div>
													</button>
												);
											})}
										</div>
									</div>
								))}
							</div>
						)}

						{customError && (
							<p className="text-xs font-medium text-destructive">
								{customError}
							</p>
						)}

						<div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
							<span className="text-xs text-muted-foreground">
								{selectedProtocolMedicineIds.length > 0
									? t("result.protocols.selectedSummary", {
											count: selectedProtocolMedicineIds.length,
										})
									: t("result.protocols.selectPrompt")}
							</span>
							<Button
								type="button"
								disabled={
									selectedProtocolMedicineIds.length === 0 || isConfirming
								}
								onClick={handleConfirmProtocol}
								className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
							>
								{isConfirming && <Loader2 className="h-4 w-4 animate-spin" />}
								{isConfirming
									? t("result.protocols.saving")
									: t("result.protocols.confirmButton")}
							</Button>
						</div>
					</div>

					<div className="rounded-xl border border-border bg-card text-card-foreground p-5 shadow-sm space-y-2.5">
						<h3 className="text-sm font-bold text-foreground">
							{t("result.cdss.title")}
						</h3>

						<Button
							type="button"
							variant="outline"
							onClick={() => setShowEvidences((prev) => !prev)}
							className="w-full justify-between text-xs border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
						>
							<span>
								{t("result.cdss.evidencesButton", {
									count: diagnosis.evidences?.length || 0,
								})}
							</span>
							{showEvidences ? (
								<ChevronUp className="h-4 w-4 text-muted-foreground" />
							) : (
								<ChevronDown className="h-4 w-4 text-muted-foreground" />
							)}
						</Button>

						{showEvidences && (
							<div className="max-h-96 space-y-2 overflow-y-auto rounded-lg border border-dashed border-border bg-muted/20 p-3">
								{diagnosis.evidences.map((ev, i) => (
									<div
										key={i}
										className="rounded-md border border-border bg-background p-3 text-xs space-y-1"
									>
										<div className="font-semibold text-foreground">
											{ev.source}
										</div>
										<div className="flex flex-wrap items-center justify-between gap-2 text-muted-foreground">
											<code className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-foreground">
												{ev.formula}
											</code>
											<span>
												{t("result.cdss.resultLabel")}{" "}
												<strong className="text-foreground">
													{ev.evaluatedValue === undefined
														? t("result.cdss.missingData")
														: ev.evaluatedValue
															? t("result.cdss.met")
															: t("result.cdss.notMet")}
												</strong>
												{ev.score !== undefined &&
													` ${t("result.cdss.scorePoints", { score: ev.score })}`}
											</span>
										</div>
									</div>
								))}
							</div>
						)}

						<Button
							type="button"
							variant="outline"
							onClick={() => setShowMicrobial((prev) => !prev)}
							className="w-full justify-between text-xs border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
						>
							<span>
								{t("result.cdss.microbialButton", {
									count: diagnosis.microbialTestResults?.length || 0,
								})}
							</span>
							{showMicrobial ? (
								<ChevronUp className="h-4 w-4 text-muted-foreground" />
							) : (
								<ChevronDown className="h-4 w-4 text-muted-foreground" />
							)}
						</Button>

						{showMicrobial && (
							<div className="space-y-2 rounded-lg border border-dashed border-border bg-muted/20 p-3">
								{diagnosis.microbialTestResults?.length === 0 ? (
									<p className="text-xs italic text-muted-foreground">
										{t("result.cdss.microbialEmpty")}
									</p>
								) : (
									diagnosis.microbialTestResults.map((item, idx) => (
										<div
											key={idx}
											className="rounded-md border border-border bg-background p-3 text-xs font-medium text-foreground"
										>
											{item.pathogen?.name} —{" "}
											{getSampleTypeLabel(item.sampleType, t)} (
											{getLocalizedMicLabel(item.micCategory)})
										</div>
									))
								)}
							</div>
						)}
					</div>
				</TabsContent>

				<TabsContent value="custom" className="mt-4">
					<div className="rounded-xl border border-border bg-card text-card-foreground p-5 shadow-sm space-y-4">
						<div className="border-b border-border pb-3">
							<h3 className="text-base font-bold text-foreground">
								{t("result.custom.title")}
							</h3>
							<p className="mt-1 text-xs text-muted-foreground">
								{t("result.custom.subtitle")}
							</p>
						</div>

						<Input
							type="search"
							value={customSearch}
							onChange={(e) => setCustomSearch(e.target.value)}
							placeholder={t("result.custom.searchPlaceholder")}
							className="bg-background text-foreground border-input"
						/>

						<div className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
							{filteredCustomAntibiotics.map((ab) => {
								const checked = customMedicineIds.has(ab.id);
								return (
									<label
										key={ab.id}
										className={cn(
											"flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 transition",
											checked
												? "border-primary bg-primary/10 dark:bg-primary/15"
												: "border-border bg-muted/20 hover:border-primary/40"
										)}
									>
										<div className="flex items-center gap-3 min-w-0">
											<Checkbox
												checked={checked}
												onCheckedChange={() => {
													setCustomMedicineIds((prev) => {
														const next = new Set(prev);
														if (next.has(ab.id)) next.delete(ab.id);
														else next.add(ab.id);
														return next;
													});
													setCustomError(null);
												}}
											/>
											<div className="min-w-0">
												<div className="truncate text-sm font-semibold text-foreground">
													{ab.name}
												</div>
												<div className="truncate text-xs text-muted-foreground">
													{ab.antibioticGroupName}
												</div>
											</div>
										</div>
										<Badge
											className={cn(
												"shrink-0 text-[10px] uppercase",
												AWARE_BADGE_STYLES[ab.classification] ||
													AWARE_BADGE_STYLES.Unclassified
											)}
										>
											{getLocalizedAwareLabel(ab.classification)}
										</Badge>
									</label>
								);
							})}
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs uppercase text-muted-foreground">
								{t("result.custom.selectedLabel", {
									count: selectedCustomAntibiotics.length,
								})}
							</Label>
							<div className="flex flex-wrap gap-1.5">
								{selectedCustomAntibiotics.map((ab) => (
									<Badge
										key={ab.id}
										variant="secondary"
										className="gap-1.5 pr-1.5"
									>
										{ab.name}
										<button
											type="button"
											onClick={() =>
												setCustomMedicineIds((prev) => {
													const next = new Set(prev);
													next.delete(ab.id);
													return next;
												})
											}
											className="hover:text-destructive transition-colors"
										>
											×
										</button>
									</Badge>
								))}
							</div>
						</div>

						{hasReserveSelected && (
							<div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300">
								<AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
								<span>
									{t.rich("result.custom.reserveWarning", {
										bold: (chunks) => <strong>{chunks}</strong>,
									})}
								</span>
							</div>
						)}

						<div className="space-y-1.5">
							<Label className="text-foreground">
								{t("result.custom.reasonLabel")}{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Textarea
								rows={3}
								value={customReason}
								onChange={(e) => {
									setCustomReason(e.target.value);
									setCustomError(null);
								}}
								placeholder={t("result.custom.reasonPlaceholder")}
								className="bg-background text-foreground border-input"
							/>
						</div>

						{customError && (
							<p className="text-xs font-medium text-destructive">
								{customError}
							</p>
						)}

						<div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
							<span className="text-xs text-muted-foreground">
								{t("result.custom.helperText")}
							</span>
							<Button
								type="button"
								disabled={
									customMedicineIds.size === 0 ||
									!customReason.trim() ||
									isConfirming
								}
								onClick={handleConfirmCustom}
								className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
							>
								{isConfirming && <Loader2 className="h-4 w-4 animate-spin" />}
								{isConfirming
									? t("result.custom.saving")
									: t("result.custom.confirmButton")}
							</Button>
						</div>
					</div>
				</TabsContent>
			</Tabs>

			{/* <Button
				type="button"
				variant="outline"
				onClick={_onResetDiagnosis}
				disabled={isConfirming}
				className="w-full border-border bg-background text-foreground hover:bg-accent"
			>
				{t("result.resetButton")}
			</Button> */}

			<Dialog
				open={showGroupWarningModal}
				onOpenChange={setShowGroupWarningModal}
			>
				<DialogContent className="max-w-md border-border bg-background text-foreground shadow-lg">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
							<AlertTriangle className="h-5 w-5" />
							{t("result.groupWarningModal.title")}
						</DialogTitle>
						<DialogDescription className="pt-1 text-muted-foreground">
							{t.rich("result.groupWarningModal.description", {
								bold: (chunks) => (
									<strong className="text-foreground">{chunks}</strong>
								),
							})}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button
							type="button"
							variant="outline"
							onClick={() => setShowGroupWarningModal(false)}
							className="border-border text-foreground hover:bg-accent"
						>
							{t("result.groupWarningModal.cancelButton")}
						</Button>
						<Button
							type="button"
							className="bg-amber-600 hover:bg-amber-700 text-white"
							onClick={async () => {
								setShowGroupWarningModal(false);
								await executeConfirmTreatment(
									Array.from(customMedicineIds),
									customReason.trim()
								);
							}}
						>
							{t("result.groupWarningModal.confirmButton")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}