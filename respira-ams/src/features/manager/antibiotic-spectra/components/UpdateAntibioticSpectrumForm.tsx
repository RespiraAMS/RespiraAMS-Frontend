"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { type AntibioticSpectrumItem } from "../types";

interface UpdateFormProps {
	initialValues: AntibioticSpectrumItem;
	onSubmit: (data: AntibioticSpectrumItem) => void;
	onCancel: () => void;
	isPending?: boolean;
}

export function UpdateAntibioticSpectrumForm({
	initialValues,
	onSubmit,
	onCancel,
	isPending = false,
}: UpdateFormProps) {
	const [form, setForm] = useState({
		name: initialValues.name,
		description: initialValues.description,
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit({ id: initialValues.id, ...form });
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col gap-4"
			id="update-spectrum-form"
		>
			<div className="flex flex-col gap-2">
				<label
					htmlFor="update-spectrum-name"
					className="text-sm font-medium"
				>
					Tên phổ kháng sinh <span className="text-red-500">*</span>
				</label>
				<Input
					id="update-spectrum-name"
					placeholder="Nhập tên phổ kháng sinh"
					value={form.name}
					onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
					disabled={isPending}
					required
				/>
			</div>

			<div className="flex flex-col gap-2">
				<label
					htmlFor="update-spectrum-desc"
					className="text-sm font-medium"
				>
					Mô tả <span className="text-red-500">*</span>
				</label>
				<Textarea
					id="update-spectrum-desc"
					placeholder="Nhập mô tả phổ kháng sinh"
					value={form.description}
					onChange={(e) =>
						setForm((f) => ({ ...f, description: e.target.value }))
					}
					disabled={isPending}
					required
				/>
			</div>

			<div className="flex gap-2 justify-end">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					disabled={isPending}
					id="update-spectrum-cancel"
				>
					Hủy
				</Button>
				<Button
					type="submit"
					disabled={isPending}
					id="update-spectrum-submit"
				>
					{isPending ? "Đang cập nhật..." : "Cập nhật"}
				</Button>
			</div>
		</form>
	);
}
