"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { type PathogenItem, type CreatePathogenRequest } from "../types";

// ─── Validation Schema ────────────────────────────────────────────────────────

const pathogenSchema = z.object({
	name: z.string().trim().min(1, "Vui lòng nhập tên tác nhân gây bệnh!"),
	description: z.string().trim().min(1, "Vui lòng nhập mô tả!"),
});

// ─── Props ────────────────────────────────────────────────────────────────────

interface PathogenFormProps {
	initialData?: PathogenItem | null;
	onSubmit: (data: CreatePathogenRequest) => void;
	onCancel: () => void;
}

// ─── PathogenForm ─────────────────────────────────────────────────────────────

export function PathogenForm({ initialData, onSubmit, onCancel }: PathogenFormProps) {
	const isEdit = !!initialData;

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (initialData) {
			setName(initialData.name ?? "");
			setDescription(initialData.description ?? "");
		} else {
			setName("");
			setDescription("");
		}
		setFormErrors({});
	}, [initialData]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const formData = { name, description };
		const result = pathogenSchema.safeParse(formData);

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
		onSubmit(formData);
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
			{/* Name */}
			<div className="flex flex-col gap-2">
				<label className="text-sm font-medium">
					Tên tác nhân gây bệnh <span className="text-red-500">*</span>
				</label>
				<Input
					id="pathogen-name-input"
					value={name}
					onChange={(e) => {
						setName(e.target.value);
						if (formErrors.name) setFormErrors((p) => ({ ...p, name: "" }));
					}}
					placeholder="VD: Streptococcus pneumoniae"
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
					id="pathogen-description-input"
					value={description}
					onChange={(e) => {
						setDescription(e.target.value);
						if (formErrors.description)
							setFormErrors((p) => ({ ...p, description: "" }));
					}}
					placeholder="Nhập thông tin mô tả về tác nhân gây bệnh..."
					rows={4}
					className={
						formErrors.description ? "border-red-500 focus-visible:ring-red-500" : ""
					}
				/>
				{formErrors.description && (
					<p className="text-sm text-red-500 font-medium">{formErrors.description}</p>
				)}
			</div>

			{/* Actions */}
			<div className="flex gap-2 justify-end mt-4 pt-4 border-t">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					id="pathogen-form-cancel"
				>
					Hủy
				</Button>
				<Button type="submit" id="pathogen-form-submit">
					{isEdit ? "Cập nhật" : "Tạo mới"}
				</Button>
			</div>
		</form>
	);
}
