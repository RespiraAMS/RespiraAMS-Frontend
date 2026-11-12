"use client";

import { type FormEvent, useState, useRef, useEffect } from "react";
import {
	X,
	User,
	GraduationCap,
	Lock,
	Camera,
	Check,
	Loader2,
	Eye,
	EyeOff,
	ShieldAlert,
	AlertCircle,
} from "lucide-react";
import {
	ProfileFormState,
	positionOptions,
	academicTitleOptions,
	degreeOptions,
	DegreeTypeValue,
} from "../types";

interface ProfileEditModalProps {
	form: ProfileFormState;
	isSaving: boolean;
	currentAvatarUrl?: string;
	onClose: () => void;
	onChange: (
		field: keyof ProfileFormState
	) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
	onDegreeToggle: (value: DegreeTypeValue) => void;
	onAvatarSelect: (file: File) => void;
	onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export function ProfileEditModal({
	form,
	isSaving,
	currentAvatarUrl,
	onClose,
	onChange,
	onDegreeToggle,
	onAvatarSelect,
	onSubmit,
}: ProfileEditModalProps) {
	const [activeTab, setActiveTab] = useState<"general" | "academic" | "security">("general");
	const [avatarPreview, setAvatarPreview] = useState<string | null>(currentAvatarUrl || null);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [validationError, setValidationError] = useState<string | null>(null);

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});

	const fileInputRef = useRef<HTMLInputElement>(null);

	// Khóa scroll body và lắng nghe phím ESC
	useEffect(() => {
		document.body.style.overflow = "hidden";
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			document.body.style.overflow = "";
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [onClose]);

	const validateField = (field: string, value: string): string | null => {
		const val = (value || "").trim();
		switch (field) {
			case "lastName":
				if (!val) return "Vui lòng nhập họ và tên đệm của bác sĩ.";
				return null;
			case "firstName":
				if (!val) return "Vui lòng nhập tên của bác sĩ.";
				return null;
			case "phoneNumber":
				if (!val) return "Vui lòng nhập số điện thoại liên hệ.";
				if (!/^(0|\+84|84)(3|5|7|8|9)[0-9]{8}$/.test(val)) {
					return "Số điện thoại không hợp lệ (10 số, bắt đầu 03, 05, 07, 08, 09).";
				}
				return null;
			case "dateOfBirth":
				if (!val) return "Vui lòng chọn hoặc nhập ngày sinh.";
				const d = new Date(val);
				if (isNaN(d.getTime())) return "Ngày sinh không đúng định dạng.";
				if (d > new Date()) return "Ngày sinh không được ở tương lai.";
				const age = new Date().getFullYear() - d.getFullYear();
				if (age < 18) return "Bác sĩ phải từ 18 tuổi trở lên.";
				return null;
			case "citizenIdentificationCard":
				const rawCccd = val.replace(/\s+/g, "");
				if (!rawCccd) return "Vui lòng nhập số CCCD/CMND.";
				if (!/^[0-9]{9,12}$/.test(rawCccd)) {
					return "Số CCCD/CMND phải gồm 9 hoặc 12 chữ số.";
				}
				return null;
			case "address":
				if (!val) return "Vui lòng nhập địa chỉ thường trú.";
				return null;
			case "newPassword":
				if (val && val.length < 6) {
					return "Mật khẩu mới phải có ít nhất 6 ký tự.";
				}
				return null;
			case "confirmPassword":
				if (form.newPassword && val !== form.newPassword) {
					return "Xác nhận mật khẩu mới không trùng khớp.";
				}
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
		field: keyof ProfileFormState,
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		onChange(field)(e);
		if (touched[field]) {
			const err = validateField(field, e.target.value);
			setErrors((prev) => {
				const next = { ...prev };
				if (err) next[field] = err;
				else delete next[field];
				return next;
			});
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			setValidationError("Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WEBP).");
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			setValidationError("Kích thước ảnh không được vượt quá 5MB.");
			return;
		}

		setValidationError(null);
		const preview = URL.createObjectURL(file);
		setAvatarPreview(preview);
		onAvatarSelect(file);
	};

	const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setValidationError(null);

		const fieldsToValidate = [
			{ name: "lastName", value: form.lastName, id: "profile-last-name", tab: "general" as const },
			{ name: "firstName", value: form.firstName, id: "profile-first-name", tab: "general" as const },
			{ name: "phoneNumber", value: form.phoneNumber, id: "profile-phone", tab: "general" as const },
			{ name: "dateOfBirth", value: form.dateOfBirth, id: "profile-dob", tab: "general" as const },
			{ name: "citizenIdentificationCard", value: form.citizenIdentificationCard, id: "profile-cccd", tab: "general" as const },
			{ name: "address", value: form.address, id: "profile-address", tab: "general" as const },
			{ name: "newPassword", value: form.newPassword || "", id: "profile-new-pass", tab: "security" as const },
			{ name: "confirmPassword", value: form.confirmPassword || "", id: "profile-confirm-pass", tab: "security" as const },
		];

		const newErrors: Record<string, string> = {};
		const allTouched: Record<string, boolean> = { ...touched };
		let firstInvalid: { id: string; tab: "general" | "academic" | "security" } | null = null;

		for (const f of fieldsToValidate) {
			allTouched[f.name] = true;
			const err = validateField(f.name, f.value);
			if (err) {
				newErrors[f.name] = err;
				if (!firstInvalid) {
					firstInvalid = { id: f.id, tab: f.tab };
				}
			}
		}

		setTouched(allTouched);
		setErrors(newErrors);

		if (firstInvalid) {
			// Tự động chuyển về đúng tab và focus, scroll vào ô sai, không đóng modal
			setActiveTab(firstInvalid.tab);
			setTimeout(() => {
				const targetEl = document.getElementById(firstInvalid!.id);
				if (targetEl) {
					targetEl.focus();
					targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
				}
			}, 100);
			return;
		}

		onSubmit(e);
	};

	return (
		<div
			className="fixed inset-0 z-50 overflow-y-auto bg-black/45 backdrop-blur-xs p-4 sm:p-6 flex justify-center items-start transition-opacity animate-in fade-in-0 duration-150"
			onMouseDown={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
			role="presentation"
		>
			<div
				className="w-full max-w-2xl my-auto sm:my-8 rounded-[20px] border border-slate-100 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 outline-none"
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
			>
				{/* ── Modal Header (giống ảnh mẫu) ── */}
				<div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-white shrink-0">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-sky-50 text-[#0EA5E9] shrink-0 shadow-2xs">
							<User className="h-5 w-5" />
						</div>
						<div>
							<div className="flex items-center gap-2 flex-wrap">
								<h2 className="text-base font-bold text-slate-900 tracking-tight">
									Cập nhật Hồ sơ Bác sĩ
								</h2>
								<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-[#0284C7] border border-sky-200/60">
									<span className="h-1.5 w-1.5 rounded-full bg-[#0EA5E9]" />
									<span>Hồ sơ y tế</span>
								</span>
							</div>
							<p className="text-[11px] text-slate-400 mt-0.5">
								Chỉnh sửa thông tin cá nhân, học vị và thiết lập bảo mật tài khoản
							</p>
						</div>
					</div>

					<button
						type="button"
						onClick={onClose}
						className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
						aria-label="Đóng"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* ── Sub Navigation Tabs ── */}
				<div className="flex items-center gap-1 border-b border-slate-100 bg-[#F8FAFC] px-6 py-2 shrink-0">
					<button
						type="button"
						onClick={() => setActiveTab("general")}
						className={`flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all cursor-pointer ${
							activeTab === "general"
								? "bg-white text-[#0EA5E9] shadow-2xs border border-slate-200/80"
								: "text-slate-500 hover:text-slate-800"
						}`}
					>
						<User className="h-3.5 w-3.5" />
						<span>Thông tin cá nhân</span>
					</button>

					<button
						type="button"
						onClick={() => setActiveTab("academic")}
						className={`flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all cursor-pointer ${
							activeTab === "academic"
								? "bg-white text-[#0EA5E9] shadow-2xs border border-slate-200/80"
								: "text-slate-500 hover:text-slate-800"
						}`}
					>
						<GraduationCap className="h-3.5 w-3.5" />
						<span>Chuyên môn & Chức danh</span>
					</button>

					<button
						type="button"
						onClick={() => setActiveTab("security")}
						className={`flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all cursor-pointer ${
							activeTab === "security"
								? "bg-white text-[#0EA5E9] shadow-2xs border border-slate-200/80"
								: "text-slate-500 hover:text-slate-800"
						}`}
					>
						<Lock className="h-3.5 w-3.5" />
						<span>Bảo mật & Đổi mật khẩu</span>
					</button>
				</div>

				{/* ── Validation Error Alert ── */}
				{validationError && (
					<div className="mx-6 mt-4 flex items-center gap-2 rounded-[10px] bg-red-50 p-3 text-xs text-red-700 border border-red-100">
						<ShieldAlert className="h-4 w-4 shrink-0 text-red-500" />
						<span>{validationError}</span>
					</div>
				)}

				{/* ── Form Body ── */}
				<form onSubmit={handleFormSubmit} noValidate className="p-6 sm:p-7 space-y-5">
					{activeTab === "general" && (
						<div className="space-y-4">
							{/* Avatar Upload Banner */}
							<div className="flex items-center gap-4 p-3 rounded-[12px] bg-slate-50 border border-slate-100">
								<div className="relative">
									<div className="h-16 w-16 rounded-full overflow-hidden bg-slate-200 ring-2 ring-white flex items-center justify-center">
										{avatarPreview ? (
											<img
												src={avatarPreview}
												alt="Avatar preview"
												className="h-full w-full object-cover"
											/>
										) : (
											<span className="text-xl font-bold text-slate-500">
												{form.firstName ? form.firstName.charAt(0).toUpperCase() : "B"}
											</span>
										)}
									</div>
									<button
										type="button"
										onClick={() => fileInputRef.current?.click()}
										className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[#0EA5E9] text-white flex items-center justify-center shadow-xs hover:bg-[#25B4F8] cursor-pointer"
										title="Chọn ảnh mới"
									>
										<Camera className="h-3 w-3" />
									</button>
									<input
										type="file"
										ref={fileInputRef}
										onChange={handleFileChange}
										accept="image/jpeg,image/png,image/webp,image/jpg"
										className="hidden"
									/>
								</div>
								<div>
									<p className="text-xs font-bold text-slate-800">Ảnh đại diện bác sĩ</p>
									<p className="text-[11px] text-slate-500 mt-0.5">
										Hỗ trợ tệp PNG, JPG, WEBP. Dung lượng tối đa 5MB.
									</p>
									<button
										type="button"
										onClick={() => fileInputRef.current?.click()}
										className="mt-1 text-xs font-semibold text-[#0EA5E9] hover:underline cursor-pointer"
									>
										Tải ảnh mới từ máy tính
									</button>
								</div>
							</div>

							{/* Họ và Tên */}
							<div className="grid gap-3 sm:grid-cols-2">
								<div>
									<label htmlFor="profile-last-name" className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
										Họ &amp; Tên đệm <span className="text-red-500">*</span>
									</label>
									<input
										id="profile-last-name"
										type="text"
										value={form.lastName}
										onChange={(e) => handleFieldChange("lastName", e)}
										onBlur={() => handleBlur("lastName", form.lastName)}
										placeholder="Ví dụ: Lê Hoàng"
										className={`h-9 w-full rounded-[8px] border bg-white px-3 text-xs text-slate-900 focus:outline-hidden ${
											touched.lastName && errors.lastName
												? "border-red-400 focus:border-red-500 bg-red-50/20"
												: "border-slate-200 focus:border-[#0EA5E9]"
										}`}
									/>
									{touched.lastName && errors.lastName && (
										<p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
											<AlertCircle className="h-3 w-3 shrink-0" />
											<span>{errors.lastName}</span>
										</p>
									)}
								</div>
								<div>
									<label htmlFor="profile-first-name" className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
										Tên <span className="text-red-500">*</span>
									</label>
									<input
										id="profile-first-name"
										type="text"
										value={form.firstName}
										onChange={(e) => handleFieldChange("firstName", e)}
										onBlur={() => handleBlur("firstName", form.firstName)}
										placeholder="Ví dụ: Minh"
										className={`h-9 w-full rounded-[8px] border bg-white px-3 text-xs text-slate-900 focus:outline-hidden ${
											touched.firstName && errors.firstName
												? "border-red-400 focus:border-red-500 bg-red-50/20"
												: "border-slate-200 focus:border-[#0EA5E9]"
										}`}
									/>
									{touched.firstName && errors.firstName && (
										<p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
											<AlertCircle className="h-3 w-3 shrink-0" />
											<span>{errors.firstName}</span>
										</p>
									)}
								</div>
							</div>

							{/* Số điện thoại & Giới tính */}
							<div className="grid gap-3 sm:grid-cols-2">
								<div>
									<label htmlFor="profile-phone" className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
										Số điện thoại liên hệ <span className="text-red-500">*</span>
									</label>
									<input
										id="profile-phone"
										type="tel"
										value={form.phoneNumber}
										onChange={(e) => handleFieldChange("phoneNumber", e)}
										onBlur={() => handleBlur("phoneNumber", form.phoneNumber)}
										placeholder="Ví dụ: 0901234567"
										className={`h-9 w-full rounded-[8px] border bg-white px-3 text-xs text-slate-900 focus:outline-hidden ${
											touched.phoneNumber && errors.phoneNumber
												? "border-red-400 focus:border-red-500 bg-red-50/20"
												: "border-slate-200 focus:border-[#0EA5E9]"
										}`}
									/>
									{touched.phoneNumber && errors.phoneNumber && (
										<p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
											<AlertCircle className="h-3 w-3 shrink-0" />
											<span>{errors.phoneNumber}</span>
										</p>
									)}
								</div>
								<div>
									<label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
										Giới tính
									</label>
									<select
										value={form.gender ? "true" : "false"}
										onChange={onChange("gender")}
										className="h-9 w-full rounded-[8px] border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-[#0EA5E9] focus:outline-hidden"
									>
										<option value="true">Nam</option>
										<option value="false">Nữ</option>
									</select>
								</div>
							</div>

							{/* Ngày sinh & CCCD */}
							<div className="grid gap-3 sm:grid-cols-2">
								<div>
									<label htmlFor="profile-dob" className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
										Ngày sinh <span className="text-red-500">*</span>
									</label>
									<input
										id="profile-dob"
										type="date"
										value={form.dateOfBirth}
										onChange={(e) => handleFieldChange("dateOfBirth", e)}
										onBlur={() => handleBlur("dateOfBirth", form.dateOfBirth)}
										className={`h-9 w-full rounded-[8px] border bg-white px-3 text-xs text-slate-900 focus:outline-hidden ${
											touched.dateOfBirth && errors.dateOfBirth
												? "border-red-400 focus:border-red-500 bg-red-50/20"
												: "border-slate-200 focus:border-[#0EA5E9]"
										}`}
									/>
									{touched.dateOfBirth && errors.dateOfBirth && (
										<p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
											<AlertCircle className="h-3 w-3 shrink-0" />
											<span>{errors.dateOfBirth}</span>
										</p>
									)}
								</div>
								<div>
									<label htmlFor="profile-cccd" className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
										Số CCCD/CMND <span className="text-red-500">*</span>
									</label>
									<input
										id="profile-cccd"
										type="text"
										value={form.citizenIdentificationCard}
										onChange={(e) => handleFieldChange("citizenIdentificationCard", e)}
										onBlur={() => handleBlur("citizenIdentificationCard", form.citizenIdentificationCard)}
										placeholder="12 chữ số"
										maxLength={12}
										className={`h-9 w-full rounded-[8px] border bg-white px-3 text-xs text-slate-900 font-mono focus:outline-hidden ${
											touched.citizenIdentificationCard && errors.citizenIdentificationCard
												? "border-red-400 focus:border-red-500 bg-red-50/20"
												: "border-slate-200 focus:border-[#0EA5E9]"
										}`}
									/>
									{touched.citizenIdentificationCard && errors.citizenIdentificationCard && (
										<p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
											<AlertCircle className="h-3 w-3 shrink-0" />
											<span>{errors.citizenIdentificationCard}</span>
										</p>
									)}
								</div>
							</div>

							{/* Địa chỉ thường trú */}
							<div>
								<label htmlFor="profile-address" className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
									Địa chỉ thường trú <span className="text-red-500">*</span>
								</label>
								<input
									id="profile-address"
									type="text"
									value={form.address}
									onChange={(e) => handleFieldChange("address", e)}
									onBlur={() => handleBlur("address", form.address)}
									placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
									className={`h-9 w-full rounded-[8px] border bg-white px-3 text-xs text-slate-900 focus:outline-hidden ${
										touched.address && errors.address
											? "border-red-400 focus:border-red-500 bg-red-50/20"
											: "border-slate-200 focus:border-[#0EA5E9]"
									}`}
								/>
								{touched.address && errors.address && (
									<p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
										<AlertCircle className="h-3 w-3 shrink-0" />
										<span>{errors.address}</span>
									</p>
								)}
							</div>

							{/* Email readonly note */}
							<div className="rounded-[8px] bg-slate-50 border border-slate-200/80 p-3 text-[11.5px] text-slate-600 flex items-center justify-between">
								<div>
									<p className="font-semibold text-slate-800">Email tài khoản:</p>
									<p className="text-slate-500">{form.email}</p>
								</div>
								<span className="text-[10px] text-slate-400 italic">
									Tài khoản định danh hệ thống
								</span>
							</div>
						</div>
					)}

					{activeTab === "academic" && (
						<div className="space-y-4">
							{/* Chức vụ bệnh viện */}
							<div>
								<label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
									Chức vụ bệnh viện <span className="text-red-500">*</span>
								</label>
								<select
									value={form.position}
									onChange={onChange("position")}
									className="h-9 w-full rounded-[8px] border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-[#0EA5E9] focus:outline-hidden"
								>
									{positionOptions.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{opt.label} ({opt.value})
										</option>
									))}
								</select>
							</div>

							{/* Học hàm */}
							<div>
								<label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
									Học hàm khoa học
								</label>
								<select
									value={form.academicTitle}
									onChange={onChange("academicTitle")}
									className="h-9 w-full rounded-[8px] border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-[#0EA5E9] focus:outline-hidden"
								>
									{academicTitleOptions.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</select>
							</div>

							{/* Danh sách Bằng cấp / Học vị (DegreeType) */}
							<div>
								<label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5">
									Học vị &amp; Văn bằng y khoa đã cấp
								</label>
								<div className="grid grid-cols-2 gap-2 rounded-[10px] border border-slate-200 bg-slate-50/50 p-3">
									{degreeOptions.map((opt) => {
										const checked = form.degrees.includes(opt.value);
										return (
											<button
												type="button"
												key={opt.value}
												onClick={() => onDegreeToggle(opt.value)}
												className={`flex items-center justify-between rounded-[8px] border px-3 py-2 text-xs font-semibold text-left transition-all cursor-pointer ${
													checked
														? "border-[#0EA5E9] bg-[#E0F2FE] text-[#0369A1] shadow-2xs"
														: "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
												}`}
											>
												<span className="truncate">{opt.label}</span>
												{checked && <Check className="h-3.5 w-3.5 shrink-0 text-[#0EA5E9]" />}
											</button>
										);
									})}
								</div>
								<p className="mt-1 text-[11px] text-slate-400">
									Bác sĩ có thể chọn nhiều văn bằng hoặc học vị y khoa phù hợp.
								</p>
							</div>
						</div>
					)}

					{activeTab === "security" && (
						<div className="space-y-4">
							<div className="rounded-[10px] bg-sky-50 border border-sky-100 p-3 text-xs text-sky-800">
								<p className="font-bold flex items-center gap-1.5">
									<Lock className="h-3.5 w-3.5 text-sky-600" />
									Đổi mật khẩu tài khoản bác sĩ
								</p>
								<p className="mt-0.5 text-[11.5px] text-sky-700 leading-relaxed">
									Để giữ nguyên mật khẩu hiện tại, vui lòng để trống hai ô mật khẩu dưới đây.
								</p>
							</div>

							{/* Mật khẩu mới */}
							<div>
								<label htmlFor="profile-new-pass" className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
									Mật khẩu mới
								</label>
								<div className="relative">
									<input
										id="profile-new-pass"
										type={showNewPassword ? "text" : "password"}
										value={form.newPassword || ""}
										onChange={(e) => handleFieldChange("newPassword", e)}
										onBlur={() => handleBlur("newPassword", form.newPassword || "")}
										placeholder="Nhập ít nhất 6 ký tự..."
										className={`h-9 w-full rounded-[8px] border bg-white px-3 pr-9 text-xs text-slate-900 focus:outline-hidden ${
											touched.newPassword && errors.newPassword
												? "border-red-400 focus:border-red-500 bg-red-50/20"
												: "border-slate-200 focus:border-[#0EA5E9]"
										}`}
									/>
									<button
										type="button"
										onClick={() => setShowNewPassword((v) => !v)}
										className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
									>
										{showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
									</button>
								</div>
								{touched.newPassword && errors.newPassword && (
									<p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
										<AlertCircle className="h-3 w-3 shrink-0" />
										<span>{errors.newPassword}</span>
									</p>
								)}
							</div>

							{/* Xác nhận mật khẩu mới */}
							<div>
								<label htmlFor="profile-confirm-pass" className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
									Xác nhận mật khẩu mới
								</label>
								<div className="relative">
									<input
										id="profile-confirm-pass"
										type={showConfirmPassword ? "text" : "password"}
										value={form.confirmPassword || ""}
										onChange={(e) => handleFieldChange("confirmPassword", e)}
										onBlur={() => handleBlur("confirmPassword", form.confirmPassword || "")}
										placeholder="Nhập lại mật khẩu mới..."
										className={`h-9 w-full rounded-[8px] border bg-white px-3 pr-9 text-xs text-slate-900 focus:outline-hidden ${
											touched.confirmPassword && errors.confirmPassword
												? "border-red-400 focus:border-red-500 bg-red-50/20"
												: "border-slate-200 focus:border-[#0EA5E9]"
										}`}
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword((v) => !v)}
										className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
									>
										{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
									</button>
								</div>
								{touched.confirmPassword && errors.confirmPassword && (
									<p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
										<AlertCircle className="h-3 w-3 shrink-0" />
										<span>{errors.confirmPassword}</span>
									</p>
								)}
							</div>
						</div>
					)}

					{/* ── Modal Footer Buttons ── */}
					<div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
						<button
							type="button"
							onClick={onClose}
							disabled={isSaving}
							className="h-9 px-4 rounded-[10px] border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
						>
							Hủy bỏ
						</button>

						<button
							type="submit"
							disabled={isSaving}
							className="h-9 px-5 rounded-[10px] bg-[#0EA5E9] hover:bg-[#25B4F8] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
						>
							{isSaving ? (
								<>
									<Loader2 className="h-3.5 w-3.5 animate-spin" />
									<span>Đang lưu thông tin...</span>
								</>
							) : (
								<span>Lưu thay đổi</span>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
