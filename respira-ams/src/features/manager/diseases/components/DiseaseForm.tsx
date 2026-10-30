"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { type DiseaseItem, type CreateDiseaseRequest } from "../types";

// ─── Schema ───────────────────────────────────────────────────────────────────

const diseaseSchema = z.object({
	name: z.string().trim().min(1, "Vui lòng nhập tên bệnh!"),
	description: z.string().trim().min(5, "Mô tả phải có ít nhất 5 ký tự!"),
	requiredIcuMainCriteria: z.coerce
		.number()
		.min(1, "Phải lớn hơn 0"),
	requiredIcuSecondaryCriteria: z.coerce
		.number()
		.min(1, "Phải lớn hơn 0"),
});

// ─── Props ────────────────────────────────────────────────────────────────────

interface DiseaseFormProps {
	initialData?: DiseaseItem | null;
	onSubmit: (data: CreateDiseaseRequest) => void;
	onCancel: () => void;
}

// ─── DiseaseForm ──────────────────────────────────────────────────────────────

export function DiseaseForm({ initialData, onSubmit, onCancel }: DiseaseFormProps) {
	const isEdit = !!initialData;

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [requiredIcuMainCriteria, setRequiredIcuMainCriteria] = useState("1");
	const [requiredIcuSecondaryCriteria, setRequiredIcuSecondaryCriteria] = useState("1");
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (initialData) {
			setName(initialData.name ?? "");
			setDescription(initialData.description ?? "");
			setRequiredIcuMainCriteria(String(initialData.requiredIcuMainCriteria ?? 1));
			setRequiredIcuSecondaryCriteria(String(initialData.requiredIcuSecondaryCriteria ?? 1));
		} else {
			setName("");
			setDescription("");
			setRequiredIcuMainCriteria("1");
			setRequiredIcuSecondaryCriteria("1");
		}
		setFormErrors({});
	}, [initialData]);

	const clearError = (field: string) =>
		setFormErrors((p) => ({ ...p, [field]: "" }));

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const result = diseaseSchema.safeParse({
			name,
			description,
			requiredIcuMainCriteria,
			requiredIcuSecondaryCriteria,
		});

		if (!result.success) {
			const errs: Record<string, string> = {};
			result.error.issues.forEach((issue) => {
				const key = issue.path[0];
				if (typeof key === "string") errs[key] = issue.message;
			});
			setFormErrors(errs);
			return;
		}

		setFormErrors({});
		onSubmit(result.data);
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
			{/* Name */}
			<div className="flex flex-col gap-2">
				<label className="text-sm font-medium">
					Tên bệnh <span className="text-red-500">*</span>
				</label>
				<Input
					id="disease-name-input"
					value={name}
					onChange={(e) => { setName(e.target.value); clearError("name"); }}
					placeholder="VD: Viêm phổi cộng đồng (CAP)"
					className={formErrors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
				/>
				{formErrors.name && (
					<p className="text-sm text-red-500 font-medium">{formErrors.name}</p>
				)}
			</div>

			{/* Description */}
			<div className="flex flex-col gap-2">
				<label className="text-sm font-medium">
					Mô tả <span className="text-red-500">*</span>
				</label>
				<Textarea
					id="disease-description-input"
					value={description}
					onChange={(e) => { setDescription(e.target.value); clearError("description"); }}
					placeholder="Nhập thông tin mô tả về bệnh..."
					rows={4}
					className={formErrors.description ? "border-red-500 focus-visible:ring-red-500" : ""}
				/>
				{formErrors.description && (
					<p className="text-sm text-red-500 font-medium">{formErrors.description}</p>
				)}
			</div>

			{/* ICU Criteria */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="flex flex-col gap-2 flex-1">
					<label className="text-sm font-medium">
						Tiêu chí ICU chính <span className="text-red-500">*</span>
					</label>
					<Input
						id="disease-icu-main-input"
						type="number"
						min="1"
						value={requiredIcuMainCriteria}
						onChange={(e) => { setRequiredIcuMainCriteria(e.target.value); clearError("requiredIcuMainCriteria"); }}
						className={formErrors.requiredIcuMainCriteria ? "border-red-500 focus-visible:ring-red-500" : ""}
					/>
					{formErrors.requiredIcuMainCriteria && (
						<p className="text-sm text-red-500 font-medium">{formErrors.requiredIcuMainCriteria}</p>
					)}
				</div>

				<div className="flex flex-col gap-2 flex-1">
					<label className="text-sm font-medium">
						Tiêu chí ICU phụ <span className="text-red-500">*</span>
					</label>
					<Input
						id="disease-icu-secondary-input"
						type="number"
						min="1"
						value={requiredIcuSecondaryCriteria}
						onChange={(e) => { setRequiredIcuSecondaryCriteria(e.target.value); clearError("requiredIcuSecondaryCriteria"); }}
						className={formErrors.requiredIcuSecondaryCriteria ? "border-red-500 focus-visible:ring-red-500" : ""}
					/>
					{formErrors.requiredIcuSecondaryCriteria && (
						<p className="text-sm text-red-500 font-medium">{formErrors.requiredIcuSecondaryCriteria}</p>
					)}
				</div>
			</div>

			{/* Actions */}
			<div className="flex gap-2 justify-end mt-4 pt-4 border-t">
				<Button type="button" variant="outline" onClick={onCancel} id="disease-form-cancel">
					Hủy
				</Button>
				<Button type="submit" id="disease-form-submit">
					{isEdit ? "Cập nhật" : "Tạo mới"}
				</Button>
			</div>
		</form>
	);
}
