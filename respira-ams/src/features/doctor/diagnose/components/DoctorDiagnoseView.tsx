"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
	fetchDiagnosisForm,
	fetchAntibioticList,
	diagnose,
} from "../api";
import {
	AntibioticItem,
	ClinicalVariable,
	DiagnoseResponse,
	Evidence,
	MetricsSeverityDiagnosis,
	RawValueRange,
	RelatedObservation,
	ValueRange,
} from "../types";

const UNBOUNDED = 1e20;

function normalizeRange(raw?: RawValueRange | ValueRange | null): ValueRange | null {
	if (!raw) return null;
	const r = raw as Record<string, unknown>;
	const pick = (a: unknown, b: unknown) => (a !== undefined && a !== null ? a : b);
	const minVal = pick(r.min, r.Min);
	const maxVal = pick(r.max, r.Max);

	const range: ValueRange = {
		min: minVal !== undefined && minVal !== null && minVal !== "" ? Number(minVal) : null,
		max: maxVal !== undefined && maxVal !== null && maxVal !== "" ? Number(maxVal) : null,
		isMinExclusive: !!pick(r.isMinExclusive, r.IsMinExclusive),
		isMaxExclusive: !!pick(r.isMaxExclusive, r.IsMaxExclusive),
		unit: (pick(r.unit, r.Unit) as string) || null,
	};

	if (range.min !== null) {
		if (!Number.isFinite(range.min) || range.min < -UNBOUNDED) range.min = null;
	}
	if (range.max !== null) {
		if (!Number.isFinite(range.max) || range.max > UNBOUNDED) range.max = null;
	}
	if (range.min === null && range.max === null) return null;
	return range;
}

function inRange(value: number, range?: ValueRange | null): boolean {
	if (!range) return true;
	if (range.min !== null) {
		if (range.isMinExclusive ? value <= range.min : value < range.min) return false;
	}
	if (range.max !== null) {
		if (range.isMaxExclusive ? value >= range.max : value > range.max) return false;
	}
	return true;
}

function describeRange(range?: ValueRange | null, unit?: string | null): string {
	if (!range) return "";
	const u = unit || range.unit;
	const suffix = u ? ` ${u}` : "";
	const minOp = range.isMinExclusive ? ">" : "≥";
	const maxOp = range.isMaxExclusive ? "<" : "≤";
	if (range.min !== null && range.max !== null) {
		return `${minOp} ${range.min} and ${maxOp} ${range.max}${suffix}`;
	}
	if (range.min !== null) return `${minOp} ${range.min}${suffix}`;
	if (range.max !== null) return `${maxOp} ${range.max}${suffix}`;
	return "";
}

function normalPlaceholder(range?: ValueRange | null): string {
	if (!range) return "Enter value";
	if (range.min !== null && range.max !== null) return `normal: ${range.min}-${range.max}`;
	if (range.min !== null) return `normal: ${range.min}+`;
	return `normal: up to ${range.max}`;
}

const CATEGORY_ENUM_ORDER = ["PersonalInformation", "Paraclinical", "Clinical"];
const CATEGORY_DISPLAY_ORDER = ["PersonalInformation", "Clinical", "Paraclinical"];
const CATEGORY_LABELS: Record<string, string> = {
	PersonalInformation: "Personal Information",
	Clinical: "Clinical",
	Paraclinical: "Paraclinical",
};

function normalizeCategoryKey(raw?: unknown): string {
	if (raw === undefined || raw === null || raw === "") return "Other";
	const text = String(raw).trim();
	if (/^\d+$/.test(text)) {
		const idx = Number(text);
		return CATEGORY_ENUM_ORDER[idx] || "Other";
	}
	const match = Object.keys(CATEGORY_LABELS).find(
		(key) => key.toLowerCase() === text.toLowerCase()
	);
	return match || text;
}

function categoryRank(key: string): number {
	const idx = CATEGORY_DISPLAY_ORDER.indexOf(key);
	return idx === -1 ? CATEGORY_DISPLAY_ORDER.length : idx;
}

function formatTreatmentSite(site?: string): string {
	if (!site) return "Unknown";
	return site === "IntensiveCareUnit" ? "ICU" : site;
}

interface FieldMeta {
	id: string;
	name: string;
	valueType: string;
	isRequired: boolean;
	unit: string | null;
	acceptedRange: ValueRange | null;
	normalRange: ValueRange | null;
}

interface FieldStatus {
	error: string | null;
	warning: string | null;
}

export function DoctorDiagnoseView() {
	const [variables, setVariables] = useState<ClinicalVariable[]>([]);
	const [antibiotics, setAntibiotics] = useState<AntibioticItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	// Navigation & state
	const [currentStep, setCurrentStep] = useState<1 | 2>(1);
	const [values, setValues] = useState<Record<string, string>>({});
	const [selectedAllergies, setSelectedAllergies] = useState<Map<string, string>>(new Map());
	const [allergySearch, setAllergySearch] = useState("");

	// Validation
	const [fieldStatuses, setFieldStatuses] = useState<Record<string, FieldStatus>>({});

	// Error Modal
	const [errorModal, setErrorModal] = useState<{
		isOpen: boolean;
		title: string;
		message: string;
		details: string[];
	}>({
		isOpen: false,
		title: "Error",
		message: "",
		details: [],
	});

	// Result state
	const [isDiagnosing, setIsDiagnosing] = useState(false);
	const [result, setResult] = useState<DiagnoseResponse | null>(null);
	const [showEvidences, setShowEvidences] = useState(false);
	const [isWorthExpanded, setIsWorthExpanded] = useState(false);

	const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

	// Fetch initial form & antibiotics
	useEffect(() => {
		let isMounted = true;
		setIsLoading(true);
		setLoadError(null);

		Promise.all([fetchDiagnosisForm(), fetchAntibioticList()])
			.then(([formData, antibioticList]) => {
				if (!isMounted) return;
				const vars = formData.variables || formData.Variables || [];
				setVariables(vars);
				setAntibiotics(antibioticList || []);

				// Initialize default values for boolean and categorical fields
				const initialValues: Record<string, string> = {};
				vars.forEach((v) => {
					const id = String(v.id || v.Id);
					const vt = v.valueType || v.ValueType;
					if (vt === "Boolean") {
						initialValues[id] = "false";
					} else if (vt === "Categorical") {
						const options = v.acceptedValues || v.AcceptedValues || [];
						if (options.length > 0) {
							initialValues[id] = options[0];
						}
					}
				});
				setValues(initialValues);
			})
			.catch((err) => {
				if (!isMounted) return;
				setLoadError(err instanceof Error ? err.message : "Failed to load diagnosis form");
			})
			.finally(() => {
				if (isMounted) setIsLoading(false);
			});

		return () => {
			isMounted = false;
		};
	}, []);

	// Metadata lookup
	const metaMap = useMemo(() => {
		const map: Record<string, FieldMeta> = {};
		variables.forEach((v) => {
			const id = String(v.id || v.Id);
			const name = v.name || v.Name || "Field";
			const valueType = v.valueType || v.ValueType || "Numeric";
			const isRequired = !!(v.isRequired !== undefined ? v.isRequired : v.IsRequired);
			const unit = v.canonicalUnit || v.CanonicalUnit || null;
			const acceptedRange = normalizeRange(
				v.acceptedRange !== undefined ? v.acceptedRange : v.AcceptedRange
			);
			const normalRange = normalizeRange(
				v.normalRange !== undefined ? v.normalRange : v.NormalRange
			);

			map[id] = {
				id,
				name,
				valueType,
				isRequired,
				unit,
				acceptedRange,
				normalRange,
			};
		});
		return map;
	}, [variables]);

	// Categorized variables
	const categorizedGroups = useMemo(() => {
		const buckets = new Map<string, ClinicalVariable[]>();
		variables.forEach((v) => {
			const key = normalizeCategoryKey(v.category ?? v.Category);
			if (!buckets.has(key)) buckets.set(key, []);
			buckets.get(key)!.push(v);
		});

		const sortedKeys = Array.from(buckets.keys()).sort((a, b) => {
			const diff = categoryRank(a) - categoryRank(b);
			return diff !== 0 ? diff : a.localeCompare(b);
		});

		return sortedKeys.map((key) => ({
			key,
			label: CATEGORY_LABELS[key] || key,
			items: buckets.get(key) || [],
		}));
	}, [variables]);

	// Validate a single field
	const validateField = (id: string, val: string): FieldStatus => {
		const meta = metaMap[id];
		if (!meta) return { error: null, warning: null };

		const value = (val ?? "").trim();

		if (value === "") {
			if (meta.isRequired) {
				return { error: `${meta.name} is required.`, warning: null };
			}
			return { error: null, warning: null };
		}

		if (meta.valueType !== "Numeric") {
			return { error: null, warning: null };
		}

		const num = Number(value);
		if (!Number.isFinite(num)) {
			return { error: `${meta.name} must be a valid number.`, warning: null };
		}

		if (meta.acceptedRange && !inRange(num, meta.acceptedRange)) {
			return {
				error: `Value must be within the accepted range (${describeRange(meta.acceptedRange, meta.unit)}).`,
				warning: null,
			};
		}

		if (meta.normalRange && !inRange(num, meta.normalRange)) {
			return {
				error: null,
				warning: `Outside the normal range (${describeRange(meta.normalRange, meta.unit)}). This value is accepted and can still be submitted.`,
			};
		}

		return { error: null, warning: null };
	};

	// Handle input changes
	const handleValueChange = (id: string, newVal: string) => {
		setValues((prev) => ({ ...prev, [id]: newVal }));
		const status = validateField(id, newVal);
		setFieldStatuses((prev) => ({ ...prev, [id]: status }));
	};

	// Validate all fields
	const validateAll = (): { invalidCount: number; firstInvalidId: string | null } => {
		let invalidCount = 0;
		let firstInvalidId: string | null = null;
		const nextStatuses: Record<string, FieldStatus> = {};

		variables.forEach((v) => {
			const id = String(v.id || v.Id);
			const val = values[id] ?? "";
			const status = validateField(id, val);
			nextStatuses[id] = status;
			if (status.error) {
				invalidCount++;
				if (!firstInvalidId) firstInvalidId = id;
			}
		});

		setFieldStatuses((prev) => ({ ...prev, ...nextStatuses }));
		return { invalidCount, firstInvalidId };
	};

	// Scroll to error
	const scrollToField = (id: string) => {
		const el = fieldRefs.current[id];
		if (el) {
			el.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	};

	// Stepper transitions
	const tryGoToStep = (target: 1 | 2) => {
		if (target <= currentStep) {
			setCurrentStep(target);
			window.scrollTo({ top: 0, behavior: "smooth" });
			return;
		}

		const { invalidCount, firstInvalidId } = validateAll();
		if (invalidCount > 0) {
			setErrorModal({
				isOpen: true,
				title: "Error",
				message: `Please fix the highlighted ${invalidCount === 1 ? "field" : "fields"} before continuing to the next step.`,
				details: [],
			});
			if (firstInvalidId) {
				setTimeout(() => scrollToField(firstInvalidId!), 100);
			}
			return;
		}

		setCurrentStep(target);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	// Allergy helpers
	const toggleAllergy = (antibiotic: AntibioticItem) => {
		const id = String(antibiotic.id || antibiotic.Id);
		const name = antibiotic.name || antibiotic.Name || id;

		setSelectedAllergies((prev) => {
			const next = new Map(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.set(id, name);
			}
			return next;
		});
	};

	const removeAllergy = (id: string) => {
		setSelectedAllergies((prev) => {
			const next = new Map(prev);
			next.delete(id);
			return next;
		});
	};

	const filteredAntibiotics = useMemo(() => {
		const q = allergySearch.trim().toLowerCase();
		if (!q) return antibiotics;
		return antibiotics.filter((a) => {
			const name = (a.name || a.Name || "").toLowerCase();
			return name.includes(q);
		});
	}, [antibiotics, allergySearch]);

	// Submit Diagnosis
	const handleSubmitDiagnosis = async (e?: React.FormEvent) => {
		if (e) e.preventDefault();

		if (currentStep !== 2) {
			tryGoToStep(2);
			return;
		}

		const { invalidCount, firstInvalidId } = validateAll();
		if (invalidCount > 0) {
			setErrorModal({
				isOpen: true,
				title: "Error",
				message: `Please fix the highlighted ${invalidCount === 1 ? "field" : "fields"} before submitting.`,
				details: [],
			});
			if (firstInvalidId) {
				setTimeout(() => scrollToField(firstInvalidId!), 100);
			}
			return;
		}

		const observations: { variableId: string; value: string }[] = [];
		variables.forEach((v) => {
			const id = String(v.id || v.Id);
			const val = (values[id] ?? "").trim();
			if (val !== "") {
				observations.push({ variableId: id, value: val });
			}
		});

		setIsDiagnosing(true);
		try {
			const payload = {
				observations,
				allergies: Array.from(selectedAllergies.keys()),
			};
			const res = await diagnose(payload);
			setResult(res);
			window.scrollTo({ top: 0, behavior: "smooth" });
		} catch (err: unknown) {
			const description = err instanceof Error ? err.message : "Diagnosis failed";
			const detail = (err as { detail?: Record<string, string> })?.detail;

			// Map server field errors
			if (detail && typeof detail === "object") {
				const nextStatuses: Record<string, FieldStatus> = {};
				let firstId: string | null = null;
				Object.entries(detail).forEach(([varId, msg]) => {
					if (!msg) return;
					nextStatuses[varId] = { error: msg, warning: null };
					if (!firstId) firstId = varId;
				});
				setFieldStatuses((prev) => ({ ...prev, ...nextStatuses }));
				const detailList = Object.values(detail).filter(Boolean);

				setErrorModal({
					isOpen: true,
					title: "Error",
					message: `${description}. Please review the highlighted fields below.`,
					details: detailList,
				});
				if (firstId) {
					setTimeout(() => scrollToField(firstId!), 100);
				}
			} else {
				setErrorModal({
					isOpen: true,
					title: "Error",
					message: description,
					details: [],
				});
			}
		} finally {
			setIsDiagnosing(false);
		}
	};

	// Reset form
	const handleReset = () => {
		setResult(null);
		setCurrentStep(1);
		setFieldStatuses({});
		setSelectedAllergies(new Map());
		setAllergySearch("");
		setShowEvidences(false);
		setIsWorthExpanded(false);

		// Reset default values
		const initialValues: Record<string, string> = {};
		variables.forEach((v) => {
			const id = String(v.id || v.Id);
			const vt = v.valueType || v.ValueType;
			if (vt === "Boolean") {
				initialValues[id] = "false";
			} else if (vt === "Categorical") {
				const options = v.acceptedValues || v.AcceptedValues || [];
				if (options.length > 0) {
					initialValues[id] = options[0];
				}
			}
		});
		setValues(initialValues);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<div className="min-h-screen bg-[#F8FAFC] pb-16 font-sans">
			<div className="max-w-[850px] mx-auto px-4 pt-6" style={{ zoom: 1.15 }}>
				{/* Header */}
				<header className="text-center mb-8">
					<div className="w-[52px] h-[52px] mx-auto mb-3 rounded-2xl bg-linear-to-br from-[#0EA5E9] to-[#0284C7] flex items-center justify-center shadow-[0_6px_16px_rgba(14,165,233,0.25)]">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="white"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="w-7 h-7"
						>
							<path d="M6 2v6a4 4 0 0 0 4 4h0a4 4 0 0 0 4-4V2" />
							<path d="M6 12v3a6 6 0 0 0 12 0v-3" />
							<circle cx="20" cy="10" r="2" />
						</svg>
					</div>
					<h1 className="text-2xl sm:text-[1.6rem] font-extrabold tracking-tight text-slate-900">
						Respira Empirical Diagnosis
					</h1>
					<p className="text-slate-500 text-sm mt-1">
						Fill in clinical observations to generate a diagnosis
					</p>
				</header>

				{/* Loading State */}
				{isLoading && (
					<div className="text-center py-16 text-slate-500">
						<div className="inline-block w-8 h-8 border-2 border-slate-200 border-t-[#0EA5E9] rounded-full animate-spin mb-3" />
						<p className="text-sm font-medium">Loading diagnosis form...</p>
					</div>
				)}

				{/* Load Error */}
				{loadError && (
					<div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold text-center mb-6">
						Failed to load form: {loadError}
					</div>
				)}

				{/* Main Content */}
				{!isLoading && !loadError && (
					<>
						{/* Form View (when no result) */}
						{!result && (
							<form onSubmit={handleSubmitDiagnosis} noValidate>
								{/* Stepper */}
								<div className="flex gap-2.5 mb-5 flex-col sm:flex-row">
									<button
										type="button"
										onClick={() => tryGoToStep(1)}
										className={cn(
											"flex-1 flex items-center gap-2.5 px-4 py-3 rounded-xl border font-bold text-sm text-left transition-all cursor-pointer",
											currentStep === 1
												? "border-[#0EA5E9] bg-[#F0F9FF] text-[#0284C7] shadow-xs"
												: "border-slate-200 bg-white text-slate-500 hover:border-[#0EA5E9]/50"
										)}
									>
										<span
											className={cn(
												"h-5 w-5 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0",
												currentStep === 1
													? "bg-[#0EA5E9] text-white"
													: "bg-slate-200 text-slate-500"
											)}
										>
											1
										</span>
										<span>Clinical Observations</span>
									</button>

									<button
										type="button"
										onClick={() => tryGoToStep(2)}
										className={cn(
											"flex-1 flex items-center gap-2.5 px-4 py-3 rounded-xl border font-bold text-sm text-left transition-all cursor-pointer",
											currentStep === 2
												? "border-[#0EA5E9] bg-[#F0F9FF] text-[#0284C7] shadow-xs"
												: "border-slate-200 bg-white text-slate-500 hover:border-[#0EA5E9]/50"
										)}
									>
										<span
											className={cn(
												"h-5 w-5 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0",
												currentStep === 2
													? "bg-[#0EA5E9] text-white"
													: "bg-slate-200 text-slate-500"
											)}
										>
											2
										</span>
										<span>Antibiotic Allergies</span>
									</button>
								</div>

								{/* Step 1: Clinical Observations */}
								{currentStep === 1 && (
									<section>
										<div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 mb-5 shadow-xs">
											<h2 className="flex items-center gap-2.5 text-[1.05rem] font-bold pb-3.5 mb-5 border-b border-slate-200 text-slate-900">
												<span className="h-6 w-6 rounded-full bg-[#0EA5E9] text-white flex items-center justify-center text-xs font-extrabold shrink-0">
													1
												</span>
												Clinical Observations
											</h2>

											<div className="space-y-6">
												{categorizedGroups.map((group) => (
													<div key={group.key} className="category-section">
														{/* Category Header */}
														<div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-dashed border-slate-200 text-xs font-extrabold tracking-wider uppercase text-slate-500">
															<span>{group.label}</span>
															<span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-[0.7rem] font-extrabold min-w-[1.45rem] text-center">
																{group.items.length}
															</span>
														</div>

														{/* Variables in Category */}
														<div className="space-y-3">
															{group.items.map((v) => {
																const id = String(v.id || v.Id);
																const name = v.name || v.Name || "Field";
																const desc = v.description || v.Description;
																const vt = v.valueType || v.ValueType;
																const meta = metaMap[id];
																const status = fieldStatuses[id] || {
																	error: null,
																	warning: null,
																};
																const isReq = meta?.isRequired;
																const curVal = values[id] ?? "";

																const hasError = !!status.error;
																const hasWarning = !hasError && !!status.warning;

																return (
																	<div
																		key={id}
																		ref={(el) => {
																			fieldRefs.current[id] = el;
																		}}
																		className={cn(
																			"rounded-xl p-3.5 sm:p-4 border transition-all",
																			hasError
																				? "border-red-500 bg-red-50/70"
																				: hasWarning
																				? "border-amber-400 bg-amber-50/70"
																				: "border-slate-200 bg-[#FBFCFE] focus-within:border-[#0EA5E9] focus-within:bg-[#F0F9FF]/50"
																		)}
																	>
																		{/* Numeric Field */}
																		{vt === "Numeric" && (
																			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
																				<div className="flex-1 min-w-[160px]">
																					<label
																						htmlFor={`var-${id}`}
																						className={cn(
																							"font-bold text-sm block",
																							hasError
																								? "text-red-600"
																								: hasWarning
																								? "text-amber-800"
																								: "text-slate-900"
																						)}
																					>
																						{name}
																						{isReq && (
																							<span className="text-red-500 ml-1 font-bold">
																								*
																							</span>
																						)}
																					</label>
																					{desc && (
																						<p className="text-xs text-slate-500 mt-0.5 leading-snug">
																							{desc}
																						</p>
																					)}
																				</div>

																				<div
																					className={cn(
																						"flex items-stretch border rounded-lg overflow-hidden shrink-0 min-w-[220px] bg-white transition-all",
																						hasError
																							? "border-red-500 ring-2 ring-red-500/20"
																							: hasWarning
																							? "border-amber-400 ring-2 ring-amber-400/20"
																							: "border-slate-200 focus-within:border-[#0EA5E9] focus-within:ring-2 focus-within:ring-[#0EA5E9]/20"
																					)}
																				>
																					<input
																						type="number"
																						id={`var-${id}`}
																						step="any"
																						value={curVal}
																						onChange={(e) =>
																							handleValueChange(id, e.target.value)
																						}
																						placeholder={normalPlaceholder(
																							meta?.normalRange
																						)}
																						className="w-full px-3 py-2 text-sm font-semibold text-slate-900 outline-none border-none bg-transparent placeholder:text-slate-400 placeholder:font-normal"
																					/>
																					{meta?.unit && (
																						<span className="flex items-center px-3 bg-slate-50 text-slate-500 font-bold text-xs border-l border-slate-200 whitespace-nowrap select-none">
																							{meta.unit}
																						</span>
																					)}
																				</div>
																			</div>
																		)}

																		{/* Categorical Field */}
																		{vt === "Categorical" && (
																			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
																				<div className="flex-1 min-w-[160px]">
																					<label
																						htmlFor={`var-${id}`}
																						className={cn(
																							"font-bold text-sm block",
																							hasError
																								? "text-red-600"
																								: "text-slate-900"
																						)}
																					>
																						{name}
																						{isReq && (
																							<span className="text-red-500 ml-1 font-bold">
																								*
																							</span>
																						)}
																					</label>
																					{desc && (
																						<p className="text-xs text-slate-500 mt-0.5 leading-snug">
																							{desc}
																						</p>
																					)}
																				</div>

																				<div
																					className={cn(
																						"flex flex-wrap border rounded-lg overflow-hidden shrink-0 min-w-[220px] max-w-full bg-white",
																						hasError
																							? "border-red-500 ring-2 ring-red-500/20"
																							: "border-slate-200"
																					)}
																				>
																					{(
																						v.acceptedValues ||
																						v.AcceptedValues ||
																						[]
																					).map((opt, optIdx) => {
																						const isActive = curVal === opt;
																						return (
																							<button
																								key={opt}
																								type="button"
																								onClick={() => {
																									handleValueChange(
																										id,
																										isActive ? "" : opt
																									);
																								}}
																								className={cn(
																									"flex-1 px-3 py-2 text-xs font-bold transition-all text-center select-none cursor-pointer",
																									optIdx > 0 && "border-l border-slate-200",
																									isActive
																										? "bg-[#0EA5E9] text-white"
																										: "bg-slate-50 hover:bg-slate-100 text-slate-700"
																								)}
																							>
																								{String(opt).replace(/_/g, " ")}
																							</button>
																						);
																					})}
																				</div>
																			</div>
																		)}

																		{/* Boolean Field */}
																		{vt === "Boolean" && (
																			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
																				<div className="flex-1 min-w-[160px]">
																					<label
																						htmlFor={`var-${id}`}
																						className={cn(
																							"font-bold text-sm block",
																							hasError
																								? "text-red-600"
																								: "text-slate-900"
																						)}
																					>
																						{name}
																						{isReq && (
																							<span className="text-red-500 ml-1 font-bold">
																								*
																							</span>
																						)}
																					</label>
																					{desc && (
																						<p className="text-xs text-slate-500 mt-0.5 leading-snug">
																							{desc}
																						</p>
																					)}
																				</div>

																				<div
																					className={cn(
																						"flex border rounded-lg overflow-hidden shrink-0 min-w-[220px] max-w-full bg-white",
																						hasError
																							? "border-red-500 ring-2 ring-red-500/20"
																							: "border-slate-200"
																					)}
																				>
																					<button
																						type="button"
																						onClick={() =>
																							handleValueChange(
																								id,
																								curVal === "false" ? "" : "false"
																							)
																						}
																						className={cn(
																							"flex-1 px-4 py-2 text-xs font-bold transition-all text-center select-none cursor-pointer",
																							curVal === "false"
																								? "bg-[#0EA5E9] text-white"
																								: "bg-slate-50 hover:bg-slate-100 text-slate-700"
																						)}
																					>
																						No
																					</button>
																					<button
																						type="button"
																						onClick={() =>
																							handleValueChange(
																								id,
																								curVal === "true" ? "" : "true"
																							)
																						}
																						className={cn(
																							"flex-1 px-4 py-2 text-xs font-bold transition-all text-center select-none border-l border-slate-200 cursor-pointer",
																							curVal === "true"
																								? "bg-[#0EA5E9] text-white"
																								: "bg-slate-50 hover:bg-slate-100 text-slate-700"
																						)}
																					>
																						Yes
																					</button>
																				</div>
																			</div>
																		)}

																		{/* Error Message */}
																		{hasError && (
																			<div className="w-full flex items-start gap-1.5 mt-2.5 text-red-600 text-xs font-bold leading-snug">
																				<span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-extrabold shrink-0 mt-0.5">
																					!
																				</span>
																				<span>{status.error}</span>
																			</div>
																		)}

																		{/* Warning Message (e.g. Age / Normal Range warning) */}
																		{hasWarning && (
																			<div className="w-full flex items-start gap-1.5 mt-2.5 text-amber-700 text-xs font-semibold leading-snug">
																				<span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-extrabold shrink-0 mt-0.5">
																					!
																				</span>
																				<span>{status.warning}</span>
																			</div>
																		)}
																	</div>
																);
															})}
														</div>
													</div>
												))}
											</div>
										</div>

										<button
											type="button"
											onClick={() => tryGoToStep(2)}
											className="w-full py-3.5 px-6 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold text-sm shadow-[0_4px_12px_rgba(14,165,233,0.25)] transition-all cursor-pointer"
										>
											Next: Antibiotic Allergies
										</button>
									</section>
								)}

								{/* Step 2: Antibiotic Allergies */}
								{currentStep === 2 && (
									<section>
										<div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 mb-5 shadow-xs">
											<h2 className="flex items-center gap-2.5 text-[1.05rem] font-bold pb-3.5 mb-2 border-b border-slate-200 text-slate-900">
												<span className="h-6 w-6 rounded-full bg-[#0EA5E9] text-white flex items-center justify-center text-xs font-extrabold shrink-0">
													2
												</span>
												Antibiotic Allergies
											</h2>

											<p className="text-xs text-slate-500 leading-relaxed mb-4">
												Select every antibiotic the patient is allergic to. Selected
												ones are added to the diagnosis request and excluded from
												treatment suggestions. None selected is valid.
											</p>

											<label
												htmlFor="antibioticSearch"
												className="block font-bold text-xs uppercase tracking-wider text-slate-600 mb-1.5"
											>
												Search antibiotics
											</label>
											<input
												id="antibioticSearch"
												type="search"
												value={allergySearch}
												onChange={(e) => setAllergySearch(e.target.value)}
												placeholder="Type to filter..."
												autoComplete="off"
												className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-medium outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all bg-white"
											/>

											{/* Antibiotic List Grid */}
											<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[340px] overflow-y-auto p-1 mt-3">
												{filteredAntibiotics.length === 0 ? (
													<div className="col-span-full py-6 text-center text-xs italic text-slate-400">
														No antibiotics match your search
													</div>
												) : (
													filteredAntibiotics.map((a) => {
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
																	onChange={() => toggleAllergy(a)}
																	className="accent-[#0EA5E9] h-4 w-4 shrink-0 rounded cursor-pointer"
																/>
																<span className="truncate text-slate-800">{name}</span>
															</label>
														);
													})
												)}
											</div>

											{/* Selected Allergies Chips */}
											<div className="flex items-center gap-2 mt-5 mb-2 pb-2 border-b border-dashed border-slate-200 text-xs font-extrabold tracking-wider uppercase text-slate-500">
												<span>Selected allergies</span>
												<span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-[0.7rem] font-extrabold min-w-[1.45rem] text-center">
													{selectedAllergies.size}
												</span>
											</div>

											<div className="flex flex-wrap gap-2 min-h-[32px] items-center">
												{selectedAllergies.size === 0 ? (
													<div className="text-xs italic text-slate-400 py-1">
														No allergies selected
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
																onClick={() => removeAllergy(id)}
																className="h-4.5 w-4.5 rounded-full bg-[#0EA5E9]/15 hover:bg-red-500 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
																aria-label={`Remove ${name}`}
															>
																&times;
															</button>
														</span>
													))
												)}
											</div>
										</div>

										{/* Step 2 Actions */}
										<div className="flex gap-3 flex-col sm:flex-row">
											<button
												type="button"
												onClick={() => tryGoToStep(1)}
												className="flex-1 py-3.5 px-6 rounded-xl bg-[#F0F9FF] hover:bg-sky-100 text-[#0284C7] font-bold text-sm border border-[#BAE6FD] transition-colors cursor-pointer"
											>
												Back
											</button>
											<button
												type="submit"
												disabled={isDiagnosing}
												className="flex-1 py-3.5 px-6 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold text-sm shadow-[0_4px_12px_rgba(14,165,233,0.25)] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
											>
												{isDiagnosing ? (
													<>
														<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
														<span>Diagnosing...</span>
													</>
												) : (
													<span>Submit Diagnosis</span>
												)}
											</button>
										</div>
									</section>
								)}
							</form>
						)}

						{/* Results Section (when result is present) */}
						{result && (
							<div className="space-y-5 animate-in fade-in duration-200">
								{/* Card 1: Diagnosis Result */}
								<div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
									<h2 className="flex items-center gap-2.5 text-[1.05rem] font-bold pb-3.5 mb-4 border-b border-slate-200 text-slate-900">
										<span className="h-6 w-6 rounded-full bg-[#0EA5E9] text-white flex items-center justify-center text-xs font-extrabold shrink-0">
											1
										</span>
										Diagnosis Result
									</h2>

									<div className="space-y-2.5">
										{/* Severity */}
										<div className="flex items-center justify-between gap-4 p-3 bg-[#FBFCFE] border border-slate-200 rounded-xl">
											<span className="text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[120px]">
												Severity
											</span>
											{(() => {
												const sev = (
													result.severity ||
													result.Severity ||
													""
												).toLowerCase();
												return (
													<span
														className={cn(
															"px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider",
															sev === "mild"
																? "bg-emerald-100 text-emerald-800"
																: sev === "moderate"
																? "bg-amber-100 text-amber-800"
																: "bg-red-100 text-red-800"
														)}
													>
														{result.severity || result.Severity || "Unknown"}
													</span>
												);
											})()}
										</div>

										{/* Treatment Site */}
										<div className="flex items-center justify-between gap-4 p-3 bg-[#FBFCFE] border border-slate-200 rounded-xl">
											<span className="text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[120px]">
												Treatment Site
											</span>
											<span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD]">
												{formatTreatmentSite(
													result.treatmentSite || result.TreatmentSite
												)}
											</span>
										</div>

										{/* Pregnant / Lactating */}
										<div className="flex items-center justify-between gap-4 p-3 bg-[#FBFCFE] border border-slate-200 rounded-xl">
											<span className="text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[120px]">
												Pregnant / Lactating
											</span>
											<span className="text-sm font-semibold text-slate-900">
												{result.isPatientPregnantOrInLactationPhase ||
												result.IsPatientPregnantOrInLactationPhase
													? "Yes"
													: "No"}
											</span>
										</div>

										{/* Allergies */}
										<div className="flex items-center justify-between gap-4 p-3 bg-[#FBFCFE] border border-slate-200 rounded-xl">
											<span className="text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[120px]">
												Allergies
											</span>
											<span className="text-sm font-semibold text-slate-900 text-right">
												{(() => {
													const allergyList =
														result.allergies || result.Allergies || [];
													return allergyList.length > 0
														? allergyList
																.map((a) => a.name || a.Name || "")
																.filter(Boolean)
																.join(", ")
														: "None";
												})()}
											</span>
										</div>
									</div>

									{/* Metrics Severity Diagnosis Block */}
									<div className="mt-5 pt-4 border-t border-dashed border-slate-200">
										<h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2.5">
											Metrics Severity Diagnosis
										</h3>

										{(() => {
											const metrics = (result.metricsSeverityDiagnosis ||
												result.MetricsSeverityDiagnosis ||
												[]) as MetricsSeverityDiagnosis[];
											if (metrics.length === 0) {
												return (
													<div className="text-xs italic text-slate-400 py-1">
														No metric severity diagnosis available
													</div>
												);
											}

											return (
												<div className="space-y-2">
													{metrics.map((m, idx) => {
														const code = m.code ?? m.Code ?? "Metric";
														const severity = (
															m.severity ??
															m.Severity ??
															""
														).toLowerCase();
														const site = m.treatmentSite ?? m.TreatmentSite ?? "";
														const score = m.score ?? m.Score;
														const major = m.majorMatched ?? m.MajorMatched;
														const minor = m.minorMatched ?? m.MinorMatched;

														return (
															<div
																key={`${code}-${idx}`}
																className="flex items-center justify-between gap-2.5 flex-wrap p-3 bg-[#FBFCFE] border border-slate-200 rounded-xl"
															>
																<div className="flex items-center gap-2">
																	<span className="font-extrabold text-sm text-slate-900">
																		{code}
																	</span>
																	{severity && (
																		<span
																			className={cn(
																				"px-2 py-0.5 rounded-full text-[0.7rem] font-extrabold uppercase tracking-wider",
																				severity === "mild"
																					? "bg-emerald-100 text-emerald-800"
																					: severity === "moderate"
																					? "bg-amber-100 text-amber-800"
																					: "bg-red-100 text-red-800"
																			)}
																		>
																			{m.severity ?? m.Severity}
																		</span>
																	)}
																</div>

																<div className="flex items-center gap-1.5 flex-wrap">
																	<span className="rounded-full px-2.5 py-0.5 text-[0.72rem] font-extrabold bg-slate-100 text-slate-600">
																		Site: {formatTreatmentSite(site)}
																	</span>
																	{score !== undefined && score !== null && (
																		<span className="rounded-full px-2.5 py-0.5 text-[0.72rem] font-extrabold bg-[#F0F9FF] text-[#0284C7]">
																			Score: {score}
																		</span>
																	)}
																	{major !== undefined &&
																		major !== null &&
																		minor !== undefined &&
																		minor !== null && (
																			<>
																				<span className="rounded-full px-2.5 py-0.5 text-[0.72rem] font-extrabold bg-[#F0F9FF] text-[#0284C7]">
																					Major: {major}
																				</span>
																				<span className="rounded-full px-2.5 py-0.5 text-[0.72rem] font-extrabold bg-slate-100 text-slate-600">
																					Minor: {minor}
																				</span>
																			</>
																		)}
																</div>
															</div>
														);
													})}
												</div>
											);
										})()}
									</div>

									{/* Evidences Accordion */}
									{(() => {
										const evidences = (result.evidences ||
											result.Evidences ||
											[]) as (Evidence | string)[];
										if (evidences.length === 0) return null;

										return (
											<div className="mt-4">
												<button
													type="button"
													onClick={() => setShowEvidences((prev) => !prev)}
													className="w-full py-2.5 px-4 rounded-xl bg-[#F0F9FF] hover:bg-sky-100 text-[#0284C7] font-bold text-xs border border-[#BAE6FD] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
												>
													{showEvidences ? "Hide" : "View"} Evidences ({evidences.length})
												</button>

												{showEvidences && (
													<div className="mt-3 p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-3">
														<h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
															Evidences
														</h3>

														<div className="space-y-2.5">
															{evidences.map((e, idx) => {
																if (typeof e === "string") {
																	return (
																		<div
																			key={idx}
																			className="p-3 bg-white border border-dashed border-slate-200 rounded-xl text-xs font-mono whitespace-pre-wrap text-slate-700"
																		>
																			{e}
																		</div>
																	);
																}

																const ev = e as Evidence;
																const source = ev.source || ev.Source || "Evidence";
																const formula = ev.formula || ev.Formula;
																const related = (ev.relatedObservations ||
																	ev.RelatedObservations ||
																	[]) as RelatedObservation[];
																const missing = (ev.missingVariables ||
																	ev.MissingVariables ||
																	[]) as { code?: string; Code?: string }[];
																const score = ev.score ?? ev.Score;
																const isMajor = ev.isMajor ?? ev.IsMajor;
																const rawVal = ev.evaluatedValue ?? ev.EvaluatedValue;

																const missingCodes = missing
																	.map((m) => m.code || m.Code)
																	.filter(Boolean);

																return (
																	<div
																		key={idx}
																		className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 text-xs"
																	>
																		<div className="font-extrabold text-sm text-slate-900">
																			{source}
																		</div>

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

																		{/* Variables */}
																		{(related.length > 0 || missingCodes.length > 0) && (
																			<div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-2.5 space-y-1">
																				<div className="text-[0.7rem] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
																					Variables
																				</div>
																				{related.length > 0 ? (
																					related.map((obs, oIdx) => {
																						const o = obs as Record<string, unknown>;
																						const vObj = (o.variable || o.Variable || {}) as {
																							code?: string;
																							Code?: string;
																							name?: string;
																							Name?: string;
																						};
																						const code = vObj.code || vObj.Code || "";
																						const name = vObj.name || vObj.Name || "";
																						const label =
																							name && code
																								? `${code} - ${name}`
																								: code || name || "Unknown";

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
																							<div
																								key={oIdx}
																								className="flex items-baseline justify-between gap-2 font-mono text-[0.75rem]"
																							>
																								<span className="text-slate-700">
																									{label}
																								</span>
																								<span className="font-bold text-[#0284C7] shrink-0">
																									{String(val)}
																								</span>
																							</div>
																						);
																					})
																				) : (
																					<div className="text-slate-400 italic">
																						(none)
																					</div>
																				)}
																			</div>
																		)}

																		{/* Value */}
																		<div className="flex items-baseline justify-between gap-2">
																			<span className="font-extrabold uppercase text-[0.7rem] text-slate-400 tracking-wider shrink-0">
																				Value
																			</span>
																			{missingCodes.length > 0 ? (
																				<span className="font-semibold text-amber-700 text-right">
																					not evaluated (missing{" "}
																					{missingCodes.join(", ")})
																				</span>
																			) : (
																				<span className="font-bold text-slate-900 text-right">
																					{rawVal !== null && rawVal !== undefined
																						? String(rawVal)
																						: "not evaluated"}
																				</span>
																			)}
																		</div>

																		{/* Badges */}
																		{(score !== undefined && score !== null ||
																			isMajor !== undefined && isMajor !== null) && (
																			<div className="flex flex-wrap gap-1.5 pt-1">
																				{score !== undefined && score !== null && (
																					<span className="px-2 py-0.5 rounded-full text-[0.72rem] font-extrabold bg-[#F0F9FF] text-[#0284C7]">
																						Score: {score}
																					</span>
																				)}
																				{isMajor !== undefined && isMajor !== null && (
																					<span
																						className={cn(
																							"px-2 py-0.5 rounded-full text-[0.72rem] font-extrabold",
																							isMajor
																								? "bg-red-100 text-red-800"
																								: "bg-slate-100 text-slate-600"
																						)}
																					>
																						{isMajor
																							? "Major criteria"
																							: "Minor criteria"}
																					</span>
																				)}
																			</div>
																		)}
																	</div>
																);
															})}
														</div>
													</div>
												)}
											</div>
										);
									})()}
								</div>

								{/* Card 2: Missing Variables */}
								<div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
									<h2 className="flex items-center gap-2.5 text-[1.05rem] font-bold pb-3.5 mb-3 border-b border-slate-200 text-slate-900">
										<span className="h-6 w-6 rounded-full bg-[#0EA5E9] text-white flex items-center justify-center text-xs font-extrabold shrink-0">
											2
										</span>
										Missing Variables
									</h2>

									{(() => {
										const missingVars =
											result.missingVariables || result.MissingVariables || [];
										if (missingVars.length === 0) {
											return (
												<div className="text-xs italic text-slate-400 py-1">
													All variables were provided
												</div>
											);
										}

										return (
											<div className="space-y-2">
												{missingVars.map((v, idx) => {
													const code = v.code || v.Code || "Variable";
													const name = v.name || v.Name || "";
													return (
														<div
															key={idx}
															className="flex items-center justify-between gap-3 p-3 bg-[#FBFCFE] border border-slate-200 rounded-xl font-semibold text-sm"
														>
															<span className="font-extrabold text-slate-900">
																{code}
															</span>
															<span className="text-slate-500 text-xs">
																{name}
															</span>
														</div>
													);
												})}
											</div>
										);
									})()}
								</div>

								{/* Card 3: Infection Assessment */}
								<div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
									<h2 className="flex items-center gap-2.5 text-[1.05rem] font-bold pb-3.5 mb-4 border-b border-slate-200 text-slate-900">
										<span className="h-6 w-6 rounded-full bg-[#0EA5E9] text-white flex items-center justify-center text-xs font-extrabold shrink-0">
											3
										</span>
										Infection Assessment
									</h2>

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
											Ranked from most to least suspected - rank 1 is the most
											likely.
										</p>

										{(() => {
											const heavy =
												result.heavySuspected || result.HeavySuspected || [];
											if (heavy.length === 0) {
												return (
													<div className="text-xs italic text-slate-400 py-1">
														No heavy suspected pathogens
													</div>
												);
											}

											return (
												<div className="space-y-1">
													{heavy.map((p, idx) => {
														const name = p.name || p.Name || "";
														return (
															<div
																key={idx}
																className="flex items-center gap-3 py-2 border-t border-red-100 first:border-t-0 text-sm font-semibold text-slate-900"
															>
																<span
																	className={cn(
																		"inline-flex items-center justify-center min-w-[2rem] h-6 px-1.5 rounded-full text-xs font-extrabold shrink-0",
																		idx === 0
																			? "bg-red-800 text-white"
																			: "bg-red-100 text-red-800"
																	)}
																>
																	#{idx + 1}
																</span>
																<span className="italic flex-1">{name}</span>
															</div>
														);
													})}
												</div>
											);
										})()}
									</div>

									{/* Worth Suspected */}
									<div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
										{(() => {
											const worth =
												result.worthSuspected || result.WorthSuspected || [];
											return (
												<>
													<button
														type="button"
														onClick={() => setIsWorthExpanded((prev) => !prev)}
														className="w-full flex items-center gap-2 text-slate-700 font-bold text-sm text-left cursor-pointer"
													>
														<svg
															className={cn(
																"w-4 h-4 shrink-0 transition-transform duration-150",
																isWorthExpanded && "rotate-90"
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

													{isWorthExpanded && (
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
												</>
											);
										})()}
									</div>
								</div>

								{/* New Diagnosis Button */}
								<button
									type="button"
									onClick={handleReset}
									className="w-full py-3.5 px-6 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold text-sm shadow-[0_4px_12px_rgba(14,165,233,0.25)] transition-all cursor-pointer"
								>
									New Diagnosis
								</button>
							</div>
						)}

						{/* Disclaimer */}
						<p className="text-center text-xs text-slate-400 mt-6 px-4">
							For clinical decision support use only. Always correlate with clinical
							judgment.
						</p>
					</>
				)}
			</div>

			{/* Error Modal */}
			{errorModal.isOpen && (
				<div
					className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
					onClick={(e) => {
						if (e.target === e.currentTarget) {
							setErrorModal((prev) => ({ ...prev, isOpen: false }));
						}
					}}
				>
					<div
						className="bg-white rounded-2xl max-w-[440px] w-full p-6 shadow-2xl border-t-4 border-red-500 animate-in zoom-in-95 duration-150"
						style={{ zoom: 1.15 }}
					>
							<h3 className="flex items-center gap-2 text-red-600 font-extrabold text-base mb-2">
								<svg
									className="w-5 h-5 shrink-0"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<circle cx="12" cy="12" r="10" />
									<line x1="12" y1="8" x2="12" y2="12" />
									<line x1="12" y1="16" x2="12.01" y2="16" />
								</svg>
								{errorModal.title}
							</h3>

							<p className="text-sm text-slate-800 break-words mb-4">
								{errorModal.message}
							</p>

							{errorModal.details.length > 0 && (
								<ul className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700 list-disc pl-7 space-y-1 max-h-40 overflow-y-auto">
									{errorModal.details.map((msg, i) => (
										<li key={i}>{msg}</li>
									))}
								</ul>
							)}

							<div className="flex justify-end">
								<button
									type="button"
									onClick={() => setErrorModal((prev) => ({ ...prev, isOpen: false }))}
									className="px-6 py-2 rounded-lg bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold text-sm shadow-sm transition-colors cursor-pointer"
								>
									OK
								</button>
							</div>
						</div>
					</div>
				)}
		</div>
	);
}

