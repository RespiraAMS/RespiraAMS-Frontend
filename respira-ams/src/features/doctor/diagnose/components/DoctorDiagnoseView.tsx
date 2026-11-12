"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDiagnosisForm, diagnose } from "../api";
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

function translateServerErrorMessage(msg: string): string {
	if (!msg) return "Chẩn đoán không thành công do lỗi hệ thống.";
	const lower = msg.toLowerCase();
	if (lower.includes("failed to find any candidate treatment protocols")) {
		return "Hệ thống chưa tìm thấy phác đồ điều trị phù hợp trong cơ sở dữ liệu (Hiện chưa có phác đồ điều trị nào được áp dụng cho mức độ bệnh này trong hệ thống).";
	}
	if (lower.includes("failed to perform severity diagnosis") || lower.includes("no severity diagnosis")) {
		return "Không thể xác định mức độ nặng của bệnh nhân từ các chỉ số đã cung cấp.";
	}
	if (lower.includes("invalid observation value")) {
		return "Giá trị của một hoặc nhiều chỉ số lâm sàng nhập vào không hợp lệ.";
	}
	if (lower.includes("not all pathogen ids exists") || lower.includes("variable not found")) {
		return "Dữ liệu chỉ số hoặc tác nhân không tồn tại trong hệ thống.";
	}
	if (lower.includes("invalid allergies list")) {
		return "Danh sách kháng sinh dị ứng không hợp lệ.";
	}
	if (lower.includes("allergic antibiotic ids must not be empty")) {
		return "Mã kháng sinh dị ứng không hợp lệ.";
	}
	if (lower.includes("allergy was given value that semantically conflicted")) {
		return "Thông tin tiền sử dị ứng kháng sinh không nhất quán.";
	}
	return msg;
}

const CLOSED_MODAL: ErrorModalState = { isOpen: false, title: "Lỗi", message: "", details: [] };

export function DoctorDiagnoseView() {
	const {
		data: formData,
		isLoading,
		error: queryError,
	} = useQuery({
		queryKey: ["diagnose", "form"],
		queryFn: fetchDiagnosisForm,
	});

	const variables = useMemo<ClinicalVariable[]>(() => {
		if (!formData) return [];
		return (
			formData.variables ||
			formData.Variables ||
			formData.clinicalVariables ||
			formData.ClinicalVariables ||
			[]
		);
	}, [formData]);

	const antibiotics = useMemo<AntibioticItem[]>(() => {
		if (!formData) return [];
		return formData.antibiotics || formData.Antibiotics || [];
	}, [formData]);

	const loadError = queryError
		? queryError instanceof Error
			? queryError.message
			: "Không thể tải biểu mẫu chẩn đoán từ hệ thống. Vui lòng kiểm tra lại kết nối."
		: null;

	const [currentStep, setCurrentStep] = useState<1 | 2>(1);
	const [values, setValues] = useState<Record<string, string>>({});
	const [selectedAllergies, setSelectedAllergies] = useState<Map<string, string>>(new Map());
	const [allergySearch, setAllergySearch] = useState("");
	const [fieldStatuses, setFieldStatuses] = useState<Record<string, FieldStatus>>({});

	const [errorModal, setErrorModal] = useState<ErrorModalState>(CLOSED_MODAL);
	const [isDiagnosing, setIsDiagnosing] = useState(false);
	const [result, setResult] = useState<DiagnoseResponse | null>(null);

	const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({});

	// Initialize form values when clinical variables are loaded
	useEffect(() => {
		if (variables.length > 0) {
			setValues((prev) => {
				if (Object.keys(prev).length === 0) {
					return buildInitialValues(variables);
				}
				return prev;
			});
		}
	}, [variables]);

	const metaMap = useMemo(() => {
		const map: Record<string, FieldMeta> = {};
		variables.forEach((v) => {
			const id = String(v.id || v.Id);
			map[id] = {
				id,
				name: v.name || v.Name || "Chỉ số",
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
				? { error: `Vui lòng nhập ${meta.name}.`, warning: null }
				: { error: null, warning: null };
		}

		if (meta.valueType !== "Numeric") return { error: null, warning: null };

		const num = Number(value);
		if (!Number.isFinite(num)) {
			return { error: `${meta.name} phải là một số hợp lệ.`, warning: null };
		}

		if (meta.acceptedRange && !inRange(num, meta.acceptedRange)) {
			return {
				error: `Giá trị phải nằm trong khoảng cho phép (${describeRange(meta.acceptedRange, meta.unit)}).`,
				warning: null,
			};
		}

		if (meta.normalRange && !inRange(num, meta.normalRange)) {
			return {
				error: null,
				warning: `Nằm ngoài khoảng giá trị sinh lý bình thường (${describeRange(meta.normalRange, meta.unit)}). Giá trị này vẫn được chấp nhận để chẩn đoán.`,
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
			title: "Thông tin chưa hợp lệ",
			message: `Vui lòng kiểm tra lại ${invalidCount === 1 ? "trường thông tin" : `${invalidCount} trường thông tin`} được đánh dấu đỏ trước khi ${action}.`,
			details: [],
		});
		if (firstInvalidId) scrollToField(firstInvalidId);
	};

	const tryGoToStep = (target: 1 | 2) => {
		if (target > currentStep) {
			const { invalidCount, firstInvalidId } = validateAll();
			if (invalidCount > 0) {
				showValidationError(invalidCount, firstInvalidId, "chuyển sang bước tiếp theo");
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
			showValidationError(invalidCount, firstInvalidId, "xác nhận chẩn đoán");
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
			const rawDescription =
				err instanceof Error ? err.message : "Chẩn đoán không thành công do lỗi hệ thống.";
			const description = translateServerErrorMessage(rawDescription);
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
					title: "Không thể thực hiện chẩn đoán",
					message: `${description}. Vui lòng kiểm tra lại các trường được đánh dấu đỏ bên dưới.`,
					details: Object.values(detail).filter(Boolean),
				});
				if (firstId) scrollToField(firstId);
			} else {
				setErrorModal({
					isOpen: true,
					title: "Không thể thực hiện chẩn đoán",
					message: description,
					details: [],
				});
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
						<p className="text-sm font-medium">Đang tải biểu mẫu chẩn đoán...</p>
					</div>
				)}

				{loadError && (
					<div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold text-center mb-6">
						{loadError}
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
							Chỉ sử dụng để hỗ trợ quyết định lâm sàng. Luôn kết hợp với đánh giá chuyên môn của bác sĩ điều trị.
						</p>
					</>
				)}
			</div>

			<DiagnoseErrorModal state={errorModal} onClose={() => setErrorModal(CLOSED_MODAL)} />
		</div>
	);
}
