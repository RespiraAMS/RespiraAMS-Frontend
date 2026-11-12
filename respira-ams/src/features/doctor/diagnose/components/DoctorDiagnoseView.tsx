"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	fetchDiagnosisForm,
	fetchAntibioticList,
	diagnose,
	DEFAULT_DIAGNOSIS_VARIABLES,
	DEFAULT_ANTIBIOTICS,
} from "../api";
import { AntibioticItem, ClinicalVariable, DiagnoseResponse } from "../types";
import {
	FieldMeta,
	FieldStatus,
	buildInitialValues,
	describeRange,
	inRange,
	normalizeRange,
} from "../utils";
import { DiagnoseHeader } from "./DiagnoseHeader";
import { DiagnoseStepper } from "./DiagnoseStepper";
import { ObservationsStep } from "./ObservationsStep";
import { AllergiesStep } from "./AllergiesStep";
import { DiagnosisResultView } from "./DiagnosisResultView";
import { DiagnoseErrorModal, ErrorModalState } from "./DiagnoseErrorModal";

const CLOSED_MODAL: ErrorModalState = { isOpen: false, title: "Error", message: "", details: [] };

export function DoctorDiagnoseView() {
	const [variables, setVariables] = useState<ClinicalVariable[]>(() => DEFAULT_DIAGNOSIS_VARIABLES);
	const [antibiotics, setAntibiotics] = useState<AntibioticItem[]>(() => DEFAULT_ANTIBIOTICS);
	const [isLoading, setIsLoading] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);

	const [currentStep, setCurrentStep] = useState<1 | 2>(1);
	const [values, setValues] = useState<Record<string, string>>(() =>
		buildInitialValues(DEFAULT_DIAGNOSIS_VARIABLES)
	);
	const [selectedAllergies, setSelectedAllergies] = useState<Map<string, string>>(new Map());
	const [allergySearch, setAllergySearch] = useState("");
	const [fieldStatuses, setFieldStatuses] = useState<Record<string, FieldStatus>>({});

	const [errorModal, setErrorModal] = useState<ErrorModalState>(CLOSED_MODAL);
	const [isDiagnosing, setIsDiagnosing] = useState(false);
	const [result, setResult] = useState<DiagnoseResponse | null>(null);

	const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

	useEffect(() => {
		let isMounted = true;
		if (variables.length === 0) {
			setIsLoading(true);
		}
		setLoadError(null);

		Promise.all([fetchDiagnosisForm(), fetchAntibioticList()])
			.then(([formData, antibioticList]) => {
				if (!isMounted) return;
				const vars = formData.variables || formData.Variables || [];
				setVariables(vars);
				setAntibiotics(antibioticList || []);
				setValues(buildInitialValues(vars));
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

	const metaMap = useMemo(() => {
		const map: Record<string, FieldMeta> = {};
		variables.forEach((v) => {
			const id = String(v.id || v.Id);
			map[id] = {
				id,
				name: v.name || v.Name || "Field",
				valueType: v.valueType || v.ValueType || "Numeric",
				isRequired: !!(v.isRequired !== undefined ? v.isRequired : v.IsRequired),
				unit: v.canonicalUnit || v.CanonicalUnit || null,
				acceptedRange: normalizeRange(
					v.acceptedRange !== undefined ? v.acceptedRange : v.AcceptedRange
				),
				normalRange: normalizeRange(
					v.normalRange !== undefined ? v.normalRange : v.NormalRange
				),
			};
		});
		return map;
	}, [variables]);

	const validateField = (id: string, val: string): FieldStatus => {
		const meta = metaMap[id];
		if (!meta) return { error: null, warning: null };

		const value = (val ?? "").trim();

		if (value === "") {
			return meta.isRequired
				? { error: `${meta.name} is required.`, warning: null }
				: { error: null, warning: null };
		}

		if (meta.valueType !== "Numeric") return { error: null, warning: null };

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

	const handleValueChange = (id: string, newVal: string) => {
		setValues((prev) => ({ ...prev, [id]: newVal }));
		setFieldStatuses((prev) => ({ ...prev, [id]: validateField(id, newVal) }));
	};

	const validateAll = () => {
		let invalidCount = 0;
		let firstInvalidId: string | null = null;
		const next: Record<string, FieldStatus> = {};

		variables.forEach((v) => {
			const id = String(v.id || v.Id);
			const status = validateField(id, values[id] ?? "");
			next[id] = status;
			if (status.error) {
				invalidCount++;
				if (!firstInvalidId) firstInvalidId = id;
			}
		});

		setFieldStatuses((prev) => ({ ...prev, ...next }));
		return { invalidCount, firstInvalidId };
	};

	const scrollToField = (id: string) => {
		setTimeout(() => {
			fieldRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" });
		}, 100);
	};

	const showValidationError = (invalidCount: number, firstInvalidId: string | null, action: string) => {
		setErrorModal({
			isOpen: true,
			title: "Error",
			message: `Please fix the highlighted ${invalidCount === 1 ? "field" : "fields"} before ${action}.`,
			details: [],
		});
		if (firstInvalidId) scrollToField(firstInvalidId);
	};

	const tryGoToStep = (target: 1 | 2) => {
		if (target > currentStep) {
			const { invalidCount, firstInvalidId } = validateAll();
			if (invalidCount > 0) {
				showValidationError(invalidCount, firstInvalidId, "continuing to the next step");
				return;
			}
		}
		setCurrentStep(target);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const toggleAllergy = (antibiotic: AntibioticItem) => {
		const id = String(antibiotic.id || antibiotic.Id);
		const name = antibiotic.name || antibiotic.Name || id;
		setSelectedAllergies((prev) => {
			const next = new Map(prev);
			if (next.has(id)) next.delete(id);
			else next.set(id, name);
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

	const handleSubmitDiagnosis = async (e?: React.FormEvent) => {
		e?.preventDefault();

		if (currentStep !== 2) {
			tryGoToStep(2);
			return;
		}

		const { invalidCount, firstInvalidId } = validateAll();
		if (invalidCount > 0) {
			showValidationError(invalidCount, firstInvalidId, "submitting");
			return;
		}

		const observations: { variableId: string; value: string }[] = [];
		variables.forEach((v) => {
			const id = String(v.id || v.Id);
			const val = (values[id] ?? "").trim();
			if (val !== "") observations.push({ variableId: id, value: val });
		});

		setIsDiagnosing(true);
		try {
			const res = await diagnose({
				observations,
				allergies: Array.from(selectedAllergies.keys()),
			});
			setResult(res);
			window.scrollTo({ top: 0, behavior: "smooth" });
		} catch (err: unknown) {
			const description = err instanceof Error ? err.message : "Diagnosis failed";
			const detail = (err as { detail?: Record<string, string> })?.detail;

			if (detail && typeof detail === "object") {
				const next: Record<string, FieldStatus> = {};
				let firstId: string | null = null;
				Object.entries(detail).forEach(([varId, msg]) => {
					if (!msg) return;
					next[varId] = { error: msg, warning: null };
					if (!firstId) firstId = varId;
				});
				setFieldStatuses((prev) => ({ ...prev, ...next }));

				setErrorModal({
					isOpen: true,
					title: "Error",
					message: `${description}. Please review the highlighted fields below.`,
					details: Object.values(detail).filter(Boolean),
				});
				if (firstId) scrollToField(firstId);
			} else {
				setErrorModal({ isOpen: true, title: "Error", message: description, details: [] });
			}
		} finally {
			setIsDiagnosing(false);
		}
	};

	const handleReset = () => {
		setResult(null);
		setCurrentStep(1);
		setFieldStatuses({});
		setSelectedAllergies(new Map());
		setAllergySearch("");
		setValues(buildInitialValues(variables));
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<div className="min-h-screen bg-[#F8FAFC] pb-16 font-sans">
			<div className="max-w-[850px] mx-auto px-4 pt-6" style={{ zoom: 1.15 }}>
				<DiagnoseHeader />

				{isLoading && (
					<div className="text-center py-16 text-slate-500">
						<div className="inline-block w-8 h-8 border-2 border-slate-200 border-t-[#0EA5E9] rounded-full animate-spin mb-3" />
						<p className="text-sm font-medium">Loading diagnosis form...</p>
					</div>
				)}

				{loadError && (
					<div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold text-center mb-6">
						Failed to load form: {loadError}
					</div>
				)}

				{!isLoading && !loadError && (
					<>
						{result ? (
							<DiagnosisResultView result={result} onReset={handleReset} />
						) : (
							<form onSubmit={handleSubmitDiagnosis} noValidate>
								<DiagnoseStepper currentStep={currentStep} onStepChange={tryGoToStep} />

								{currentStep === 1 ? (
									<ObservationsStep
										variables={variables}
										metaMap={metaMap}
										values={values}
										fieldStatuses={fieldStatuses}
										onValueChange={handleValueChange}
										registerFieldRef={(id, el) => {
											fieldRefs.current[id] = el;
										}}
										onNext={() => tryGoToStep(2)}
									/>
								) : (
									<AllergiesStep
										antibiotics={antibiotics}
										selectedAllergies={selectedAllergies}
										search={allergySearch}
										onSearchChange={setAllergySearch}
										onToggle={toggleAllergy}
										onRemove={removeAllergy}
										onBack={() => tryGoToStep(1)}
										isDiagnosing={isDiagnosing}
									/>
								)}
							</form>
						)}

						<p className="text-center text-xs text-slate-400 mt-6 px-4">
							For clinical decision support use only. Always correlate with clinical
							judgment.
						</p>
					</>
				)}
			</div>

			<DiagnoseErrorModal state={errorModal} onClose={() => setErrorModal(CLOSED_MODAL)} />
		</div>
	);
}
