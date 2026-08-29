"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreateFormProps {
	onSubmit: (data: { name: string; description: string }) => void;
	onCancel: () => void;
	isPending?: boolean;
}

export function CreateAntibioticSpectrumForm({
	onSubmit,
	onCancel,
	isPending = false,
}: CreateFormProps) {
	const [form, setForm] = useState({ name: "", description: "" });

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit({ ...form });
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col gap-4"
			id="create-spectrum-form"
		>
			<div className="flex flex-col gap-2">
				<Label htmlFor="create-spectrum-name">
					Tên phổ kháng sinh <span className="text-red-500">*</span>
				</Label>
				<Input
					id="create-spectrum-name"
					placeholder="Nhập tên phổ kháng sinh"
					value={form.name}
					onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
					disabled={isPending}
					required
				/>
			</div>

			<div className="flex flex-col gap-2">
				<Label htmlFor="create-spectrum-desc">
					Mô tả <span className="text-red-500">*</span>
				</Label>
				<Textarea
					id="create-spectrum-desc"
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
					id="create-spectrum-cancel"
				>
					Hủy
				</Button>
				<Button
					type="submit"
					disabled={isPending}
					id="create-spectrum-submit"
				>
					{isPending ? "Đang tạo..." : "Tạo mới"}
				</Button>
			</div>
		</form>
	);
}
