"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Upload, Download, Plus, Trash2, Loader2, Check, Lock } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
	ALLERGY_TYPE_OPTIONS,
	type AllergyType,
	AWARE_LABELS,
	CATEGORY_LABELS,
	CATEGORY_ORDER,
	type ClinicalVariableDto,
	type DiagnoseFormResponse,
	type DiagnosisResultDto,
	INFECTION_TYPES,
	MIC_CATEGORIES,
	type MicCategory,
	type PatientDetailWithPlans,
	SAMPLE_TYPES,
	type SubmitDiagnosisRequest,
	type SubmitErrorInfo,
	type VariableCategory,
} from "../types";
import {
	calculateAge,
	extractPreviousObservations,
	getNormalPlaceholder,
	isPatientProfileVariable,
	plainNumber,
	validateVariableValue,
} from "../validation";

interface SampleRow {
	rowId: string;
	sampleType: number;
	micCategory: MicCategory;
	pathogenId: string;
}

interface DiagnoseAssessmentFormProps {
	metadata: DiagnoseFormResponse;
	patient: PatientDetailWithPlans | null;
	previousDiagnosis?: DiagnosisResultDto | null;
	isSubmitting: boolean;
	/**
	 * Submits the diagnosis. Resolves with the API validation error when the
	 * request was rejected (e.g. HTTP 400), or `null` when it succeeded.
	 */
	onSubmit: (payload: SubmitDiagnosisRequest) => Promise<SubmitErrorInfo | null>;
}

const STEP_NUMBERS = [1, 2, 3, 4, 5] as const;

export function DiagnoseAssessmentForm({
	metadata,
	patient,
	previousDiagnosis = null,
	isSubmitting,
	onSubmit,
}: DiagnoseAssessmentFormProps) {
	const t = useTranslations("doctor.diagnose");

	const [currentStep, setCurrentStep] = useState(1);
	const [variableSearch, setVariableSearch] = useState("");
	const [values, setValues] = useState<Record<string, string | boolean>>({});
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);

	const [allergyType, setAllergyType] = useState<AllergyType>("No");
	const [selectedAllergyIds, setSelectedAllergyIds] = useState<Set<string>>(
		new Set()
	);
	const [otherAllergy, setOtherAllergy] = useState("");
	const [antibioticSearch, setAntibioticSearch] = useState("");
	const [allergyError, setAllergyError] = useState<string | null>(null);

	const [historyInput, setHistoryInput] = useState("");
	const [specialHistory, setSpecialHistory] = useState<string[]>([]);

	const [otherInfections, setOtherInfections] = useState<Set<string>>(new Set());

	const [samples, setSamples] = useState<SampleRow[]>([]);
	const [sampleError, setSampleError] = useState<string | null>(null);

	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const previousObsValues = extractPreviousObservations(
			previousDiagnosis,
			metadata.clinicalVariables
		);

		setValues((prev) => {
			const next: Record<string, string | boolean> = {
				...previousObsValues,
				...prev,
			};
			const age = calculateAge(patient?.dateOfBirth);

			for (const v of metadata.clinicalVariables) {
				if (
					next[v.id] === undefined &&
					v.valueType === "Boolean" &&
					v.isRequired
				) {
					next[v.id] = false;
				}
				if (patient) {
					if (v.code === "AGE" && age !== undefined) {
						next[v.id] = String(age);
					}
					if (v.code === "GENDER" && patient.gender) {
						const matched = v.acceptedValues?.find(
							(opt) => opt.toLowerCase() === patient.gender.toLowerCase()
						);
						next[v.id] = matched || patient.gender;
					}
					if (v.code === "WEIGHT" && patient.weight !== undefined) {
						next[v.id] = String(patient.weight);
					}
					if (v.code === "HEIGHT" && patient.height !== undefined) {
						next[v.id] = String(patient.height);
					}
				}
			}
			return next;
		});

		if (previousDiagnosis?.allergy) {
			setAllergyType(previousDiagnosis.allergy.type || "No");
			setSelectedAllergyIds(
				new Set(
					(previousDiagnosis.allergy.allergicAntibiotics || []).map((a) => a.id)
				)
			);
			setOtherAllergy(previousDiagnosis.allergy.otherAllergy || "");
		}

		if (Array.isArray(previousDiagnosis?.otherInfections)) {
			setOtherInfections(new Set(previousDiagnosis.otherInfections));
		}
	}, [metadata.clinicalVariables, patient, previousDiagnosis]);

	useEffect(() => {
		if (!pendingScrollId) return;

		const timer = window.setTimeout(() => {
			const el = document.getElementById(pendingScrollId);
			if (el) {
				el.scrollIntoView({ behavior: "smooth", block: "center" });
				const focusable = el.querySelector<HTMLElement>(
					"input:not([type='hidden']), select, textarea, button"
				);
				focusable?.focus({ preventScroll: true });
			}
			setPendingScrollId(null);
		}, 60);

		return () => window.clearTimeout(timer);
	}, [pendingScrollId, currentStep, variableSearch]);

	const orderedVariables = useMemo(() => {
		const groups = new Map<VariableCategory, ClinicalVariableDto[]>();
		for (const cat of CATEGORY_ORDER) groups.set(cat, []);
		for (const v of metadata.clinicalVariables) {
			const cat = CATEGORY_ORDER.includes(v.category) ? v.category : "Other";
			if (!groups.has(cat)) groups.set(cat, []);
			groups.get(cat)!.push(v);
		}
		return Array.from(groups.values()).flat();
	}, [metadata.clinicalVariables]);

	const groupedVariables = useMemo(() => {
		const query = variableSearch.trim().toLowerCase();
		const filtered = metadata.clinicalVariables.filter((v) => {
			if (!query) return true;
			return (
				v.name.toLowerCase().includes(query) ||
				v.code.toLowerCase().includes(query) ||
				(v.description || "").toLowerCase().includes(query)
			);
		});

		const groups = new Map<VariableCategory, ClinicalVariableDto[]>();
		for (const cat of CATEGORY_ORDER) groups.set(cat, []);

		for (const v of filtered) {
			const cat = CATEGORY_ORDER.includes(v.category) ? v.category : "Other";
			if (!groups.has(cat)) groups.set(cat, []);
			groups.get(cat)!.push(v);
		}

		return Array.from(groups.entries()).filter(([, list]) => list.length > 0);
	}, [metadata.clinicalVariables, variableSearch]);

	const antibioticGroups = useMemo(() => {
		const map = new Map<string, string[]>();
		for (const ab of metadata.antibiotics) {
			const groupName =
				ab.antibioticGroupName || t("assessmentForm.step2.otherGroup");
			if (!map.has(groupName)) map.set(groupName, []);
			map.get(groupName)!.push(ab.id);
		}
		return Array.from(map.entries());
	}, [metadata.antibiotics, t]);

	const filteredAntibiotics = useMemo(() => {
		const q = antibioticSearch.trim().toLowerCase();
		if (!q) return metadata.antibiotics;
		return metadata.antibiotics.filter(
			(ab) =>
				ab.name.toLowerCase().includes(q) ||
				ab.antibioticGroupName.toLowerCase().includes(q) ||
				ab.classification.toLowerCase().includes(q)
		);
	}, [metadata.antibiotics, antibioticSearch]);

	const validateStep1 = (shouldScroll = true): boolean => {
		const errors: Record<string, string> = {};
		for (const v of orderedVariables) {
			const { error } = validateVariableValue(v, values[v.id], t);
			if (error) errors[v.id] = error;
		}
		setFieldErrors(errors);

		const firstInvalidVar = orderedVariables.find((v) =>
			Boolean(errors[v.id])
		);
		if (firstInvalidVar) {
			if (shouldScroll) {
				if (variableSearch.trim()) {
					setVariableSearch("");
				}
				setCurrentStep(1);
				setPendingScrollId(`clinical-var-${firstInvalidVar.id}`);
			}
			return false;
		}
		return true;
	};

	const validateStep2 = (shouldScroll = true): boolean => {
		if (allergyType === "Yes" && selectedAllergyIds.size === 0) {
			setAllergyError(t("assessmentForm.validation.selectAllergyAntibiotic"));
			if (shouldScroll) {
				setCurrentStep(2);
				setPendingScrollId("step-2-allergy-section");
			}
			return false;
		}
		if (
			(allergyType === "NonRegisteredAntibiotic" ||
				allergyType === "Unknown") &&
			!otherAllergy.trim()
		) {
			setAllergyError(t("assessmentForm.validation.describeOtherAllergy"));
			if (shouldScroll) {
				setCurrentStep(2);
				setPendingScrollId("step-2-other-allergy-input");
			}
			return false;
		}
		setAllergyError(null);
		return true;
	};

	const validateStep5 = (shouldScroll = true): boolean => {
		for (let i = 0; i < samples.length; i++) {
			if (!samples[i].pathogenId) {
				setSampleError(
					t("assessmentForm.validation.samplePathogenRequired", {
						index: i + 1,
					})
				);
				if (shouldScroll) {
					setCurrentStep(5);
					setPendingScrollId(`sample-row-${samples[i].rowId}`);
				}
				return false;
			}
		}
		setSampleError(null);
		return true;
	};

	const handleGoStep = (targetStep: number) => {
		if (targetStep > currentStep) {
			if (currentStep === 1 && !validateStep1(true)) return;
			if (currentStep === 2 && !validateStep2(true)) return;
		}
		setCurrentStep(targetStep);
	};

	const buildPayload = (): SubmitDiagnosisRequest => {
		const observations = metadata.clinicalVariables
			.map((v) => {
				const raw = values[v.id];
				if (raw === undefined || raw === null || String(raw).trim() === "")
					return null;
				const formatted =
					v.valueType === "Numeric" ? plainNumber(String(raw)) : String(raw);
				return { variableId: v.id, value: formatted };
			})
			.filter(
				(item): item is { variableId: string; value: string } => item !== null
			);

		return {
			observations,
			allergy: {
				type: allergyType,
				allergicAntibioticIds:
					allergyType === "Yes" ? Array.from(selectedAllergyIds) : [],
				otherAllergy:
					allergyType === "NonRegisteredAntibiotic" ||
						allergyType === "Unknown"
						? otherAllergy.trim()
						: null,
			},
			specialMedicalHistory: specialHistory,
			otherInfections: Array.from(otherInfections),
			microbialSamples: samples.map((s) => ({
				sampleType: s.sampleType,
				micCategory: s.micCategory,
				pathogenId: s.pathogenId,
			})),
		};
	};

	/**
	 * Surface observation errors returned by the API (HTTP 400). The `detail`
	 * payload maps variable ids to messages, so highlight the matching fields,
	 * jump back to the observations step (clearing any active search filter) and
	 * scroll the first offending variable into view.
	 */
	const applyServerFieldErrors = (details: Record<string, string>) => {
		const canonicalIdByKey = new Map(
			metadata.clinicalVariables.map((v) => [v.id.toLowerCase(), v.id])
		);
		const appliedErrors: Record<string, string> = {};

		for (const [rawId, message] of Object.entries(details)) {
			if (!message) continue;
			const canonicalId = canonicalIdByKey.get(rawId.toLowerCase());
			if (canonicalId) appliedErrors[canonicalId] = message;
		}

		if (Object.keys(appliedErrors).length === 0) return;

		setFieldErrors((prev) => ({ ...prev, ...appliedErrors }));
		if (variableSearch.trim()) setVariableSearch("");
		setCurrentStep(1);

		const firstInvalid = orderedVariables.find((v) => appliedErrors[v.id]);
		if (firstInvalid) {
			setPendingScrollId(`clinical-var-${firstInvalid.id}`);
		}
	};

	const handleFormSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateStep1(true)) return;
		if (!validateStep2(true)) return;
		if (!validateStep5(true)) return;

		const submitError = await onSubmit(buildPayload());
		if (submitError) {
			applyServerFieldErrors(submitError.details);
		}
	};

	const handleExportJson = () => {
		const blob = new Blob([JSON.stringify(buildPayload(), null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `respira-diagnosis-${new Date().toISOString().slice(0, 10)}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		try {
			const parsed: Partial<SubmitDiagnosisRequest> = JSON.parse(
				await file.text()
			);
			if (Array.isArray(parsed.observations)) {
				const nextValues: Record<string, string | boolean> = { ...values };
				for (const obs of parsed.observations) {
					const meta = metadata.clinicalVariables.find(
						(v) => v.id === obs.variableId
					);
					if (!meta || isPatientProfileVariable(meta)) continue;
					nextValues[obs.variableId] =
						meta.valueType === "Boolean"
							? String(obs.value).toLowerCase() === "true"
							: String(obs.value);
				}
				setValues(nextValues);
			}
			if (parsed.allergy) {
				setAllergyType(parsed.allergy.type || "No");
				setSelectedAllergyIds(
					new Set(parsed.allergy.allergicAntibioticIds || [])
				);
				setOtherAllergy(parsed.allergy.otherAllergy || "");
			}
			if (Array.isArray(parsed.specialMedicalHistory)) {
				setSpecialHistory(parsed.specialMedicalHistory);
			}
			if (Array.isArray(parsed.otherInfections)) {
				setOtherInfections(new Set(parsed.otherInfections));
			}
			if (Array.isArray(parsed.microbialSamples)) {
				setSamples(
					parsed.microbialSamples.map((s, idx) => ({
						rowId: `import-${Date.now()}-${idx}`,
						sampleType: Number(s.sampleType ?? 0),
						micCategory: s.micCategory || "Susceptible",
						pathogenId: s.pathogenId || "",
					}))
				);
			}
		} catch {
			alert(t("assessmentForm.validation.invalidJsonFile"));
		} finally {
			e.target.value = "";
		}
	};

	const toggleAllergyId = (id: string) => {
		setSelectedAllergyIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
		setAllergyError(null);
	};

	const toggleAllergyGroup = (ids: string[]) => {
		setSelectedAllergyIds((prev) => {
			const next = new Set(prev);
			const allSelected = ids.every((id) => next.has(id));
			if (allSelected) ids.forEach((id) => next.delete(id));
			else ids.forEach((id) => next.add(id));
			return next;
		});
		setAllergyError(null);
	};

	const addHistoryEntry = () => {
		const trimmed = historyInput.trim();
		if (!trimmed) return;
		if (!specialHistory.includes(trimmed)) {
			setSpecialHistory((prev) => [...prev, trimmed]);
		}
		setHistoryInput("");
	};

	return (
		<form
			onSubmit={handleFormSubmit}
			noValidate
			className="space-y-4 text-foreground"
		>
			{/* <div className="flex flex-wrap items-center justify-end gap-2">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => fileInputRef.current?.click()}
					className="gap-1.5 border-border bg-background text-foreground hover:bg-accent"
				>
					<Upload className="h-3.5 w-3.5" />
					{t("assessmentForm.json.import")}
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={handleExportJson}
					className="gap-1.5 border-border bg-background text-foreground hover:bg-accent"
				>
					<Download className="h-3.5 w-3.5" />
					{t("assessmentForm.json.export")}
				</Button>
				<input
					ref={fileInputRef}
					type="file"
					accept="application/json,.json"
					onChange={handleImportJson}
					className="hidden"
				/>
			</div> */}

			<nav className="grid grid-cols-2 gap-2 sm:grid-cols-5">
				{STEP_NUMBERS.map((step) => {
					const isActive = currentStep === step;
					const isCompleted = currentStep > step;
					return (
						<button
							key={step}
							type="button"
							onClick={() => handleGoStep(step)}
							className={cn(
								"flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition",
								isActive
									? "border-primary bg-primary/10 dark:bg-primary/15 text-primary shadow-sm"
									: isCompleted
										? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
										: "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"
							)}
						>
							<span
								className={cn(
									"flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
									isActive
										? "bg-primary text-primary-foreground"
										: isCompleted
											? "bg-emerald-600 text-white"
											: "bg-muted text-muted-foreground"
								)}
							>
								{isCompleted ? <Check className="h-3 w-3" /> : step}
							</span>
							<span className="truncate">
								{t(`assessmentForm.steps.step${step}`)}
							</span>
						</button>
					);
				})}
			</nav>

			{currentStep === 1 && (
				<div className="rounded-xl border border-border bg-card text-card-foreground p-5 shadow-sm space-y-5">
					<div className="border-b border-border pb-3 space-y-2">
						<h3 className="text-base font-bold text-foreground">
							{t("assessmentForm.step1.title")}
						</h3>
						<p className="text-xs text-muted-foreground">
							{t.rich("assessmentForm.step1.description", {
								required: (chunks) => (
									<span className="font-bold text-destructive">{chunks}</span>
								),
							})}
						</p>
						<Input
							type="search"
							value={variableSearch}
							onChange={(e) => setVariableSearch(e.target.value)}
							placeholder={t("assessmentForm.step1.searchPlaceholder")}
							className="bg-background text-foreground border-input"
						/>
					</div>

					<div className="space-y-6">
						{groupedVariables.map(([category, vars]) => (
							<div key={category} className="space-y-3">
								<div className="flex items-center gap-2 border-b border-dashed border-border pb-1.5">
									<span className="text-xs font-bold uppercase tracking-wider text-primary">
										{category in CATEGORY_LABELS
											? t(`categories.${category}`)
											: category}
									</span>
									<Badge
										variant="secondary"
										className="border-primary/40 bg-primary/10 text-primary shadow-sm"
									>
										{vars.length}
									</Badge>
								</div>

								<div className="space-y-2.5">
									{vars.map((v) => {
										const val = values[v.id];
										const { warning } = validateVariableValue(v, val, t);
										const error = fieldErrors[v.id];
										const isLocked = isPatientProfileVariable(v);

										return (
											<div
												key={v.id}
												id={`clinical-var-${v.id}`}
												className={cn(
													"rounded-lg border p-3.5 transition",
													isLocked
														? "border-border bg-muted/30"
														: error
															? "border-destructive bg-destructive/5 dark:bg-destructive/10 ring-1 ring-destructive/30"
															: warning
																? "border-amber-500/40 bg-amber-500/10 dark:border-amber-500/30 dark:bg-amber-500/15"
																: "border-border bg-muted/20 focus-within:border-primary/60"
												)}
											>
												<div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_260px] md:items-center">
													<div>
														<div className="flex flex-wrap items-center gap-1.5">
															<Label className="text-sm font-semibold text-foreground">
																{v.name}
																{v.isRequired && (
																	<span className="ml-0.5 text-destructive">
																		*
																	</span>
																)}
															</Label>
															<Badge
																variant="outline"
																className="font-mono text-[10px] border-border"
															>
																{v.code}
															</Badge>
															{isLocked && (
																<Badge
																	variant="secondary"
																	className="gap-1 border-border text-[10px] font-medium text-muted-foreground"
																>
																	<Lock className="h-3 w-3" />
																	{t(
																		"assessmentForm.step1.profileLockedBadge"
																	)}
																</Badge>
															)}
														</div>
														{v.description && (
															<p className="mt-0.5 text-xs text-muted-foreground">
																{v.description}
															</p>
														)}
														{isLocked && (
															<p className="mt-0.5 text-[11px] italic text-muted-foreground">
																{t(
																	"assessmentForm.step1.profileLockedHint"
																)}
															</p>
														)}
													</div>

													<div>
														{v.valueType === "Numeric" && (
															<div
																className={cn(
																	"group flex h-10 items-center overflow-hidden rounded-md border bg-background transition-all",
																	isLocked
																		? "border-border bg-muted/50"
																		: error
																			? "border-destructive focus-within:ring-2 focus-within:ring-destructive/20"
																			: "border-input hover:border-foreground/40 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
																)}
															>
																<input
																	type="number"
																	step="any"
																	readOnly={isLocked}
																	aria-readonly={isLocked}
																	value={
																		typeof val === "string"
																			? val
																			: ""
																	}
																	placeholder={getNormalPlaceholder(
																		v,
																		t
																	)}
																	onChange={(e) => {
																		if (isLocked) return;
																		const nextVal =
																			e.target.value;
																		setValues((prev) => ({
																			...prev,
																			[v.id]: nextVal,
																		}));
																		const check =
																			validateVariableValue(
																				v,
																				nextVal,
																				t
																			);
																		setFieldErrors((prev) => {
																			const copy = {
																				...prev,
																			};
																			if (check.error)
																				copy[v.id] =
																					check.error;
																			else delete copy[v.id];
																			return copy;
																		});
																	}}
																	className="h-full w-full min-w-0 bg-transparent px-3 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none data-[locked=true]:cursor-not-allowed"
																	data-locked={isLocked}
																/>
																{v.canonicalUnit && (
																	<span
																		className={cn(
																			"flex h-full shrink-0 items-center border-l px-3 text-xs font-semibold transition-colors select-none",
																			isLocked
																				? "border-border bg-muted text-muted-foreground"
																				: error
																					? "border-destructive/30 bg-destructive/10 text-destructive"
																					: "border-input bg-muted text-muted-foreground group-focus-within:border-primary/30 group-focus-within:bg-primary/10 group-focus-within:text-primary"
																		)}
																	>
																		{v.canonicalUnit}
																	</span>
																)}
															</div>
														)}

														{v.valueType === "Boolean" && (
															<div className="grid h-10 grid-cols-2 gap-1 rounded-md border border-border bg-muted p-1">
																{[
																	{
																		label: t(
																			"assessmentForm.step1.booleanYes"
																		),
																		boolVal: true,
																	},
																	{
																		label: t(
																			"assessmentForm.step1.booleanNo"
																		),
																		boolVal: false,
																	},
																].map((opt) => {
																	const active =
																		val === opt.boolVal;
																	return (
																		<button
																			key={String(
																				opt.boolVal
																			)}
																			type="button"
																			disabled={isLocked}
																			onClick={() => {
																				if (isLocked) return;
																				setValues(
																					(prev) => {
																						const next = {
																							...prev,
																						};
																						// Clicking the selected option clears
																						// the observation instead of re-selecting it.
																						if (
																							next[v.id] ===
																							opt.boolVal
																						) {
																							delete next[
																								v.id
																							];
																						} else {
																							next[v.id] =
																								opt.boolVal;
																						}
																						return next;
																					}
																				);
																				setFieldErrors(
																					(prev) => {
																						const copy =
																						{
																							...prev,
																						};
																						delete copy[
																							v.id
																						];
																						return copy;
																					}
																				);
																			}}
																			className={cn(
																				"flex h-full cursor-pointer items-center justify-center rounded-sm text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
																				isLocked &&
																					"cursor-not-allowed",
																				active
																					? "bg-primary font-semibold text-primary-foreground shadow-sm"
																					: cn(
																						"font-medium text-muted-foreground",
																						!isLocked &&
																							"hover:bg-background/60 hover:text-foreground"
																					)
																			)}
																		>
																			{opt.label}
																		</button>
																	);
																})}
															</div>
														)}

														{v.valueType === "Categorical" && (
															<div
																className={cn(
																	"flex h-10 gap-1 rounded-md border bg-muted p-1",
																	error
																		? "border-destructive"
																		: "border-border"
																)}
															>
																{(v.acceptedValues || []).map(
																	(option) => {
																		const active =
																			val === option;
																		const displayLabel =
																			option.toUpperCase() ===
																				"MALE"
																				? t(
																					"patientHeader.gender.male"
																				)
																				: option.toUpperCase() ===
																					"FEMALE"
																					? t(
																						"patientHeader.gender.female"
																					)
																					: option;
																		return (
																			<button
																				key={option}
																				type="button"
																				disabled={isLocked}
																				onClick={() => {
																					if (isLocked) return;
																					setValues(
																						(prev) => ({
																							...prev,
																							[v.id]:
																								option,
																						})
																					);
																					setFieldErrors(
																						(prev) => {
																							const copy =
																							{
																								...prev,
																							};
																							delete copy[
																								v.id
																							];
																							return copy;
																						}
																					);
																				}}
																				className={cn(
																					"flex h-full flex-1 disabled:cursor-not-allowed items-center justify-center rounded-sm px-2.5 text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
																					active
																						? "bg-primary font-semibold text-primary-foreground shadow-sm"
																						: cn(
																							"font-medium text-muted-foreground",
																							!isLocked &&
																								"hover:bg-background/60 hover:text-foreground"
																						)
																				)}
																			>
																				{displayLabel}
																			</button>
																		);
																	}
																)}
															</div>
														)}
													</div>
												</div>

												{error && (
													<p className="mt-2 text-xs font-semibold text-destructive">
														{error}
													</p>
												)}
												{!error && warning && (
													<p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-400">
														⚠ {warning}
													</p>
												)}
											</div>
										);
									})}
								</div>
							</div>
						))}
					</div>

					<div className="flex justify-end pt-2 border-t border-border">
						<Button
							type="button"
							onClick={() => handleGoStep(2)}
							className="bg-primary text-primary-foreground hover:bg-primary/90"
						>
							{t("assessmentForm.step1.nextButton")}
						</Button>
					</div>
				</div>
			)}

			{currentStep === 2 && (
				<div
					id="step-2-allergy-section"
					className="rounded-xl border border-border bg-card text-card-foreground p-5 shadow-sm space-y-4"
				>
					<div className="border-b border-border pb-3">
						<h3 className="text-base font-bold text-foreground">
							{t("assessmentForm.step2.title")}
						</h3>
						<p className="mt-1 text-xs text-muted-foreground">
							{t("assessmentForm.step2.description")}
						</p>
					</div>

					<div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
						{ALLERGY_TYPE_OPTIONS.map((opt) => (
							<button
								key={opt.value}
								type="button"
								onClick={() => {
									setAllergyType(opt.value);
									setAllergyError(null);
								}}
								className={cn(
									"rounded-lg border px-3 py-2.5 text-xs font-semibold transition",
									allergyType === opt.value
										? "border-primary bg-primary text-primary-foreground"
										: "border-border bg-muted/40 text-foreground hover:bg-muted"
								)}
							>
								{t(`allergyTypes.${opt.value}`)}
							</button>
						))}
					</div>

					{(allergyType === "NonRegisteredAntibiotic" ||
						allergyType === "Unknown") && (
							<div id="step-2-other-allergy-input" className="space-y-1.5">
								<Label className="text-foreground">
									{t("assessmentForm.step2.otherAllergyLabel")}{" "}
									<span className="text-destructive">*</span>
								</Label>
								<Input
									value={otherAllergy}
									onChange={(e) => {
										setOtherAllergy(e.target.value);
										setAllergyError(null);
									}}
									placeholder={t("assessmentForm.step2.otherAllergyPlaceholder")}
									className="bg-background text-foreground border-input"
								/>
							</div>
						)}

					{allergyType === "Yes" && (
						<div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
							<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
								<Input
									type="search"
									value={antibioticSearch}
									onChange={(e) => setAntibioticSearch(e.target.value)}
									placeholder={t("assessmentForm.step2.searchPlaceholder")}
									className="sm:max-w-xs bg-background text-foreground border-input"
								/>
								<div className="flex flex-wrap gap-2">
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() =>
											setSelectedAllergyIds((prev) => {
												const next = new Set(prev);
												filteredAntibiotics.forEach((a) => next.add(a.id));
												return next;
											})
										}
										className="border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
									>
										{t("assessmentForm.step2.selectAllVisible")}
									</Button>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => setSelectedAllergyIds(new Set())}
										className="border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
									>
										{t("assessmentForm.step2.clearAll")}
									</Button>
								</div>
							</div>

							<div>
								<span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
									{t("assessmentForm.step2.quickSelectByGroup")}
								</span>
								<div className="mt-1.5 flex flex-wrap gap-1.5">
									{antibioticGroups.map(([groupName, ids]) => {
										const selectedCount = ids.filter((id) =>
											selectedAllergyIds.has(id)
										).length;
										const isAll = selectedCount === ids.length;
										const isPartial = selectedCount > 0 && !isAll;
										return (
											<button
												key={groupName}
												type="button"
												onClick={() => toggleAllergyGroup(ids)}
												className={cn(
													"rounded-full border px-3 py-1 text-xs font-semibold transition",
													isAll
														? "border-primary bg-primary text-primary-foreground"
														: isPartial
															? "border-primary/50 bg-primary/10 dark:bg-primary/15 text-primary"
															: "border-border bg-background text-foreground hover:border-primary/50"
												)}
											>
												{groupName} ({selectedCount}/{ids.length})
											</button>
										);
									})}
								</div>
							</div>

							<div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto pr-1.5 sm:grid-cols-2 lg:grid-cols-3">
								{filteredAntibiotics.map((ab) => {
									const checked = selectedAllergyIds.has(ab.id);
									return (
										<label
											key={ab.id}
											className={cn(
												"relative flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 text-xs transition",
												checked
													? "border-primary bg-primary/10 dark:bg-primary/15"
													: "border-border bg-background hover:border-primary/40"
											)}
										>
											<Checkbox
												checked={checked}
												onCheckedChange={() => toggleAllergyId(ab.id)}
											/>
											<div className="min-w-0">
												<div className="truncate font-semibold text-foreground">
													{ab.name}
												</div>
												<div className="truncate text-[11px] text-muted-foreground">
													{ab.antibioticGroupName} •{" "}
													{ab.classification in AWARE_LABELS
														? t(`awareClassifications.${ab.classification}`)
														: ab.classification}
												</div>
											</div>
										</label>
									);
								})}
							</div>

							<div className="pt-2 border-t border-border">
								<div className="text-xs font-semibold text-muted-foreground mb-1.5">
									{t("assessmentForm.step2.selectedCount", {
										count: selectedAllergyIds.size,
									})}
								</div>
								<div className="flex flex-wrap gap-1.5">
									{Array.from(selectedAllergyIds).map((id) => {
										const ab = metadata.antibiotics.find((x) => x.id === id);
										if (!ab) return null;
										return (
											<Badge
												key={id}
												variant="secondary"
												className="gap-1.5 pr-1.5"
											>
												{ab.name}
												<button
													type="button"
													onClick={() => toggleAllergyId(id)}
													className="hover:text-destructive transition-colors"
												>
													×
												</button>
											</Badge>
										);
									})}
								</div>
							</div>
						</div>
					)}

					{allergyError && (
						<p className="text-xs font-semibold text-destructive">
							{allergyError}
						</p>
					)}

					<div className="flex justify-between pt-2 border-t border-border">
						<Button
							type="button"
							variant="outline"
							onClick={() => setCurrentStep(1)}
							className="border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
						>
							{t("assessmentForm.navigation.back")}
						</Button>
						<Button
							type="button"
							onClick={() => handleGoStep(3)}
							className="bg-primary text-primary-foreground hover:bg-primary/90"
						>
							{t("assessmentForm.step2.nextButton")}
						</Button>
					</div>
				</div>
			)}

			{currentStep === 3 && (
				<div className="rounded-xl border border-border bg-card text-card-foreground p-5 shadow-sm space-y-4">
					<div className="border-b border-border pb-3">
						<h3 className="text-base font-bold text-foreground">
							{t("assessmentForm.step3.title")}
						</h3>
						<p className="mt-1 text-xs text-muted-foreground">
							{t("assessmentForm.step3.description")}
						</p>
					</div>

					<div className="flex gap-2">
						<Input
							value={historyInput}
							onChange={(e) => setHistoryInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									addHistoryEntry();
								}
							}}
							placeholder={t("assessmentForm.step3.placeholder")}
							className="bg-background text-foreground border-input"
						/>
						<Button
							type="button"
							variant="secondary"
							onClick={addHistoryEntry}
						>
							{t("assessmentForm.step3.addButton")}
						</Button>
					</div>

					<div className="flex flex-wrap gap-2">
						{specialHistory.length === 0 ? (
							<span className="text-xs italic text-muted-foreground">
								{t("assessmentForm.step3.empty")}
							</span>
						) : (
							specialHistory.map((item) => (
								<Badge
									key={item}
									variant="secondary"
									className="gap-1.5 pr-1.5"
								>
									{item}
									<button
										type="button"
										onClick={() =>
											setSpecialHistory((prev) =>
												prev.filter((x) => x !== item)
											)
										}
										className="font-bold hover:text-destructive transition-colors"
									>
										×
									</button>
								</Badge>
							))
						)}
					</div>

					<div className="flex justify-between pt-2 border-t border-border">
						<Button
							type="button"
							variant="outline"
							onClick={() => setCurrentStep(2)}
							className="border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
						>
							{t("assessmentForm.navigation.back")}
						</Button>
						<Button
							type="button"
							onClick={() => handleGoStep(4)}
							className="bg-primary text-primary-foreground hover:bg-primary/90"
						>
							{t("assessmentForm.step3.nextButton")}
						</Button>
					</div>
				</div>
			)}

			{currentStep === 4 && (
				<div className="rounded-xl border border-border bg-card text-card-foreground p-5 shadow-sm space-y-4">
					<div className="border-b border-border pb-3">
						<h3 className="text-base font-bold text-foreground">
							{t("assessmentForm.step4.title")}
						</h3>
						<p className="mt-1 text-xs text-muted-foreground">
							{t("assessmentForm.step4.description")}
						</p>
					</div>

					<div className="grid max-h-96 grid-cols-1 gap-2 overflow-y-auto pr-1.5 sm:grid-cols-2 lg:grid-cols-3">
						{INFECTION_TYPES.map((inf) => {
							const checked = otherInfections.has(inf.name);
							return (
								<label
									key={inf.name}
									className={cn(
										"relative flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 text-xs font-medium transition",
										checked
											? "border-primary bg-primary/10 dark:bg-primary/15 text-foreground"
											: "border-border bg-muted/20 text-foreground hover:border-primary/40"
									)}
								>
									<Checkbox
										checked={checked}
										onCheckedChange={() => {
											setOtherInfections((prev) => {
												const next = new Set(prev);
												if (next.has(inf.name)) next.delete(inf.name);
												else next.add(inf.name);
												return next;
											});
										}}
									/>
									<span>{t(`infectionTypes.${inf.name}`)}</span>
								</label>
							);
						})}
					</div>

					<div className="flex justify-between pt-2 border-t border-border">
						<Button
							type="button"
							variant="outline"
							onClick={() => setCurrentStep(3)}
							className="border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
						>
							{t("assessmentForm.navigation.back")}
						</Button>
						<Button
							type="button"
							onClick={() => handleGoStep(5)}
							className="bg-primary text-primary-foreground hover:bg-primary/90"
						>
							{t("assessmentForm.step4.nextButton")}
						</Button>
					</div>
				</div>
			)}

			{currentStep === 5 && (
				<div className="rounded-xl border border-border bg-card text-card-foreground p-5 shadow-sm space-y-4">
					<div className="border-b border-border pb-3">
						<h3 className="text-base font-bold text-foreground">
							{t("assessmentForm.step5.title")}
						</h3>
						<p className="mt-1 text-xs text-muted-foreground">
							{t("assessmentForm.step5.description")}
						</p>
					</div>

					<div className="space-y-3">
						{samples.map((row, idx) => (
							<div
								key={row.rowId}
								id={`sample-row-${row.rowId}`}
								className={cn(
									"rounded-lg border p-3.5 space-y-3",
									!row.pathogenId && sampleError
										? "border-destructive bg-destructive/5 dark:bg-destructive/10"
										: "border-border bg-muted/20"
								)}
							>
								<div className="flex items-center justify-between">
									<span className="text-xs font-bold uppercase text-primary">
										{t("assessmentForm.step5.sampleHeader", {
											index: idx + 1,
										})}
									</span>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() =>
											setSamples((prev) =>
												prev.filter((r) => r.rowId !== row.rowId)
											)
										}
										className="h-7 gap-1 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
									>
										<Trash2 className="h-3.5 w-3.5" />
										{t("assessmentForm.step5.deleteSample")}
									</Button>
								</div>

								<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
									<div className="space-y-1">
										<Label className="text-xs text-foreground">
											{t("assessmentForm.step5.sampleTypeLabel")}
										</Label>
										<select
											value={row.sampleType}
											onChange={(e) => {
												const val = Number(e.target.value);
												setSamples((prev) =>
													prev.map((r) =>
														r.rowId === row.rowId
															? { ...r, sampleType: val }
															: r
													)
												);
											}}
											className="h-9 w-full rounded-md border border-input bg-background text-foreground px-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 dark:[color-scheme:dark]"
										>
											{SAMPLE_TYPES.map((st) => (
												<option key={st.value} value={st.value}>
													{t(`sampleTypes.${st.name}`)}
												</option>
											))}
										</select>
									</div>

									<div className="space-y-1">
										<Label className="text-xs text-foreground">
											{t("assessmentForm.step5.micLabel")}
										</Label>
										<select
											value={row.micCategory}
											onChange={(e) => {
												const val = e.target.value as MicCategory;
												setSamples((prev) =>
													prev.map((r) =>
														r.rowId === row.rowId
															? { ...r, micCategory: val }
															: r
													)
												);
											}}
											className="h-9 w-full rounded-md border border-input bg-background text-foreground px-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 dark:[color-scheme:dark]"
										>
											{MIC_CATEGORIES.map((mc) => (
												<option key={mc.value} value={mc.value}>
													{t(`micCategories.${mc.value}`)}
												</option>
											))}
										</select>
									</div>

									<div className="space-y-1">
										<Label className="text-xs text-foreground">
											{t("assessmentForm.step5.pathogenLabel")}{" "}
											<span className="text-destructive">*</span>
										</Label>
										<select
											value={row.pathogenId}
											onChange={(e) => {
												const val = e.target.value;
												setSamples((prev) =>
													prev.map((r) =>
														r.rowId === row.rowId
															? { ...r, pathogenId: val }
															: r
													)
												);
												setSampleError(null);
											}}
											className="h-9 w-full rounded-md border border-input bg-background text-foreground px-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 dark:[color-scheme:dark]"
										>
											<option value="">
												{t("assessmentForm.step5.pathogenPlaceholder")}
											</option>
											{metadata.pathogens.map((p) => (
												<option key={p.id} value={p.id}>
													{p.name}
												</option>
											))}
										</select>
									</div>
								</div>
							</div>
						))}
					</div>

					{sampleError && (
						<p className="text-xs font-semibold text-destructive">
							{sampleError}
						</p>
					)}

					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() =>
							setSamples((prev) => [
								...prev,
								{
									rowId: `sample-${Date.now()}-${prev.length}`,
									sampleType: 0,
									micCategory: "Susceptible",
									pathogenId: "",
								},
							])
						}
						className="gap-1.5 border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
					>
						<Plus className="h-3.5 w-3.5" />
						{t("assessmentForm.step5.addSampleButton")}
					</Button>

					<div className="flex justify-between border-t border-border pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setCurrentStep(4)}
							className="border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
						>
							{t("assessmentForm.navigation.back")}
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
						>
							{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
							{isSubmitting
								? t("assessmentForm.step5.submitting")
								: t("assessmentForm.step5.submitButton")}
						</Button>
					</div>
				</div>
			)}
		</form>
	);
}
