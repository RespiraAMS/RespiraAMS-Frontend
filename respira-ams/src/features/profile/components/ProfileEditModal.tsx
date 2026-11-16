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
import { useTranslations } from "next-intl";

import {
	ProfileFormState,
	positionOptions,
	academicTitleOptions,
	degreeOptions,
	DegreeTypeValue,
	getPositionLabel,
	getAcademicTitleLabel,
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
	const t = useTranslations("doctor.profile");

	const [activeTab, setActiveTab] = useState<
		"general" | "academic" | "security"
	>("general");
	const [avatarPreview, setAvatarPreview] = useState<string | null>(
		currentAvatarUrl || null
	);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [validationError, setValidationError] = useState<string | null>(null);

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});

	const fileInputRef = useRef<HTMLInputElement>(null);
	const fallbackChar = t("initialsFallback").charAt(0) || "B";

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
				if (!val) return t("editModal.validation.lastNameRequired");
				return null;
			case "firstName":
				if (!val) return t("editModal.validation.firstNameRequired");
				return null;
			case "phoneNumber":
				if (!val) return t("editModal.validation.phoneRequired");
				if (!/^(0|\+84|84)(3|5|7|8|9)[0-9]{8}$/.test(val)) {
					return t("editModal.validation.phoneInvalid");
				}
				return null;
			case "dateOfBirth": {
				if (!val) return t("editModal.validation.dobRequired");
				const d = new Date(val);
				if (isNaN(d.getTime())) return t("editModal.validation.dobInvalid");
				if (d > new Date()) return t("editModal.validation.dobFuture");
				const age = new Date().getFullYear() - d.getFullYear();
				if (age < 18) return t("editModal.validation.dobUnderage");
				return null;
			}
			case "citizenIdentificationCard": {
				const rawCccd = val.replace(/\s+/g, "");
				if (!rawCccd) return t("editModal.validation.cccdRequired");
				if (!/^[0-9]{9,12}$/.test(rawCccd)) {
					return t("editModal.validation.cccdInvalid");
				}
				return null;
			}
			case "address":
				if (!val) return t("editModal.validation.addressRequired");
				return null;
			case "newPassword":
				if (val && val.length < 6) {
					return t("editModal.validation.passwordMinLength");
				}
				return null;
			case "confirmPassword":
				if (form.newPassword && val !== form.newPassword) {
					return t("editModal.validation.passwordMismatch");
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
			setValidationError(t("editModal.validation.invalidImageType"));
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			setValidationError(t("editModal.validation.imageTooLarge"));
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
			{
				name: "lastName",
				value: form.lastName,
				id: "profile-last-name",
				tab: "general" as const,
			},
			{
				name: "firstName",
				value: form.firstName,
				id: "profile-first-name",
				tab: "general" as const,
			},
			{
				name: "phoneNumber",
				value: form.phoneNumber,
				id: "profile-phone",
				tab: "general" as const,
			},
			{
				name: "dateOfBirth",
				value: form.dateOfBirth,
				id: "profile-dob",
				tab: "general" as const,
			},
			{
				name: "citizenIdentificationCard",
				value: form.citizenIdentificationCard,
				id: "profile-cccd",
				tab: "general" as const,
			},
			{
				name: "address",
				value: form.address,
				id: "profile-address",
				tab: "general" as const,
			},
			{
				name: "newPassword",
				value: form.newPassword || "",
				id: "profile-new-pass",
				tab: "security" as const,
			},
			{
				name: "confirmPassword",
				value: form.confirmPassword || "",
				id: "profile-confirm-pass",
				tab: "security" as const,
			},
		];

		const newErrors: Record<string, string> = {};
		const allTouched: Record<string, boolean> = { ...touched };
		let firstInvalid: {
			id: string;
			tab: "general" | "academic" | "security";
		} | null = null;

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
			className="fixed inset-0 z-50 overflow-y-auto bg-black/50 dark:bg-black/70 backdrop-blur-xs p-4 sm:p-6 flex justify-center items-start transition-opacity animate-in fade-in-0 duration-150"
			onMouseDown={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
			role="presentation"
		>
			<div
				className="w-full max-w-2xl my-auto sm:my-8 rounded-[20px] border border-border bg-card text-card-foreground shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 outline-none"
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
			>
				{/* ── Modal Header ── */}
				<div className="flex items-center justify-between border-b border-border px-6 py-4 bg-card shrink-0">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-sky-500/15 text-sky-600 dark:text-sky-400 shrink-0 shadow-2xs">
							<User className="h-5 w-5" />
						</div>
						<div>
							<div className="flex items-center gap-2 flex-wrap">
								<h2 className="text-base font-bold text-foreground tracking-tight">
									{t("editModal.title")}
								</h2>
								<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/20">
									<span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
									<span>{t("editModal.badge")}</span>
								</span>
							</div>
							<p className="text-[11px] text-muted-foreground mt-0.5">
								{t("editModal.subtitle")}
							</p>
						</div>
					</div>

					<button
						type="button"
						onClick={onClose}
						className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
						aria-label={t("editModal.close")}
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* ── Sub Navigation Tabs ── */}
				<div className="flex items-center gap-1 overflow-x-auto border-b border-border bg-muted/50 px-6 py-2 shrink-0">
					<button
						type="button"
						onClick={() => setActiveTab("general")}
						className={`flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
							activeTab === "general"
								? "bg-card text-primary shadow-2xs border border-border"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						<User className="h-3.5 w-3.5" />
						<span>{t("editModal.tabs.general")}</span>
					</button>

					<button
						type="button"
						onClick={() => setActiveTab("academic")}
						className={`flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
							activeTab === "academic"
								? "bg-card text-primary shadow-2xs border border-border"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						<GraduationCap className="h-3.5 w-3.5" />
						<span>{t("editModal.tabs.academic")}</span>
					</button>

					<button
						type="button"
						onClick={() => setActiveTab("security")}
						className={`flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
							activeTab === "security"
								? "bg-card text-primary shadow-2xs border border-border"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						<Lock className="h-3.5 w-3.5" />
						<span>{t("editModal.tabs.security")}</span>
					</button>
				</div>

				{/* ── Validation Error Alert ── */}
				{validationError && (
					<div className="mx-6 mt-4 flex items-center gap-2 rounded-[10px] bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20">
						<ShieldAlert className="h-4 w-4 shrink-0 text-destructive" />
						<span>{validationError}</span>
					</div>
				)}

				{/* ── Form Body ── */}
				<form
					onSubmit={handleFormSubmit}
					noValidate
					className="p-6 sm:p-7 space-y-5"
				>
					{activeTab === "general" && (
						<div className="space-y-4">
							{/* Avatar Upload Banner */}
							<div className="flex items-center gap-4 p-3 rounded-[12px] bg-muted/50 border border-border">
								<div className="relative">
									<div className="h-16 w-16 rounded-full overflow-hidden bg-muted ring-2 ring-card flex items-center justify-center">
										{avatarPreview ? (
											<img
												src={avatarPreview}
												alt="Avatar preview"
												className="h-full w-full object-cover"
											/>
										) : (
											<span className="text-xl font-bold text-muted-foreground">
												{form.firstName
													? form.firstName.charAt(0).toUpperCase()
													: fallbackChar}
											</span>
										)}
									</div>
									<button
										type="button"
										onClick={() => fileInputRef.current?.click()}
										className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs hover:bg-primary/90 cursor-pointer"
										title={t("editModal.general.chooseNewAvatar")}
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
									<p className="text-xs font-bold text-foreground">
										{t("editModal.general.avatarTitle")}
									</p>
									<p className="text-[11px] text-muted-foreground mt-0.5">
										{t("editModal.general.avatarHint")}
									</p>
									<button
										type="button"
										onClick={() => fileInputRef.current?.click()}
										className="mt-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
									>
										{t("editModal.general.uploadFromComputer")}
									</button>
								</div>
							</div>

							{/* Họ và Tên */}
							<div className="grid gap-3 sm:grid-cols-2">
								<div>
									<label
										htmlFor="profile-last-name"
										className="block text-[11px] font-bold text-muted-foreground uppercase mb-1"
									>
										{t("editModal.general.lastNameLabel")}{" "}
										<span className="text-destructive">*</span>
									</label>
									<input
										id="profile-last-name"
										type="text"
										value={form.lastName}
										onChange={(e) => handleFieldChange("lastName", e)}
										onBlur={() => handleBlur("lastName", form.lastName)}
										placeholder={t("editModal.general.lastNamePlaceholder")}
										className={`h-9 w-full rounded-[8px] border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden ${
											touched.lastName && errors.lastName
												? "border-destructive focus:border-destructive bg-destructive/5"
												: "border-input focus:border-primary"
										}`}
									/>
									{touched.lastName && errors.lastName && (
										<p className="text-destructive text-[11px] font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
											<AlertCircle className="h-3 w-3 shrink-0" />
											<span>{errors.lastName}</span>
										</p>
									)}
								</div>
								<div>
									<label
										htmlFor="profile-first-name"
										className="block text-[11px] font-bold text-muted-foreground uppercase mb-1"
									>
										{t("editModal.general.firstNameLabel")}{" "}
										<span className="text-destructive">*</span>
									</label>
									<input
										id="profile-first-name"
										type="text"
										value={form.firstName}
										onChange={(e) => handleFieldChange("firstName", e)}
										onBlur={() => handleBlur("firstName", form.firstName)}
										placeholder={t("editModal.general.firstNamePlaceholder")}
										className={`h-9 w-full rounded-[8px] border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden ${
											touched.firstName && errors.firstName
												? "border-destructive focus:border-destructive bg-destructive/5"
												: "border-input focus:border-primary"
										}`}
									/>
									{touched.firstName && errors.firstName && (
										<p className="text-destructive text-[11px] font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
											<AlertCircle className="h-3 w-3 shrink-0" />
											<span>{errors.firstName}</span>
										</p>
									)}
								</div>
							</div>

							{/* Số điện thoại & Giới tính */}
							<div className="grid gap-3 sm:grid-cols-2">
								<div>
									<label
										htmlFor="profile-phone"
										className="block text-[11px] font-bold text-muted-foreground uppercase mb-1"
									>
										{t("editModal.general.phoneLabel")}{" "}
										<span className="text-destructive">*</span>
									</label>
									<input
										id="profile-phone"
										type="tel"
										value={form.phoneNumber}
										onChange={(e) => handleFieldChange("phoneNumber", e)}
										onBlur={() => handleBlur("phoneNumber", form.phoneNumber)}
										placeholder={t("editModal.general.phonePlaceholder")}
										className={`h-9 w-full rounded-[8px] border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden ${
											touched.phoneNumber && errors.phoneNumber
												? "border-destructive focus:border-destructive bg-destructive/5"
												: "border-input focus:border-primary"
										}`}
									/>
									{touched.phoneNumber && errors.phoneNumber && (
										<p className="text-destructive text-[11px] font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
											<AlertCircle className="h-3 w-3 shrink-0" />
											<span>{errors.phoneNumber}</span>
										</p>
									)}
								</div>
								<div>
									<label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">
										{t("editModal.general.genderLabel")}
									</label>
									<select
										value={form.gender ? "true" : "false"}
										onChange={onChange("gender")}
										className="h-9 w-full rounded-[8px] border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
									>
										<option value="true">{t("avatarCard.male")}</option>
										<option value="false">{t("avatarCard.female")}</option>
									</select>
								</div>
							</div>

							{/* Ngày sinh & CCCD */}
							<div className="grid gap-3 sm:grid-cols-2">
								<div>
									<label
										htmlFor="profile-dob"
										className="block text-[11px] font-bold text-muted-foreground uppercase mb-1"
									>
										{t("editModal.general.dobLabel")}{" "}
										<span className="text-destructive">*</span>
									</label>
									<input
										id="profile-dob"
										type="date"
										value={form.dateOfBirth}
										onChange={(e) => handleFieldChange("dateOfBirth", e)}
										onBlur={() => handleBlur("dateOfBirth", form.dateOfBirth)}
										className={`h-9 w-full rounded-[8px] border bg-background px-3 text-xs text-foreground dark:[color-scheme:dark] focus:outline-hidden ${
											touched.dateOfBirth && errors.dateOfBirth
												? "border-destructive focus:border-destructive bg-destructive/5"
												: "border-input focus:border-primary"
										}`}
									/>
									{touched.dateOfBirth && errors.dateOfBirth && (
										<p className="text-destructive text-[11px] font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
											<AlertCircle className="h-3 w-3 shrink-0" />
											<span>{errors.dateOfBirth}</span>
										</p>
									)}
								</div>
								<div>
									<label
										htmlFor="profile-cccd"
										className="block text-[11px] font-bold text-muted-foreground uppercase mb-1"
									>
										{t("editModal.general.cccdLabel")}{" "}
										<span className="text-destructive">*</span>
									</label>
									<input
										id="profile-cccd"
										type="text"
										value={form.citizenIdentificationCard}
										onChange={(e) =>
											handleFieldChange("citizenIdentificationCard", e)
										}
										onBlur={() =>
											handleBlur(
												"citizenIdentificationCard",
												form.citizenIdentificationCard
											)
										}
										placeholder={t("editModal.general.cccdPlaceholder")}
										maxLength={12}
										className={`h-9 w-full rounded-[8px] border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground font-mono focus:outline-hidden ${
											touched.citizenIdentificationCard &&
											errors.citizenIdentificationCard
												? "border-destructive focus:border-destructive bg-destructive/5"
												: "border-input focus:border-primary"
										}`}
									/>
									{touched.citizenIdentificationCard &&
										errors.citizenIdentificationCard && (
											<p className="text-destructive text-[11px] font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
												<AlertCircle className="h-3 w-3 shrink-0" />
												<span>{errors.citizenIdentificationCard}</span>
											</p>
										)}
								</div>
							</div>

							{/* Địa chỉ thường trú */}
							<div>
								<label
									htmlFor="profile-address"
									className="block text-[11px] font-bold text-muted-foreground uppercase mb-1"
								>
									{t("editModal.general.addressLabel")}{" "}
									<span className="text-destructive">*</span>
								</label>
								<input
									id="profile-address"
									type="text"
									value={form.address}
									onChange={(e) => handleFieldChange("address", e)}
									onBlur={() => handleBlur("address", form.address)}
									placeholder={t("editModal.general.addressPlaceholder")}
									className={`h-9 w-full rounded-[8px] border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden ${
										touched.address && errors.address
											? "border-destructive focus:border-destructive bg-destructive/5"
											: "border-input focus:border-primary"
									}`}
								/>
								{touched.address && errors.address && (
									<p className="text-destructive text-[11px] font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
										<AlertCircle className="h-3 w-3 shrink-0" />
										<span>{errors.address}</span>
									</p>
								)}
							</div>

							{/* Email readonly note */}
							<div className="rounded-[8px] bg-muted/50 border border-border p-3 text-[11.5px] text-muted-foreground flex items-center justify-between gap-2">
								<div>
									<p className="font-semibold text-foreground">
										{t("editModal.general.accountEmailTitle")}
									</p>
									<p className="text-muted-foreground">{form.email}</p>
								</div>
								<span className="text-[10px] text-muted-foreground italic text-right">
									{t("editModal.general.systemIdentityNote")}
								</span>
							</div>
						</div>
					)}

					{activeTab === "academic" && (
						<div className="space-y-4">
							{/* Chức vụ bệnh viện */}
							<div>
								<label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">
									{t("editModal.academic.positionLabel")}{" "}
									<span className="text-destructive">*</span>
								</label>
								<select
									value={form.position}
									onChange={onChange("position")}
									className="h-9 w-full rounded-[8px] border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
								>
									{positionOptions.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{getPositionLabel(opt.value, t)} ({opt.value})
										</option>
									))}
								</select>
							</div>

							{/* Học hàm */}
							<div>
								<label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">
									{t("editModal.academic.academicTitleLabel")}
								</label>
								<select
									value={form.academicTitle}
									onChange={onChange("academicTitle")}
									className="h-9 w-full rounded-[8px] border border-input bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
								>
									{academicTitleOptions.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{getAcademicTitleLabel(opt.value, t)}
										</option>
									))}
								</select>
							</div>

							{/* Danh sách Bằng cấp / Học vị (DegreeType) */}
							<div>
								<label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1.5">
									{t("editModal.academic.degreesLabel")}
								</label>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-[10px] border border-border bg-muted/40 p-3">
									{degreeOptions.map((opt) => {
										const checked = form.degrees.includes(opt.value);
										return (
											<button
												type="button"
												key={opt.value}
												onClick={() => onDegreeToggle(opt.value)}
												className={`flex items-center justify-between rounded-[8px] border px-3 py-2 text-xs font-semibold text-left transition-all cursor-pointer ${
													checked
														? "border-primary bg-primary/15 text-primary shadow-2xs"
														: "border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/25"
												}`}
											>
												<span className="truncate">
													{t(`degreeOptions.${opt.value}`)}
												</span>
												{checked && (
													<Check className="h-3.5 w-3.5 shrink-0 text-primary" />
												)}
											</button>
										);
									})}
								</div>
								<p className="mt-1 text-[11px] text-muted-foreground">
									{t("editModal.academic.degreesHint")}
								</p>
							</div>
						</div>
					)}

					{activeTab === "security" && (
						<div className="space-y-4">
							<div className="rounded-[10px] bg-sky-500/10 border border-sky-500/20 p-3 text-xs text-sky-800 dark:text-sky-200">
								<p className="font-bold flex items-center gap-1.5 text-sky-700 dark:text-sky-300">
									<Lock className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
									{t("editModal.security.bannerTitle")}
								</p>
								<p className="mt-0.5 text-[11.5px] text-sky-700/90 dark:text-sky-300/90 leading-relaxed">
									{t("editModal.security.bannerDescription")}
								</p>
							</div>

							{/* Mật khẩu mới */}
							<div>
								<label
									htmlFor="profile-new-pass"
									className="block text-[11px] font-bold text-muted-foreground uppercase mb-1"
								>
									{t("editModal.security.newPasswordLabel")}
								</label>
								<div className="relative">
									<input
										id="profile-new-pass"
										type={showNewPassword ? "text" : "password"}
										value={form.newPassword || ""}
										onChange={(e) => handleFieldChange("newPassword", e)}
										onBlur={() =>
											handleBlur("newPassword", form.newPassword || "")
										}
										placeholder={t("editModal.security.newPasswordPlaceholder")}
										className={`h-9 w-full rounded-[8px] border bg-background px-3 pr-9 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden ${
											touched.newPassword && errors.newPassword
												? "border-destructive focus:border-destructive bg-destructive/5"
												: "border-input focus:border-primary"
										}`}
									/>
									<button
										type="button"
										onClick={() => setShowNewPassword((v) => !v)}
										className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
									>
										{showNewPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
								{touched.newPassword && errors.newPassword && (
									<p className="text-destructive text-[11px] font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
										<AlertCircle className="h-3 w-3 shrink-0" />
										<span>{errors.newPassword}</span>
									</p>
								)}
							</div>

							{/* Xác nhận mật khẩu mới */}
							<div>
								<label
									htmlFor="profile-confirm-pass"
									className="block text-[11px] font-bold text-muted-foreground uppercase mb-1"
								>
									{t("editModal.security.confirmPasswordLabel")}
								</label>
								<div className="relative">
									<input
										id="profile-confirm-pass"
										type={showConfirmPassword ? "text" : "password"}
										value={form.confirmPassword || ""}
										onChange={(e) => handleFieldChange("confirmPassword", e)}
										onBlur={() =>
											handleBlur("confirmPassword", form.confirmPassword || "")
										}
										placeholder={t(
											"editModal.security.confirmPasswordPlaceholder"
										)}
										className={`h-9 w-full rounded-[8px] border bg-background px-3 pr-9 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden ${
											touched.confirmPassword && errors.confirmPassword
												? "border-destructive focus:border-destructive bg-destructive/5"
												: "border-input focus:border-primary"
										}`}
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword((v) => !v)}
										className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
									>
										{showConfirmPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
								{touched.confirmPassword && errors.confirmPassword && (
									<p className="text-destructive text-[11px] font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
										<AlertCircle className="h-3 w-3 shrink-0" />
										<span>{errors.confirmPassword}</span>
									</p>
								)}
							</div>
						</div>
					)}

					{/* ── Modal Footer Buttons ── */}
					<div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
						<button
							type="button"
							onClick={onClose}
							disabled={isSaving}
							className="h-9 px-4 rounded-[10px] border border-border bg-card text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer disabled:opacity-50"
						>
							{t("editModal.footer.cancel")}
						</button>

						<button
							type="submit"
							disabled={isSaving}
							className="h-9 px-5 rounded-[10px] bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
						>
							{isSaving ? (
								<>
									<Loader2 className="h-3.5 w-3.5 animate-spin" />
									<span>{t("editModal.footer.saving")}</span>
								</>
							) : (
								<span>{t("editModal.footer.save")}</span>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}