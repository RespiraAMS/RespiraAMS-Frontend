"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, ShieldCheck, Eye, EyeOff } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	CreateRegulationReviewPayload,
	UpdateRegulationReviewPayload,
	RegulationReviewItem,
} from "../types";

interface RegulationReviewFormDialogProps {
	isOpen: boolean;
	onClose: () => void;
	editingItem: RegulationReviewItem | null;
	existingItems?: RegulationReviewItem[];
	onSubmitCreate: (payload: CreateRegulationReviewPayload) => Promise<void>;
	onSubmitUpdate: (payload: UpdateRegulationReviewPayload) => Promise<void>;
	isSubmitting?: boolean;
}

function normalizePhone(p?: string | null): string {
	if (!p) return "";
	let cleaned = p.replace(/[^0-9]/g, "");
	if (cleaned.startsWith("84") && cleaned.length >= 11) {
		cleaned = "0" + cleaned.slice(2);
	}
	return cleaned;
}

export function RegulationReviewFormDialog({
	isOpen,
	onClose,
	editingItem,
	existingItems = [],
	onSubmitCreate,
	onSubmitUpdate,
	isSubmitting = false,
}: RegulationReviewFormDialogProps) {
	const isEdit = !!editingItem;

	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(!isEdit);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});

	useEffect(() => {
		if (editingItem) {
			setEmail(editingItem.email || "");
			setPhone(editingItem.phone || "");
			setPassword("");
			setShowPassword(false);
		} else {
			setEmail("");
			setPhone("");
			setPassword("");
			setShowPassword(true);
		}
		setErrors({});
		setTouched({});
	}, [editingItem, isOpen]);

	const validateField = (field: string, value: string): string | null => {
		const val = (value || "").trim();
		switch (field) {
			case "email":
				if (!val) return "Email là bắt buộc.";
				if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Email không đúng định dạng.";
				return null;
			case "phone":
				if (!val) return "Số điện thoại là bắt buộc.";
				if (!/^(0|\+84|84)(3|5|7|8|9)[0-9]{8}$/.test(val)) {
					return "Số điện thoại không hợp lệ (10 số, bắt đầu 03, 05, 07, 08, 09).";
				}
				return null;
			case "password":
				if (!isEdit && !val) return "Mật khẩu khởi tạo là bắt buộc.";
				if (val && val.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự.";
				return null;
			default:
				return null;
		}
	};

	const handleBlur = (field: string, value: string) => {
		setTouched((prev) => ({ ...prev, [field]: true }));
		const err = validateField(field, value);
		setErrors((prev) => {
			const next = { ...prev };
			if (err) next[field] = err;
			else delete next[field];
			return next;
		});
	};

	const handleFieldChange = (
		field: string,
		value: string,
		setter: (val: string) => void
	) => {
		setter(value);
		if (touched[field]) {
			const err = validateField(field, value);
			setErrors((prev) => {
				const next = { ...prev };
				if (err) next[field] = err;
				else delete next[field];
				return next;
			});
		}
	};

	const isEmailTaken = (e: string): boolean => {
		const norm = (e || "").trim().toLowerCase();
		if (!norm) return false;
		return existingItems.some((u) => {
			if (isEdit && editingItem && u.id === editingItem.id) return false;
			return (u.email || "").trim().toLowerCase() === norm;
		});
	};

	const isPhoneTaken = (p: string): boolean => {
		const norm = normalizePhone(p);
		if (!norm) return false;
		return existingItems.some((u) => {
			if (isEdit && editingItem && u.id === editingItem.id) return false;
			return normalizePhone(u.phone) === norm;
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const nextErr: Record<string, string> = {};
		const emailErr = validateField("email", email);
		if (emailErr) nextErr.email = emailErr;
		const phoneErr = validateField("phone", phone);
		if (phoneErr) nextErr.phone = phoneErr;
		const passErr = validateField("password", password);
		if (passErr) nextErr.password = passErr;

		if (!isEdit && isEmailTaken(email)) {
			nextErr.email = "Email này đã tồn tại trong danh sách. Vui lòng nhập email khác.";
		}
		if (isPhoneTaken(phone)) {
			nextErr.phone = "Số điện thoại này đã tồn tại trong danh sách. Vui lòng nhập số khác.";
		}

		if (Object.keys(nextErr).length > 0) {
			setErrors(nextErr);
			setTouched({ email: true, phone: true, password: true });
			return;
		}

		if (isEdit && editingItem) {
			await onSubmitUpdate({
				accountId: editingItem.id,
				email: email.trim(),
				phone: phone.trim(),
				password: password.trim() || undefined,
				status: editingItem.status || "Active",
			});
		} else {
			await onSubmitCreate({
				email: email.trim(),
				phone: phone.trim(),
				password: password.trim(),
			});
		}
	};

	const initials = (email ? email.slice(0, 2) : "HĐ").toUpperCase();

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
						{isEdit ? "Chỉnh sửa thành viên Hội đồng" : "Thêm thành viên Hội đồng thẩm định"}
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} noValidate className="space-y-4 pt-2">
					{/* Avatar card */}
					<div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
						<Avatar className="h-12 w-12 border border-sky-200 dark:border-sky-800 shrink-0">
							<AvatarFallback className="bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 font-bold text-sm">
								{initials}
							</AvatarFallback>
						</Avatar>
						<div>
							<p className="text-xs font-bold text-slate-900 dark:text-white">
								{email || "Chưa nhập email"}
							</p>
							<p className="text-[11px] text-sky-700 dark:text-sky-400 font-medium">
								Vai trò: Hội đồng thẩm định quy chế
							</p>
						</div>
					</div>

					{/* Email field */}
					<div>
						<Label htmlFor="rev-email" className="text-xs font-semibold">
							Email đăng nhập <span className="text-red-500">*</span>
						</Label>
						<Input
							id="rev-email"
							type="email"
							disabled={isEdit}
							value={email}
							onChange={(e) => handleFieldChange("email", e.target.value, setEmail)}
							onBlur={() => handleBlur("email", email)}
							className={`mt-1 h-9 text-xs ${
								isEdit ? "bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed" : ""
							} ${touched.email && errors.email ? "border-red-400 bg-red-50/20" : ""}`}
						/>
						{touched.email && errors.email && (
							<p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
								<AlertCircle className="w-3.5 h-3.5 shrink-0" />
								<span>{errors.email}</span>
							</p>
						)}
					</div>

					{/* Phone field */}
					<div>
						<Label htmlFor="rev-phone" className="text-xs font-semibold">
							Số điện thoại liên hệ <span className="text-red-500">*</span>
						</Label>
						<Input
							id="rev-phone"
							type="tel"
							value={phone}
							onChange={(e) => handleFieldChange("phone", e.target.value, setPhone)}
							onBlur={() => handleBlur("phone", phone)}
							className={`mt-1 h-9 text-xs ${
								touched.phone && errors.phone ? "border-red-400 bg-red-50/20" : ""
							}`}
						/>
						{touched.phone && errors.phone && (
							<p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
								<AlertCircle className="w-3.5 h-3.5 shrink-0" />
								<span>{errors.phone}</span>
							</p>
						)}
					</div>

					{/* Password field */}
					<div>
						<Label htmlFor="rev-pass" className="text-xs font-semibold">
							{isEdit ? "Mật khẩu mới (Bỏ trống nếu giữ nguyên)" : "Mật khẩu khởi tạo *"}
						</Label>
						<div className="relative mt-1">
							<Input
								id="rev-pass"
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => handleFieldChange("password", e.target.value, setPassword)}
								onBlur={() => handleBlur("password", password)}
								className={`h-9 text-xs pr-10 ${
									touched.password && errors.password ? "border-red-400 bg-red-50/20" : ""
								}`}
							/>
							<button
								type="button"
								onClick={() => setShowPassword((prev) => !prev)}
								className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer p-1"
								title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
							>
								{showPassword ? (
									<EyeOff className="w-4 h-4" />
								) : (
									<Eye className="w-4 h-4" />
								)}
							</button>
						</div>
						{touched.password && errors.password && (
							<p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
								<AlertCircle className="w-3.5 h-3.5 shrink-0" />
								<span>{errors.password}</span>
							</p>
						)}
					</div>

					{/* Role notice */}
					<div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800 text-[11px] leading-relaxed text-sky-800 dark:text-sky-300">
						<strong>Lưu ý nghiệp vụ:</strong> Thành viên Hội đồng thẩm định là tài khoản chuyên biệt để phê duyệt phác đồ điều trị vi sinh, đánh giá tương tác kháng sinh và quản lý quy chuẩn chuyên môn y tế.
					</div>

					<DialogFooter className="pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isSubmitting}
							className="h-9 px-4 text-xs font-semibold"
						>
							Hủy bỏ
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="h-9 px-5 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-semibold cursor-pointer"
							id="btn-submit-reviewer"
						>
							{isSubmitting
								? "Đang lưu vào DB..."
								: isEdit
								? "Lưu thay đổi"
								: "Thêm thành viên"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
