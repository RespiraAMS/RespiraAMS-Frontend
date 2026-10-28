"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SeverityBadge } from "@/features/doctor/components/badges";
import { labelOf, treatmentSiteLabels } from "@/features/doctor/lib/mappers";
import {
	diagnose,
	fetchAntibioticList,
	fetchDiagnosisForm,
} from "@/features/doctor/diagnose/api";
import {
	AntibioticItem,
	ClinicalVariable,
	ClinicalVariableCategory,
	DiagnoseResponse,
	ValueRange,
} from "@/features/doctor/diagnose/types";

const CATEGORY_ORDER: ClinicalVariableCategory[] = [
	"PersonalInformation",
	"Clinical",
	"Paraclinical",
];

const CATEGORY_LABELS: Record<ClinicalVariableCategory, string> = {
	PersonalInformation: "Thông tin cá nhân",
	Clinical: "Triệu chứng lâm sàng",
	Paraclinical: "Cận lâm sàng",
};

const SELECT_CLASS =
	"w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

function formatRange(range?: ValueRange | null): string | null {
	if (!range) return null;
	const left = range.isMinExclusive ? "(" : "[";
	const right = range.isMaxExclusive ? ")" : "]";
	return `${left}${range.min} – ${range.max}${right}${range.unit ? ` ${range.unit}` : ""}`;
}

function isInRange(value: number, range: ValueRange): boolean {
	const aboveMin = range.isMinExclusive ? value > range.min : value >= range.min;
	const belowMax = range.isMaxExclusive ? value < range.max : value <= range.max;
	return aboveMin && belowMax;
}

function formatEvaluated(value: unknown): string {
	if (value === null || value === undefined) return "—";
	if (typeof value === "boolean") return value ? "Đúng" : "Sai";
	return String(value);
}

function VariableField({
	variable,
	value,
	onChange,
}: {
	variable: ClinicalVariable;
	value: string;
	onChange: (value: string) => void;
}) {
	const unit = variable.canonicalUnit ?? variable.normalRange?.unit ?? null;
	const normal = formatRange(variable.normalRange);
	const inputId = `var-${variable.code}`;

	return (
		<div className="space-y-1.5">
			<label htmlFor={inputId} className="text-sm font-medium block">
				{variable.name}
				{variable.isRequired && <span className="text-red-500 ml-0.5">*</span>}
				{unit && variable.valueType === "Numeric" && (
					<span className="text-muted-foreground font-normal"> ({unit})</span>
				)}
			</label>

			{variable.valueType === "Numeric" && (
				<Input
					id={inputId}
					type="number"
					step="any"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={normal ? `Bình thường: ${normal}` : undefined}
				/>
			)}

			{variable.valueType === "Boolean" && (
				<select
					id={inputId}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className={SELECT_CLASS}
				>
					<option value="">Chưa rõ</option>
					<option value="true">Có</option>
					<option value="false">Không</option>
				</select>
			)}

			{variable.valueType === "Categorical" && (
				<select
					id={inputId}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className={SELECT_CLASS}
				>
					<option value="">Chọn giá trị</option>
					{(variable.acceptedValues ?? []).map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
			)}

			{variable.description && (
				<p className="text-xs text-muted-foreground">{variable.description}</p>
			)}
		</div>
	);
}

export default function ClinicalFormPage() {
	const [variables, setVariables] = useState<ClinicalVariable[]>([]);
	const [antibiotics, setAntibiotics] = useState<AntibioticItem[]>([]);
	const [isLoadingForm, setIsLoadingForm] = useState(true);
	const [formError, setFormError] = useState<string | null>(null);

	const [values, setValues] = useState<Record<string, string>>({});
	const [allergies, setAllergies] = useState<string[]>([]);
	const [allergyFilter, setAllergyFilter] = useState("");

	const [result, setResult] = useState<DiagnoseResponse | null>(null);
	const [isDiagnosing, setIsDiagnosing] = useState(false);
	const [submitErrors, setSubmitErrors] = useState<string[]>([]);

	useEffect(() => {
		let cancelled = false;
		Promise.all([fetchDiagnosisForm(), fetchAntibioticList()])
			.then(([form, list]) => {
				if (cancelled) return;
				setVariables(form?.variables ?? []);
				setAntibiotics(list);
			})
			.catch((err) => {
				if (cancelled) return;
				setFormError(
					err instanceof Error ? err.message : "Không thể tải biểu mẫu chẩn đoán."
				);
			})
			.finally(() => {
				if (!cancelled) setIsLoadingForm(false);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	const grouped = useMemo(
		() =>
			CATEGORY_ORDER.map((category) => ({
				category,
				items: variables.filter((v) => v.category === category),
			})).filter((group) => group.items.length > 0),
		[variables]
	);

	const filteredAntibiotics = useMemo(() => {
		const q = allergyFilter.trim().toLowerCase();
		return q
			? antibiotics.filter((a) => a.name.toLowerCase().includes(q))
			: antibiotics;
	}, [antibiotics, allergyFilter]);

	const setValue = (id: string, value: string) =>
		setValues((prev) => ({ ...prev, [id]: value }));

	const toggleAllergy = (id: string) =>
		setAllergies((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
		);

	const handleReset = () => {
		setValues({});
		setAllergies([]);
		setAllergyFilter("");
		setResult(null);
		setSubmitErrors([]);
	};

	const handleDiagnose = async () => {
		const errors: string[] = [];
		const observations: { variableId: string; value: string }[] = [];

		for (const variable of variables) {
			const raw = (values[variable.id] ?? "").trim();
			if (!raw) {
				if (variable.isRequired) errors.push(`Vui lòng nhập "${variable.name}".`);
				continue;
			}
			if (variable.valueType === "Numeric") {
				const num = Number(raw);
				if (Number.isNaN(num)) {
					errors.push(`"${variable.name}" phải là một số.`);
					continue;
				}
				if (variable.acceptedRange && !isInRange(num, variable.acceptedRange)) {
					errors.push(
						`"${variable.name}" nằm ngoài khoảng chấp nhận ${formatRange(variable.acceptedRange)}.`
					);
					continue;
				}
			}
			observations.push({ variableId: variable.id, value: raw });
		}

		setSubmitErrors(errors);
		if (errors.length > 0) return;

		setIsDiagnosing(true);
		try {
			setResult(await diagnose({ observations, allergies }));
		} catch (err) {
			setResult(null);
			setSubmitErrors([
				err instanceof Error ? err.message : "Không thể thực hiện chẩn đoán.",
			]);
		} finally {
			setIsDiagnosing(false);
		}
	};

	return (
		<div>
			<div className="space-y-6 max-w-5xl mx-auto px-4 pt-8 pb-12">
				<header className="mb-8">
					<p className="text-primary text-sm font-semibold uppercase tracking-widest">
						Đánh giá ban đầu
					</p>
					<h1 className="text-3xl font-bold mt-2 text-foreground">
						Mẫu Thông tin Bệnh nhân &amp; Chẩn đoán
					</h1>
					<p className="text-muted-foreground mt-2">
						Vui lòng hoàn thành các trường thông tin cần thiết (đánh dấu *) để
						hệ thống đánh giá lâm sàng.
					</p>
				</header>

				{isLoadingForm && (
					<p className="text-sm text-muted-foreground">Đang tải biểu mẫu...</p>
				)}
				{formError && (
					<p className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
						{formError}
					</p>
				)}

				{!isLoadingForm && !formError && (
					<form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
						{grouped.map((group) => (
							<Card key={group.category}>
								<CardHeader>
									<CardTitle>{CATEGORY_LABELS[group.category]}</CardTitle>
								</CardHeader>
								<CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									{group.items.map((variable) => (
										<VariableField
											key={variable.id}
											variable={variable}
											value={values[variable.id] ?? ""}
											onChange={(v) => setValue(variable.id, v)}
										/>
									))}
								</CardContent>
							</Card>
						))}

						<Card>
							<CardHeader>
								<CardTitle>Tiền sử dị ứng kháng sinh</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<Input
									value={allergyFilter}
									onChange={(e) => setAllergyFilter(e.target.value)}
									placeholder="Tìm kháng sinh..."
								/>
								{antibiotics.length === 0 ? (
									<p className="text-sm text-muted-foreground">
										Chưa có dữ liệu kháng sinh.
									</p>
								) : (
									<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto">
										{filteredAntibiotics.map((antibiotic) => (
											<label
												key={antibiotic.id}
												className="flex items-center gap-2 text-sm cursor-pointer rounded-md border px-3 py-2 hover:bg-muted/30"
											>
												<input
													type="checkbox"
													checked={allergies.includes(antibiotic.id)}
													onChange={() => toggleAllergy(antibiotic.id)}
													className="h-4 w-4 accent-primary"
												/>
												<span>{antibiotic.name}</span>
											</label>
										))}
									</div>
								)}
								{allergies.length > 0 && (
									<p className="text-xs text-muted-foreground">
										Đã chọn {allergies.length} kháng sinh.
									</p>
								)}
							</CardContent>
						</Card>

						{submitErrors.length > 0 && (
							<ul className="text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 list-disc pl-8 space-y-1">
								{submitErrors.map((error) => (
									<li key={error}>{error}</li>
								))}
							</ul>
						)}

						{result && <DiagnosisResult result={result} />}

						<footer className="flex items-center justify-between border-t pt-6">
							<Button
								type="button"
								variant="outline"
								size="lg"
								onClick={handleReset}
								id="diagnose-reset-btn"
							>
								Đặt lại
							</Button>
							<Button
								type="button"
								size="lg"
								onClick={handleDiagnose}
								disabled={isDiagnosing}
								id="diagnose-evaluate-btn"
							>
								{isDiagnosing ? "Đang xử lý..." : "Chẩn đoán"}
							</Button>
						</footer>
					</form>
				)}
			</div>
		</div>
	);
}

function PathogenList({
	title,
	items,
}: {
	title: string;
	items: { id: string; name: string }[];
}) {
	return (
		<div>
			<h3 className="font-semibold mb-3">{title}</h3>
			{items.length === 0 ? (
				<p className="text-sm text-muted-foreground">Không có.</p>
			) : (
				<div className="space-y-2">
					{items.map((item) => (
						<div
							key={item.id}
							className="border rounded-lg p-3 hover:bg-muted/30 transition-colors"
						>
							<p className="font-medium text-sm italic">{item.name}</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function DiagnosisResult({ result }: { result: DiagnoseResponse }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Kết quả chẩn đoán</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div className="border rounded-lg p-4 bg-muted/20">
						<p className="text-sm text-muted-foreground">Mức độ nghiêm trọng</p>
						<div className="mt-2">
							<SeverityBadge severity={result.severity} />
						</div>
					</div>
					<div className="border rounded-lg p-4 bg-muted/20">
						<p className="text-sm text-muted-foreground">Nơi điều trị</p>
						<p className="text-lg font-semibold mt-1 text-foreground">
							{labelOf(treatmentSiteLabels, result.treatmentSite)}
						</p>
					</div>
				</div>

				{result.isPatientPregnantOrInLactationPhase && (
					<p className="text-sm font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
						Bệnh nhân đang mang thai hoặc cho con bú — cân nhắc khi chọn kháng sinh.
					</p>
				)}

				{result.missingVariables.length > 0 && (
					<div className="text-sm bg-muted/30 border rounded-lg px-4 py-3">
						<p className="font-medium">Thông tin còn thiếu (có thể ảnh hưởng độ chính xác):</p>
						<p className="text-muted-foreground mt-1">
							{result.missingVariables.map((v) => v.name).join(", ")}
						</p>
					</div>
				)}

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
					<PathogenList
						title="Tác nhân cần lưu ý"
						items={result.worthSuspected}
					/>
					<PathogenList
						title="Tác nhân kháng thuốc nguy cơ cao"
						items={result.heavySuspected}
					/>
				</div>

				{result.allergies.length > 0 && (
					<div>
						<h3 className="font-semibold mb-2">Dị ứng đã ghi nhận</h3>
						<p className="text-sm text-muted-foreground">
							{result.allergies.map((a) => a.name).join(", ")}
						</p>
					</div>
				)}

				{result.metricsSeverityDiagnosis.length > 0 && (
					<div>
						<h3 className="font-semibold mb-3">Đánh giá theo thang điểm</h3>
						<div className="space-y-2">
							{result.metricsSeverityDiagnosis.map((metric) => (
								<div
									key={metric.code}
									className="flex items-center justify-between gap-3 border rounded-lg p-3"
								>
									<div>
										<p className="font-medium text-sm">{metric.code}</p>
										<p className="text-xs text-muted-foreground mt-0.5">
											{metric.score != null
												? `Điểm: ${metric.score}`
												: `Tiêu chí chính: ${metric.majorMatched ?? 0} · phụ: ${metric.minorMatched ?? 0}`}
											{" · "}
											{labelOf(treatmentSiteLabels, metric.treatmentSite)}
										</p>
									</div>
									<SeverityBadge severity={metric.severity} />
								</div>
							))}
						</div>
					</div>
				)}

				{result.evidences.length > 0 && (
					<details className="border rounded-lg">
						<summary className="cursor-pointer px-4 py-3 font-semibold text-sm">
							Căn cứ chẩn đoán ({result.evidences.length})
						</summary>
						<div className="divide-y border-t">
							{result.evidences.map((evidence, index) => (
								<div key={`${evidence.source}-${index}`} className="px-4 py-3 text-sm">
									<p className="font-medium">{evidence.source}</p>
									<p className="text-xs text-muted-foreground font-mono mt-1 break-all">
										{evidence.formula}
									</p>
									<p className="text-xs mt-1">
										Giá trị: <strong>{formatEvaluated(evidence.evaluatedValue)}</strong>
										{evidence.score != null && <> · Điểm: {evidence.score}</>}
										{evidence.isMajor != null && (
											<> · {evidence.isMajor ? "Tiêu chí chính" : "Tiêu chí phụ"}</>
										)}
									</p>
									{evidence.missingVariables.length > 0 && (
										<p className="text-xs text-amber-700 mt-1">
											Thiếu: {evidence.missingVariables.map((v) => v.code).join(", ")}
										</p>
									)}
								</div>
							))}
						</div>
					</details>
				)}
			</CardContent>
		</Card>
	);
}
