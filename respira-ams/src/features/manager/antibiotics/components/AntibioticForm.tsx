"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AwareCategory, MOCK_SPECTRA, type AntibioticItem, type CreateAntibioticRequest } from "../types";

// ─── Constants ────────────────────────────────────────────────────────────────

const ROUTE_OPTIONS = [
	{ label: "Intravenous (Tiêm tĩnh mạch)", value: "intravenous" },
	{ label: "Oral (Uống)", value: "oral" },
];

const selectCls = (hasError?: boolean) =>
	`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
		hasError
			? "border-red-500 focus-visible:ring-red-500"
			: "border-input focus-visible:ring-ring"
	}`;

// ─── Validation ───────────────────────────────────────────────────────────────

const antibioticSchema = z
	.object({
		name: z.string().trim().min(1, "Vui lòng nhập tên kháng sinh!"),
		antibioticSpectrumId: z.string().min(1, "Vui lòng chọn phổ kháng sinh!"),
		category: z.string().min(1, "Vui lòng chọn phân loại AWaRe!"),
		routes: z.array(z.string()).min(1, "Chọn ít nhất một đường dùng!"),
		dosages: z.record(z.string(), z.array(z.string())),
	})
	.superRefine((data, ctx) => {
		data.routes.forEach((route) => {
			const validDoses = (data.dosages[route] || []).filter((d) => d.trim() !== "");
			if (validDoses.length === 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Vui lòng nhập ít nhất một liều dùng cho đường này!",
					path: ["dosages", route],
				});
			}
		});
	});

// ─── Props ────────────────────────────────────────────────────────────────────

interface AntibioticFormProps {
	initialData?: AntibioticItem | null;
	onSubmit: (data: CreateAntibioticRequest) => void;
	onCancel: () => void;
	isPending?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AntibioticForm({
	initialData,
	onSubmit,
	onCancel,
	isPending = false,
}: AntibioticFormProps) {
	const isEdit = !!initialData;

	const [name, setName] = useState("");
	const [spectrumId, setSpectrumId] = useState("");
	const [category, setCategory] = useState<AwareCategory | "">("");
	const [routes, setRoutes] = useState<string[]>([]);
	const [dosages, setDosages] = useState<Record<string, string[]>>({});
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});

	// Pre-fill when editing
	useEffect(() => {
		if (initialData) {
			setName(initialData.name ?? "");
			setSpectrumId(initialData.antibioticSpectrum?.id ?? "");
			setCategory((initialData.category as AwareCategory) ?? "");
			setRoutes(initialData.routeOfAdministrations ?? Object.keys(initialData.dosages ?? {}));
			setDosages(initialData.dosages ?? {});
		} else {
			setName(""); setSpectrumId(""); setCategory(""); setRoutes([]); setDosages({});
		}
		setFormErrors({});
	}, [initialData]);

	const handleRouteChange = (routeValue: string, checked: boolean) => {
		if (checked) {
			setRoutes((prev) => [...prev, routeValue]);
			setDosages((prev) => ({ ...prev, [routeValue]: prev[routeValue] || [""] }));
		} else {
			setRoutes((prev) => prev.filter((r) => r !== routeValue));
			const next = { ...dosages };
			delete next[routeValue];
			setDosages(next);
		}
		if (formErrors.routes) setFormErrors((p) => ({ ...p, routes: "" }));
	};

	const handleDosageChange = (route: string, index: number, value: string) => {
		setDosages((prev) => {
			const updated = [...(prev[route] || [])];
			updated[index] = value;
			return { ...prev, [route]: updated };
		});
		if (formErrors[`dosages.${route}`])
			setFormErrors((p) => ({ ...p, [`dosages.${route}`]: "" }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const result = antibioticSchema.safeParse({ name, antibioticSpectrumId: spectrumId, category, routes, dosages });
		if (!result.success) {
			const errs: Record<string, string> = {};
			result.error.issues.forEach((issue) => { errs[issue.path.join(".")] = issue.message; });
			setFormErrors(errs);
			return;
		}
		setFormErrors({});
		const cleanDosages: Record<string, string[]> = {};
		for (const route of routes) cleanDosages[route] = dosages[route].filter((d) => d.trim() !== "");
		onSubmit({ name, antibioticSpectrumId: spectrumId, category: category as AwareCategory, dosages: cleanDosages });
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate id="antibiotic-form">
			{/* Name */}
			<div className="flex flex-col gap-2">
				<label className="text-sm font-medium">
					Tên kháng sinh <span className="text-red-500">*</span>
				</label>
				<Input
					id="antibiotic-name"
					value={name}
					onChange={(e) => { setName(e.target.value); if (formErrors.name) setFormErrors((p) => ({ ...p, name: "" })); }}
					disabled={isPending}
					placeholder="Nhập tên kháng sinh..."
					className={formErrors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
				/>
				{formErrors.name && <p className="text-sm text-red-500 font-medium">{formErrors.name}</p>}
			</div>

			{/* Spectrum */}
			<div className="flex flex-col gap-2">
				<label className="text-sm font-medium">
					Phổ kháng sinh <span className="text-red-500">*</span>
				</label>
				<select
					id="antibiotic-spectrum"
					value={spectrumId}
					onChange={(e) => { setSpectrumId(e.target.value); if (formErrors.antibioticSpectrumId) setFormErrors((p) => ({ ...p, antibioticSpectrumId: "" })); }}
					disabled={isPending}
					className={selectCls(!!formErrors.antibioticSpectrumId)}
				>
					<option value="" disabled>-- Chọn phổ kháng sinh --</option>
					{MOCK_SPECTRA.map((spec) => (
						<option key={spec.id} value={spec.id}>{spec.name}</option>
					))}
				</select>
				{formErrors.antibioticSpectrumId && <p className="text-sm text-red-500 font-medium">{formErrors.antibioticSpectrumId}</p>}
			</div>

			{/* AWaRe Category */}
			<div className="flex flex-col gap-2">
				<label className="text-sm font-medium">
					Phân loại AWaRe <span className="text-red-500">*</span>
				</label>
				<select
					id="antibiotic-category"
					value={category}
					onChange={(e) => { setCategory(e.target.value as AwareCategory); if (formErrors.category) setFormErrors((p) => ({ ...p, category: "" })); }}
					disabled={isPending}
					className={selectCls(!!formErrors.category)}
				>
					<option value="" disabled>-- Chọn phân loại --</option>
					{Object.values(AwareCategory).map((cat) => (
						<option key={cat} value={cat.toLowerCase()}>
							{cat === "AccessWatch" ? "Access-Watch" : cat}
						</option>
					))}
				</select>
				{formErrors.category && <p className="text-sm text-red-500 font-medium">{formErrors.category}</p>}
			</div>

			{/* Routes & Dosages */}
			<div className="flex flex-col gap-4">
				<div>
					<label className="text-sm font-medium">
						Đường dùng &amp; Liều lượng <span className="text-red-500">*</span>
					</label>
					{formErrors.routes && <p className="text-sm text-red-500 font-medium mt-1">{formErrors.routes}</p>}
				</div>

				{ROUTE_OPTIONS.map((route) => {
					const isChecked = routes.includes(route.value);
					const currentDosages = dosages[route.value] || [];
					const routeError = formErrors[`dosages.${route.value}`];

					return (
						<div key={route.value} className={`rounded-xl border p-4 space-y-4 shadow-sm bg-zinc-50/50 ${routeError ? "border-red-500" : ""}`}>
							<div className="flex items-center gap-3">
								<Checkbox
									id={`route-${route.value}`}
									checked={isChecked}
									onCheckedChange={(val) => handleRouteChange(route.value, !!val)}
									disabled={isPending}
								/>
								<label htmlFor={`route-${route.value}`} className="font-semibold text-sm cursor-pointer">
									{route.label}
								</label>
							</div>

							{isChecked && (
								<div className="space-y-3 pl-7">
									{currentDosages.map((dosage, index) => (
										<div key={index} className="flex items-center gap-2">
											<Input
												value={dosage}
												placeholder="Ví dụ: 500 mg mỗi 8h"
												onChange={(e) => handleDosageChange(route.value, index, e.target.value)}
												disabled={isPending}
												className={`bg-white ${routeError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
												id={`dosage-${route.value}-${index}`}
											/>
											<Button
												type="button"
												size="icon"
												variant="destructive"
												disabled={isPending}
												onClick={() => setDosages((prev) => ({ ...prev, [route.value]: prev[route.value].filter((_, i) => i !== index) }))}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									))}

									{routeError && <p className="text-sm text-red-500 font-medium">{routeError}</p>}

									<Button
										type="button"
										variant="outline"
										size="sm"
										className="gap-2 bg-white"
										disabled={isPending}
										onClick={() => {
											setDosages((prev) => ({ ...prev, [route.value]: [...(prev[route.value] || []), ""] }));
											if (routeError) setFormErrors((p) => ({ ...p, [`dosages.${route.value}`]: "" }));
										}}
										id={`add-dosage-${route.value}`}
									>
										<Plus className="h-4 w-4" /> Thêm liều
									</Button>
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* Actions */}
			<div className="flex gap-2 justify-end mt-4 pt-4 border-t">
				<Button type="button" variant="outline" onClick={onCancel} disabled={isPending} id="antibiotic-form-cancel">
					Hủy
				</Button>
				<Button type="submit" disabled={isPending} id="antibiotic-form-submit">
					{isPending ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
				</Button>
			</div>
		</form>
	);
}
