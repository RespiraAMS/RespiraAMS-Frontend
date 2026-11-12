"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Dialog } from "@/components/ui/dialog";
import { AdminDialogContent } from "@/features/admin/components/AdminDialogContent";
import { ClinicalMetricItem } from "@/features/manager/clinical-metrics/types";
import { ProtocolFormValues } from "../types";

interface ProtocolFormDialogProps {
	open: boolean;
	editingItem: ClinicalMetricItem | null;
	isSubmitting: boolean;
	onClose: () => void;
	onSubmit: (values: ProtocolFormValues) => void;
}

const EMPTY: ProtocolFormValues = {
	name: "",
	code: "",
	description: "",
	version: "1.0",
	publisher: "",
	isApplied: false,
};

export function ProtocolFormDialog({
	open,
	editingItem,
	isSubmitting,
	onClose,
	onSubmit,
}: ProtocolFormDialogProps) {
	const isEdit = !!editingItem;
	const [values, setValues] = useState<ProtocolFormValues>(EMPTY);
	const [errors, setErrors] = useState<Partial<Record<keyof ProtocolFormValues, string>>>({});
	const [touched, setTouched] = useState<Partial<Record<keyof ProtocolFormValues, boolean>>>({});

	useEffect(() => {
		if (!open) return;
		setValues(
			editingItem
				? {
						name: editingItem.name,
						code: editingItem.code,
						description: editingItem.description,
						version: editingItem.version,
						publisher: editingItem.publisher,
						isApplied: editingItem.isApplied,
				  }
				: EMPTY
		);
		setErrors({});
		setTouched({});
	}, [open, editingItem]);

	const validateField = (key: keyof ProtocolFormValues, val: any): string | null => {
		const str = typeof val === "string" ? val.trim() : "";
		switch (key) {
			case "name":
				if (!str) return "Tên phác đồ là bắt buộc.";
				return null;
			case "code":
				if (!isEdit && !str) return "Mã phác đồ là bắt buộc.";
				return null;
			case "version":
				if (!str) return "Phiên bản là bắt buộc.";
				return null;
			case "publisher":
				if (!str) return "Đơn vị ban hành là bắt buộc.";
				return null;
			case "description":
				if (!str) return "Mô tả là bắt buộc.";
				return null;
			default:
				return null;
		}
	};

	const handleBlur = (key: keyof ProtocolFormValues, val: any) => {
		setTouched((prev) => ({ ...prev, [key]: true }));
		const err = validateField(key, val);
		setErrors((prev) => {
			const next = { ...prev };
			if (err) next[key] = err;
			else delete next[key];
			return next;
		});
	};

	const set = <K extends keyof ProtocolFormValues>(key: K, value: ProtocolFormValues[K]) => {
		setValues((prev) => ({ ...prev, [key]: value }));
		if (touched[key]) {
			const err = validateField(key, value);
			setErrors((prev) => {
				const next = { ...prev };
				if (err) next[key] = err;
				else delete next[key];
				return next;
			});
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const fields: { key: keyof ProtocolFormValues; id: string }[] = [
			{ key: "name", id: "pr-name" },
			{ key: "code", id: "pr-code" },
			{ key: "version", id: "pr-version" },
			{ key: "publisher", id: "pr-publisher" },
			{ key: "description", id: "pr-desc" },
		];

		const next: typeof errors = {};
		const allTouched: typeof touched = { ...touched };
		let firstInvalidId: string | null = null;

		for (const f of fields) {
			allTouched[f.key] = true;
			const err = validateField(f.key, values[f.key]);
			if (err) {
				next[f.key] = err;
				if (!firstInvalidId) firstInvalidId = f.id;
			}
		}

		setTouched(allTouched);
		setErrors(next);

		if (firstInvalidId) {
			const targetEl = document.getElementById(firstInvalidId);
			if (targetEl) {
				targetEl.focus();
				targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
			}
			return;
		}

		onSubmit({
			name: values.name.trim(),
			code: values.code.trim(),
			description: values.description.trim(),
			version: values.version.trim(),
			publisher: values.publisher.trim(),
			isApplied: values.isApplied,
		});
	};

	const err = (key: keyof ProtocolFormValues) =>
		touched[key] &&
		errors[key] && (
			<p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
				<AlertCircle className="w-3.5 h-3.5 shrink-0" />
				<span>{errors[key]}</span>
			</p>
		);

	return (
		<Dialog open={open} onOpenChange={(o) => !o && onClose()}>
			<AdminDialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle className="text-lg font-bold text-slate-900">
						{isEdit ? "Chỉnh sửa phác đồ" : "Thêm phác đồ mới"}
					</DialogTitle>
					<DialogDescription className="text-xs text-slate-500">
						{isEdit
							? "Cập nhật nội dung hoặc đổi phiên bản. Mã phác đồ không thể thay đổi."
							: "Phác đồ mới được tạo ở trạng thái chưa áp dụng. Bạn có thể thêm quy tắc cho phác đồ ở trang quản lý của Trưởng khoa."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} noValidate className="space-y-4 pt-4">
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
						<div className="sm:col-span-2">
							<Label htmlFor="pr-name" className="text-xs font-semibold">
								Tên phác đồ <span className="text-red-500">*</span>
							</Label>
							<Input
								id="pr-name"
								value={values.name}
								onChange={(e) => set("name", e.target.value)}
								onBlur={() => handleBlur("name", values.name)}
								placeholder="CURB-65"
								className={`mt-1 h-9 text-sm ${
									touched.name && errors.name ? "border-red-400 focus-visible:ring-red-400 bg-red-50/20" : ""
								}`}
							/>
							{err("name")}
						</div>

						<div>
							<Label htmlFor="pr-code" className="text-xs font-semibold">
								Mã {!isEdit && <span className="text-red-500">*</span>}
							</Label>
							<Input
								id="pr-code"
								value={values.code}
								onChange={(e) => set("code", e.target.value)}
								onBlur={() => handleBlur("code", values.code)}
								disabled={isEdit}
								placeholder="CURB65"
								className={`mt-1 h-9 text-sm font-mono ${
									touched.code && errors.code ? "border-red-400 focus-visible:ring-red-400 bg-red-50/20" : ""
								}`}
							/>
							{err("code")}
						</div>

						<div>
							<Label htmlFor="pr-version" className="text-xs font-semibold">
								Phiên bản <span className="text-red-500">*</span>
							</Label>
							<Input
								id="pr-version"
								value={values.version}
								onChange={(e) => set("version", e.target.value)}
								onBlur={() => handleBlur("version", values.version)}
								placeholder="1.0"
								className={`mt-1 h-9 text-sm ${
									touched.version && errors.version ? "border-red-400 focus-visible:ring-red-400 bg-red-50/20" : ""
								}`}
							/>
							{err("version")}
						</div>

						<div className="sm:col-span-2">
							<Label htmlFor="pr-publisher" className="text-xs font-semibold">
								Đơn vị ban hành <span className="text-red-500">*</span>
							</Label>
							<Input
								id="pr-publisher"
								value={values.publisher}
								onChange={(e) => set("publisher", e.target.value)}
								onBlur={() => handleBlur("publisher", values.publisher)}
								placeholder="British Thoracic Society"
								className={`mt-1 h-9 text-sm ${
									touched.publisher && errors.publisher ? "border-red-400 focus-visible:ring-red-400 bg-red-50/20" : ""
								}`}
							/>
							{err("publisher")}
						</div>

						<div className="sm:col-span-3">
							<Label htmlFor="pr-desc" className="text-xs font-semibold">
								Mô tả <span className="text-red-500">*</span>
							</Label>
							<Textarea
								id="pr-desc"
								value={values.description}
								onChange={(e) => set("description", e.target.value)}
								onBlur={() => handleBlur("description", values.description)}
								rows={4}
								placeholder="Thang điểm đánh giá mức độ nặng viêm phổi cộng đồng..."
								className={`mt-1 text-sm ${
									touched.description && errors.description ? "border-red-400 focus-visible:ring-red-400 bg-red-50/20" : ""
								}`}
							/>
							{err("description")}
						</div>
					</div>

					{isEdit && (
						<label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
							<Checkbox
								checked={values.isApplied}
								onCheckedChange={(c) => set("isApplied", c === true)}
								className="mt-0.5"
							/>
							<span>
								<span className="block text-sm font-semibold text-slate-900">
									Áp dụng phác đồ này
								</span>
								<span className="block text-xs text-slate-500">
									Phác đồ đang áp dụng sẽ được dùng khi hệ thống đánh giá mức độ nặng.
								</span>
							</span>
						</label>
					)}

					<div className="flex justify-end gap-2 pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isSubmitting}
							className="h-11 px-6 text-sm font-semibold"
						>
							Hủy bỏ
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="h-11 px-6 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-sm font-semibold"
						>
							{isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
							{isEdit ? "Lưu thay đổi" : "Tạo phác đồ"}
						</Button>
					</div>
				</form>
			</AdminDialogContent>
		</Dialog>
	);
}

