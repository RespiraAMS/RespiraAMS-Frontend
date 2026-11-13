"use client";

import { useEffect, useState } from "react";
import { Users, Loader2, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiGender, DisplayGender, NextOfKin, NextOfKinPayload } from "../types";
import { addNextOfKin, updateNextOfKin } from "@/features/doctor/patients/api";

interface NextOfKinDialogProps {
	patientId: string;
	patientGender?: DisplayGender | ApiGender;
	kin: NextOfKin | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export function NextOfKinDialog({
	patientId,
	patientGender,
	kin,
	open,
	onOpenChange,
	onSuccess,
}: NextOfKinDialogProps) {
	const t = useTranslations("doctor.patients");
	const isEdit = Boolean(kin);

	const isMale = patientGender === "Nam" || patientGender === "Male";
	const isFemale = patientGender === "Nữ" || patientGender === "Female";

	const presets = (() => {
		const spouse = isMale ? "Vợ" : isFemale ? "Chồng" : null;
		const list: string[] = [];
		if (spouse) {
			list.push(spouse);
		} else {
			list.push("Vợ", "Chồng");
		}
		list.push("Cha", "Mẹ", "Con", "Anh / Chị / Em", "Ông / Bà", "Người giám hộ", "Khác");
		return list;
	})();

	const quickPills = (() => {
		const spouse = isMale ? "Vợ" : isFemale ? "Chồng" : null;
		const list: string[] = [];
		if (spouse) list.push(spouse);
		list.push("Cha", "Mẹ", "Con", "Anh / Chị / Em", "Người giám hộ");
		return list;
	})();

	const [fullName, setFullName] = useState("");
	const [relationship, setRelationship] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (open) {
			if (kin) {
				setFullName(kin.fullName || "");
				setRelationship(kin.relationship || "");
				setPhoneNumber(kin.phoneNumber || "");
			} else {
				setFullName("");
				setRelationship("");
				setPhoneNumber("");
			}
			setError(null);
		}
	}, [open, kin]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		const trimmedName = fullName.trim();
		const trimmedRel = relationship.trim();
		const trimmedPhone = phoneNumber.trim();

		if (!trimmedName) {
			setError(t("kinNameRequired", { defaultMessage: "Vui lòng nhập họ và tên người thân." }));
			return;
		}
		if (!trimmedRel) {
			setError(t("kinRelationshipRequired", { defaultMessage: "Vui lòng nhập hoặc chọn quan hệ với bệnh nhân." }));
			return;
		}
		if (!trimmedPhone) {
			setError(t("kinPhoneRequired", { defaultMessage: "Vui lòng nhập số điện thoại người thân." }));
			return;
		}

		// Kiểm tra logic giới tính: Bệnh nhân Nam thì quan hệ vợ/chồng phải là Vợ, Bệnh nhân Nữ thì phải là Chồng
		const lowerRel = trimmedRel.toLowerCase();
		if (isMale && (lowerRel === "chồng" || lowerRel === "chong")) {
			setError(
				t("kinInvalidSpouseMale", {
					defaultMessage: "Bệnh nhân là Nam, mối quan hệ vợ/chồng phải là 'Vợ' (không thể là 'Chồng').",
				})
			);
			return;
		}
		if (isFemale && (lowerRel === "vợ" || lowerRel === "vo")) {
			setError(
				t("kinInvalidSpouseFemale", {
					defaultMessage: "Bệnh nhân là Nữ, mối quan hệ vợ/chồng phải là 'Chồng' (không thể là 'Vợ').",
				})
			);
			return;
		}

		const phoneRegex = /^(0|\+84)[0-9]{9}$/;
		if (!phoneRegex.test(trimmedPhone)) {
			setError(t("kinPhoneInvalid", { defaultMessage: "Số điện thoại không đúng định dạng (VD: 0912345678)." }));
			return;
		}

		const payload: NextOfKinPayload = {
			fullName: trimmedName,
			relationship: trimmedRel,
			phoneNumber: trimmedPhone,
		};

		setIsSubmitting(true);
		try {
			if (isEdit && kin) {
				await updateNextOfKin(kin.id, payload);
			} else {
				await addNextOfKin(patientId, payload);
			}
			onOpenChange(false);
			onSuccess?.();
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "";
			let friendly = "Không thể lưu thông tin người thân.";
			if (msg.includes("already registered")) {
				friendly = "Số điện thoại người thân này đã được đăng ký cho bệnh nhân.";
			} else if (msg.includes("not found")) {
				friendly = "Không tìm thấy thông tin bệnh nhân hoặc người thân.";
			} else if (msg) {
				friendly = msg;
			}
			setError(friendly);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[460px] rounded-[18px] bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
				<DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center shrink-0">
							<Users className="w-5 h-5" />
						</div>
						<div>
							<DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
								{isEdit
									? t("editNextOfKinTitle", { defaultMessage: "Chỉnh sửa người thân" })
									: t("addNextOfKinTitle", { defaultMessage: "Thêm người thân" })}
							</DialogTitle>
							<p className="text-xs text-slate-400 mt-0.5">
								{t("kinDialogSubtitle", {
									defaultMessage: "Thông tin liên hệ khẩn cấp của bệnh nhân",
								})}
							</p>
						</div>
					</div>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4 pt-2">
					{error && (
						<div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg text-red-600 dark:text-red-400 text-xs break-words">
							{error}
						</div>
					)}

					<div className="space-y-1.5">
						<Label htmlFor="kinFullName" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
							{t("kinFullName", { defaultMessage: "Họ và tên người thân" })}{" "}
							<span className="text-red-500">*</span>
						</Label>
						<Input
							id="kinFullName"
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
							placeholder={t("kinFullNamePlaceholder", { defaultMessage: "VD: Nguyễn Văn A" })}
							className="h-10 text-xs"
							disabled={isSubmitting}
							autoFocus
						/>
					</div>

					{/* Mối quan hệ: Cho phép gõ tự do hoặc chọn từ danh sách dropdown */}
					<div className="space-y-1.5">
						<Label htmlFor="kinRelationship" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
							{t("kinRelationship", { defaultMessage: "Mối quan hệ với bệnh nhân" })}{" "}
							<span className="text-red-500">*</span>
						</Label>
						<div className="relative flex items-center">
							<Input
								id="kinRelationship"
								list="kin-relationship-datalist"
								value={relationship}
								onChange={(e) => setRelationship(e.target.value)}
								placeholder={t("kinRelationshipPlaceholder", {
									defaultMessage: "Chọn từ danh sách hoặc nhập tự do...",
								})}
								className="h-10 text-xs pr-10"
								disabled={isSubmitting}
							/>
							<datalist id="kin-relationship-datalist">
								{presets.map((item) => (
									<option key={item} value={item} />
								))}
							</datalist>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										disabled={isSubmitting}
										className="absolute right-1 h-8 w-8 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
										title="Chọn mối quan hệ gợi ý"
									>
										<ChevronDown className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-48 max-h-56 overflow-y-auto">
									{presets.map((item) => (
										<DropdownMenuItem
											key={item}
											onClick={() => setRelationship(item)}
											className="text-xs cursor-pointer"
										>
											{item}
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						{/* Quick select pills */}
						<div className="flex flex-wrap gap-1.5 pt-1">
							{quickPills.map((rel) => (
								<button
									key={rel}
									type="button"
									onClick={() => setRelationship(rel)}
									disabled={isSubmitting}
									className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors border cursor-pointer ${
										relationship === rel
											? "bg-sky-100 border-sky-300 text-sky-800 dark:bg-sky-950 dark:border-sky-800 dark:text-sky-300"
											: "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
									}`}
								>
									{rel}
								</button>
							))}
						</div>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="kinPhoneNumber" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
							{t("kinPhoneNumber", { defaultMessage: "Số điện thoại liên hệ" })}{" "}
							<span className="text-red-500">*</span>
						</Label>
						<Input
							id="kinPhoneNumber"
							value={phoneNumber}
							onChange={(e) => setPhoneNumber(e.target.value)}
							placeholder={t("kinPhonePlaceholder", { defaultMessage: "VD: 0912345678" })}
							className="h-10 text-xs font-mono"
							disabled={isSubmitting}
						/>
					</div>

					<DialogFooter className="pt-3 gap-2 border-t border-slate-100 dark:border-slate-800">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
							className="h-9 px-4 text-xs font-semibold"
						>
							{t("btnCancel", { defaultMessage: "Hủy" })}
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="h-9 px-5 text-xs font-semibold bg-[#0EA5E9] hover:bg-[#0284C7] text-white"
						>
							{isSubmitting ? (
								<>
									<Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
									{t("btnSaving", { defaultMessage: "Đang lưu..." })}
								</>
							) : isEdit ? (
								t("btnUpdate", { defaultMessage: "Cập nhật" })
							) : (
								t("btnAdd", { defaultMessage: "Thêm mới" })
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
