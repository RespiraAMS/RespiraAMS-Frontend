"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Upload, Check, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import {
	Dialog,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { UserDialogContent } from "./UserDialogContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	AcademicTitle,
	CreateUserPayload,
	DegreeType,
	GenderType,
	PositionType,
	UpdateUserPayload,
	UserItem,
	UserRole,
} from "../types";
import { checkDoctorDuplicates } from "../api";
import {
	CITIZEN_ID_LENGTH,
	DOCTOR_POSITIONS,
	HEAD_DEPARTMENT_POSITION,
	PHONE_MAX_LENGTH,
	sanitizeCitizenIdInput,
	sanitizePhoneInput,
} from "../utils";

interface UserFormDialogProps {
	isOpen: boolean;
	onClose: () => void;
	editingUser: UserItem | null;
	onSubmitCreate: (payload: CreateUserPayload) => Promise<void>;
	onSubmitUpdate: (payload: UpdateUserPayload) => Promise<void>;
	isSubmitting?: boolean;
	isHeadpartmentDoctor?: boolean;
}

const ALL_DEGREES: DegreeType[] = [
	"Doctor",
	"Master",
	"PhD",
	"Professor",
	"PostDoc",
	"Bachelor",
	"Associate",
	"Graduate",
	"Undergraduate",
];

export function UserFormDialog({
	isOpen,
	onClose,
	editingUser,
	onSubmitCreate,
	onSubmitUpdate,
	isSubmitting = false,
	isHeadpartmentDoctor = false
}: UserFormDialogProps) {
	const t = useTranslations("admin.users.form");
	const tCommon = useTranslations("common");
	const isEdit = !!editingUser;

	const degreeLabels = (t.raw("degrees") as Record<string, string> | undefined) ?? {};
	const positionLabels = (t.raw("positions") as Record<string, string> | undefined) ?? {};
	const academicTitleLabels =
		(t.raw("academicTitles") as Record<string, string> | undefined) ?? {};

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [phone, setPhone] = useState("");
	const [role, setRole] = useState<UserRole>("Doctor");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [gender, setGender] = useState<GenderType>("Male");
	const [citizenId, setCitizenId] = useState("");
	const [dateOfBirth, setDateOfBirth] = useState("");
	const [address, setAddress] = useState("");
	const [degrees, setDegrees] = useState<DegreeType[]>(["Doctor"]);
	const [academicTitle, setAcademicTitle] = useState<AcademicTitle>("None");
	const [position, setPosition] = useState<PositionType>("StaffDoctor");

	// Tài khoản Quản lý chuyên môn (MedicalRegulationReviewer) và Quản trị viên
	// không có hồ sơ bác sĩ.
	const isAccountOnly = role === "MedicalRegulationReviewer" || role === "Admin";

	// Chỉ bác sĩ điều trị và bác sĩ cao cấp được tạo với role Doctor; trưởng khoa
	// luôn giữ chức vụ Trưởng khoa.
	const allowedPositions: PositionType[] =
		role === "Doctor"
			? DOCTOR_POSITIONS
			: role === "HeadDepartmentDoctor"
				? [HEAD_DEPARTMENT_POSITION]
				: [];

	// Khi sửa hồ sơ cũ, giữ chức vụ hiện tại trong danh sách để không làm mất dữ liệu.
	const positionOptions =
		!isAccountOnly && position && !allowedPositions.includes(position)
			? [...allowedPositions, position]
			: allowedPositions;

	// Nhãn đầy đủ của role đang chọn, dùng cho tooltip khi nhãn bị rút gọn.
	const roleLabel: Record<UserRole, string> = {
		Doctor: t("roleDoctor"),
		HeadDepartmentDoctor: t("roleHeadDoctor"),
		MedicalRegulationReviewer: t("roleReviewer"),
		Admin: t("roleAdmin"),
	};

	// Avatar file & preview
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});
	const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
	const duplicateCheckSeq = useRef(0);
	const submitLock = useRef(false);
	const wasOpenRef = useRef(false);

	const handleRoleChange = (nextRole: UserRole) => {
		setRole(nextRole);

		if (nextRole === "HeadDepartmentDoctor") {
			setPosition(HEAD_DEPARTMENT_POSITION);
		} else if (nextRole === "Doctor") {
			setPosition((current) =>
				DOCTOR_POSITIONS.includes(current) ? current : "StaffDoctor"
			);
		} else {
			setPosition("StaffDoctor");
		}

		if (nextRole !== "MedicalRegulationReviewer") return;

		setAvatarFile(null);
		setAvatarPreview(null);
		setErrors((prev) => {
			if (!prev.avatar) return prev;
			const next = { ...prev };
			delete next.avatar;
			return next;
		});
	};

	useEffect(() => {
		if (!isOpen) {
			wasOpenRef.current = false;
			return;
		}
		if (wasOpenRef.current) return;
		wasOpenRef.current = true;

		let cancelled = false;
		void Promise.resolve().then(() => {
			if (cancelled) return;
			if (editingUser) {
				setEmail(editingUser.email || "");
				setPassword("");
				setShowPassword(false);
				setPhone(editingUser.phone || "");
				setRole(editingUser.role || "Doctor");
				setFirstName(editingUser.firstName || "");
				setLastName(editingUser.lastName || "");
				setGender(editingUser.gender || "Male");
				setCitizenId(editingUser.citizenIdentificationNumber || "");
				setDateOfBirth(
					editingUser.dateOfBirth
						? new Date(editingUser.dateOfBirth).toISOString().split("T")[0]
						: ""
				);
				setAddress(editingUser.address || "");
				setDegrees(editingUser.degrees || ["Doctor"]);
				setAcademicTitle(editingUser.academicTitle || "None");
				setPosition(editingUser.position || "StaffDoctor");
				setAvatarPreview(editingUser.avatarUrl || null);
				setAvatarFile(null);
			} else {
				setEmail("");
				setPassword("");
				setShowPassword(false);
				setPhone("");
				setRole("Doctor");
				setFirstName("");
				setLastName("");
				setGender("Male");
				setCitizenId("");
				setDateOfBirth("1988-01-01");
				setAddress("");
				setDegrees(["Doctor"]);
				setAcademicTitle("None");
				setPosition("StaffDoctor");
				setAvatarFile(null);
				setAvatarPreview(null);
			}
			setErrors({});
			setTouched({});
			setIsCheckingDuplicates(false);
			duplicateCheckSeq.current += 1;
		});

		return () => {
			cancelled = true;
		};
	}, [editingUser, isOpen]);

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
			setErrors((prev) => ({
				...prev,
				avatar: t("errors.avatarType"),
			}));
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			setErrors((prev) => ({
				...prev,
				avatar: t("errors.avatarSize"),
			}));
			return;
		}

		setAvatarFile(file);
		setAvatarPreview(URL.createObjectURL(file));
		setErrors((prev) => {
			if (!prev.avatar) return prev;
			const next = { ...prev };
			delete next.avatar;
			return next;
		});
	};

	const toggleDegree = (deg: DegreeType) => {
		setDegrees((prev) =>
			prev.includes(deg) ? prev.filter((d) => d !== deg) : [...prev, deg]
		);
	};

	const validateField = (field: string, value: string): string | null => {
		const val = (value || "").trim();
		switch (field) {
			case "email":
				if (!val) return t("errors.emailRequired");
				if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return t("errors.emailInvalid");
				return null;
			case "phone":
				if (!val) return t("errors.phoneRequired");
				if (!/^(?:0[35789]\d{8}|\+?84[35789]\d{8})$/.test(val)) {
					return t("errors.phoneInvalid");
				}
				return null;
			case "password":
				if (!isEdit && !val) return t("errors.passwordRequired");
				if (val && val.length < 6) return t("errors.passwordTooShort");
				return null;
			case "lastName":
				if (!val) return t("errors.lastNameRequired");
				return null;
			case "firstName":
				if (!val) return t("errors.firstNameRequired");
				return null;
			case "citizenId":
				const rawCccd = val.replace(/\s+/g, "");
				if (!rawCccd) return t("errors.citizenIdRequired");
				if (!/^\d{12}$/.test(rawCccd)) {
					return t("errors.citizenIdInvalid");
				}
				return null;
			case "dateOfBirth":
				if (val) {
					const d = new Date(val);
					if (isNaN(d.getTime())) return t("errors.dobInvalid");
					if (d > new Date()) return t("errors.dobFuture");
					const age = new Date().getFullYear() - d.getFullYear();
					if (age < 18) return t("errors.ageInvalid");
				}
				return null;
			case "address":
				if (!val) return t("errors.addressRequired");
				return null;
			default:
				return null;
		}
	};

	const setFieldError = (field: string, message: string | null) => {
		setErrors((prev) => {
			const next = { ...prev };
			if (message) next[field] = message;
			else delete next[field];
			return next;
		});
	};

	const runDuplicateCheck = async (values: {
		email: string;
		phone?: string;
		citizenId?: string;
	}): Promise<{ field: string; message: string } | null> => {
		if (isEdit) return null;

		const seq = duplicateCheckSeq.current + 1;
		duplicateCheckSeq.current = seq;
		setIsCheckingDuplicates(true);

		try {
			const result = await checkDoctorDuplicates({
				email: values.email,
				phone: isAccountOnly ? undefined : values.phone,
				citizenId: isAccountOnly ? undefined : values.citizenId,
			});

			if (seq !== duplicateCheckSeq.current) return null;

			if (result.emailExists) {
				return { field: "email", message: t("errors.emailDuplicate") };
			}
			if (result.citizenIdExists) {
				return { field: "citizenId", message: t("errors.citizenIdDuplicate") };
			}
			if (result.phoneExists) {
				return { field: "phone", message: t("errors.phoneDuplicate") };
			}
			return null;
		} catch (error) {
			// The backend remains the final guard if the directory lookup fails.
			console.warn("[UserFormDialog] Doctor duplicate check failed:", error);
			return null;
		} finally {
			if (seq === duplicateCheckSeq.current) setIsCheckingDuplicates(false);
		}
	};

	const handleBlur = (field: string, value: string) => {
		setTouched((prev) => ({ ...prev, [field]: true }));
		const err = validateField(field, value);
		setFieldError(field, err);

		const shouldCheckDuplicate =
			!err && !isEdit && ["email", "phone", "citizenId"].includes(field);

		if (shouldCheckDuplicate) {
			void (async () => {
				const duplicate = await runDuplicateCheck({
					email: field === "email" ? value : email,
					phone: field === "phone" ? value : phone,
					citizenId: field === "citizenId" ? value : citizenId,
				});
				if (duplicate && duplicate.field === field) {
					setFieldError(duplicate.field, duplicate.message);
				}
			})();
		}
	};

	const handleFieldChange = (
		field: string,
		value: string,
		setter: (val: string) => void
	) => {
		setter(value);
		if (touched[field]) {
			const err = validateField(field, value);
			setFieldError(field, err);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (submitLock.current || isSubmitting || isCheckingDuplicates) return;

		const profileFields = isAccountOnly
			? []
			: [
				{ name: "lastName", value: lastName, id: "usr-lname" },
				{ name: "firstName", value: firstName, id: "usr-fname" },
				{ name: "citizenId", value: citizenId, id: "usr-citizen" },
				{ name: "dateOfBirth", value: dateOfBirth, id: "usr-dob" },
				{ name: "address", value: address, id: "usr-address" },
			];

		const fieldsToValidate = [
			{ name: "email", value: email, id: "usr-email" },
			{ name: "phone", value: phone, id: "usr-phone" },
			{ name: "password", value: password, id: "usr-pass" },
			...profileFields,
		];

		const nextErr: Record<string, string> = {};
		const allTouched: Record<string, boolean> = { ...touched };
		let firstInvalidId: string | null = null;

		for (const f of fieldsToValidate) {
			allTouched[f.name] = true;
			const err = validateField(f.name, f.value);
			if (err) {
				nextErr[f.name] = err;
				if (!firstInvalidId) firstInvalidId = f.id;
			}
		}

		if (!isAccountOnly && !isEdit && !avatarFile) {
			nextErr.avatar = t("errors.avatarRequired");
			allTouched.avatar = true;
		}

		setTouched(allTouched);
		setErrors(nextErr);

		if (firstInvalidId) {
			const targetEl = document.getElementById(firstInvalidId);
			if (targetEl) {
				targetEl.focus();
				targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
			}
			return;
		}

		if (!isAccountOnly && !isEdit && !avatarFile) {
			return;
		}

		submitLock.current = true;

		try {
			const duplicate = await runDuplicateCheck({
				email,
				phone,
				citizenId,
			});
			if (duplicate) {
				setErrors((prev) => ({ ...prev, [duplicate.field]: duplicate.message }));
				setTouched((prev) => ({ ...prev, [duplicate.field]: true }));
				const targetId =
					duplicate.field === "email"
						? "usr-email"
						: duplicate.field === "citizenId"
							? "usr-citizen"
							: "usr-phone";
				document.getElementById(targetId)?.focus();
				return;
			}

			const dobIso = dateOfBirth ? new Date(dateOfBirth).toISOString() : undefined;

			if (isEdit && editingUser) {
				const payload: UpdateUserPayload = {
					accountId: editingUser.id,
					doctorId: isAccountOnly
						? "00000000-0000-0000-0000-000000000000"
						: editingUser.doctorId || editingUser.id,
					email: email.trim(),
					phone: phone.trim(),
					password: password.trim() || undefined,
					role: isAccountOnly ? editingUser.role : role,
					firstName: isAccountOnly ? "" : firstName.trim(),
					lastName: isAccountOnly ? "" : lastName.trim(),
					degrees: isAccountOnly ? [] : degrees,
					academicTitle: isAccountOnly ? "None" : academicTitle,
					position: isAccountOnly ? "StaffDoctor" : position,
					gender,
					citizenIdentificationNumber: isAccountOnly ? "" : citizenId.trim(),
					dateOfBirth: isAccountOnly ? undefined : dobIso,
					address: isAccountOnly ? "" : address.trim(),
					avatarFile: isAccountOnly ? null : avatarFile,
				};
				await onSubmitUpdate(payload);
			} else {
				const createRole: CreateUserPayload["role"] =
					role === "HeadDepartmentDoctor"
						? "HeadDepartmentDoctor"
						: role === "MedicalRegulationReviewer"
							? "MedicalRegulationReviewer"
							: "Doctor";

				const payload: CreateUserPayload = {
					email: email.trim(),
					password: password.trim(),
					phone: phone.trim(),
					role: createRole,
					firstName: isAccountOnly ? "" : firstName.trim(),
					lastName: isAccountOnly ? "" : lastName.trim(),
					degrees: isAccountOnly ? [] : degrees,
					academicTitle: isAccountOnly ? "None" : academicTitle,
					position: isAccountOnly
						? "StaffDoctor"
						: createRole === "HeadDepartmentDoctor"
							? HEAD_DEPARTMENT_POSITION
							: DOCTOR_POSITIONS.includes(position)
								? position
								: "StaffDoctor",
					gender,
					citizenIdentificationNumber: isAccountOnly ? "" : citizenId.trim(),
					dateOfBirth: isAccountOnly ? undefined : dobIso,
					address: isAccountOnly ? "" : address.trim(),
					avatarFile: isAccountOnly ? null : avatarFile,
				};
				await onSubmitCreate(payload);
			}
		} finally {
			submitLock.current = false;
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<UserDialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
						{isEdit ? t("titleEdit") : t("titleCreate")}
					</DialogTitle>
					<DialogDescription className="text-xs text-slate-500">
						{isEdit ? t("descEdit") : t("descCreate")}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} noValidate className="space-y-5 pt-2 min-w-0">
					{/* Avatar & Basic Role */}
					<div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:gap-5 dark:border-slate-800 dark:bg-slate-950/40">
						<Avatar className="h-16 w-16 border-2 border-white shadow-sm shrink-0">
							{avatarPreview ? (
								<AvatarImage src={avatarPreview} alt={firstName || "Avatar"} />
							) : (
								<AvatarFallback className="bg-sky-100 text-sky-800 font-bold text-lg">
									{firstName ? firstName[0] : "BS"}
								</AvatarFallback>
							)}
						</Avatar>

						<div className="min-w-0 space-y-1.5 sm:flex-1">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
								{t("avatarLabel")}
							</Label>
							<div className="flex items-center gap-2">
								<label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors">
									<Upload className="w-3.5 h-3.5 text-slate-500" />
									<span>{t("chooseImage")}</span>
									<input
										type="file"
										accept="image/png,image/jpeg,image/webp"
										onChange={handleAvatarChange}
										className="hidden"
									/>
								</label>
								{avatarPreview && (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => {
											setAvatarFile(null);
											setAvatarPreview(null);
										}}
										className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
									>
										{t("removeImage")}
									</Button>
								)}
							</div>
							{touched.avatar && errors.avatar && (
								<p className="text-[11px] font-semibold text-error flex items-center gap-1">
									<AlertCircle className="w-3.5 h-3.5 shrink-0" />
									<span>{errors.avatar}</span>
								</p>
							)}
						</div>

						<div className="flex shrink-0 items-center gap-3">
							<div className="w-full sm:w-44">
								<Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
									{t("roleLabel")} <span className="text-red-500">*</span>
								</Label>
								<Select
									value={role}
									onValueChange={(val: UserRole) => handleRoleChange(val)}
									disabled={isEdit || isHeadpartmentDoctor}
								>
									<SelectTrigger
										title={roleLabel[role]}
										className="mt-1 h-9 w-full min-w-0 overflow-hidden text-xs font-semibold bg-white dark:bg-slate-900 *:data-[slot=select-value]:min-w-0"
									>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Doctor">{t("roleDoctor")}</SelectItem>
										<SelectItem value="HeadDepartmentDoctor">{t("roleHeadDoctor")}</SelectItem>
										<SelectItem value="MedicalRegulationReviewer">{t("roleReviewer")}</SelectItem>
										{editingUser?.role === "Admin" && (
											<SelectItem value="Admin">{t("roleAdmin")}</SelectItem>
										)}
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>

					{/* Account Info */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
						<div>
							<Label htmlFor="usr-email" className="text-xs font-semibold">
								{t("emailLabel")} <span className="text-red-500">*</span>
							</Label>
							<Input
								id="usr-email"
								type="email"
								value={email}
								onChange={(e) => handleFieldChange("email", e.target.value, setEmail)}
								onBlur={() => handleBlur("email", email)}
								placeholder={t("emailPlaceholder")}
								className={`mt-1 h-9 text-xs ${touched.email && errors.email ? "border-red-400 focus-visible:ring-red-400 bg-red-50/20" : ""
									}`}
							/>
							{touched.email && errors.email && (
								<p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
									<AlertCircle className="w-3.5 h-3.5 shrink-0" />
									<span>{errors.email}</span>
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="usr-phone" className="text-xs font-semibold">
								{t("phoneLabel")} <span className="text-error">*</span>
							</Label>
							<Input
								id="usr-phone"
								type="tel"
								value={phone}
								onChange={(e) =>
									handleFieldChange("phone", sanitizePhoneInput(e.target.value), setPhone)
								}
								onBlur={() => handleBlur("phone", phone)}
								placeholder={t("phonePlaceholder")}
								maxLength={PHONE_MAX_LENGTH}
								inputMode="tel"
								autoComplete="tel"
								className={`mt-1 h-9 text-xs ${touched.phone && errors.phone ? "border-error focus-visible:ring-error/40 bg-error/10" : ""
									}`}
							/>
							{touched.phone && errors.phone && (
								<p className="text-[11px] font-semibold text-error mt-1 flex items-center gap-1 animate-in fade-in duration-150">
									<AlertCircle className="w-3.5 h-3.5 shrink-0" />
									<span>{errors.phone}</span>
								</p>
							)}
						</div>

						<div className="sm:col-span-2">
							<Label htmlFor="usr-pass" className="text-xs font-semibold">
								{isEdit ? t("passwordEditLabel") : t("passwordCreateLabel")}{" "}
								{!isEdit && <span className="text-error">*</span>}
							</Label>
							<div className="relative mt-1">
								<Input
									id="usr-pass"
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => handleFieldChange("password", e.target.value, setPassword)}
									onBlur={() => handleBlur("password", password)}
									placeholder={
										isEdit ? "••••••••" : t("passwordCreatePlaceholder")
									}
									className={`h-9 pr-10 text-xs ${touched.password && errors.password ? "border-error focus-visible:ring-error/40 bg-error/10" : ""
										}`}
								/>
								<button
									type="button"
									tabIndex={-1}
									onClick={() => setShowPassword((prev) => !prev)}
									disabled={isSubmitting}
									title={showPassword ? t("hidePassword") : t("showPassword")}
									aria-label={showPassword ? t("hidePassword") : t("showPassword")}
									className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-text-tertiary transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
							{touched.password && errors.password && (
								<p className="text-[11px] font-semibold text-error mt-1 flex items-center gap-1 animate-in fade-in duration-150">
									<AlertCircle className="w-3.5 h-3.5 shrink-0" />
									<span>{errors.password}</span>
								</p>
							)}
						</div>
					</div>

					{!isAccountOnly && (
						<>
							{/* Profile Info */}
							<div className="border-t border-border-default dark:border-border-default pt-4">
								<h4 className="text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-3">
									{t("personalTitle")}
								</h4>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
									<div>
										<Label htmlFor="usr-lname" className="text-xs font-semibold">
											{t("lastNameLabel")} <span className="text-error">*</span>
										</Label>
										<Input
											id="usr-lname"
											value={lastName}
											onChange={(e) => handleFieldChange("lastName", e.target.value, setLastName)}
											onBlur={() => handleBlur("lastName", lastName)}
											placeholder={t("lastNamePlaceholder")}
											className={`mt-1 h-9 text-xs ${touched.lastName && errors.lastName ? "border-error focus-visible:ring-error/40 bg-error/10" : ""
												}`}
										/>
										{touched.lastName && errors.lastName && (
											<p className="text-[11px] font-semibold text-error mt-1 flex items-center gap-1 animate-in fade-in duration-150">
												<AlertCircle className="w-3.5 h-3.5 shrink-0" />
												<span>{errors.lastName}</span>
											</p>
										)}
									</div>

									<div>
										<Label htmlFor="usr-fname" className="text-xs font-semibold">
											{t("firstNameLabel")} <span className="text-error">*</span>
										</Label>
										<Input
											id="usr-fname"
											value={firstName}
											onChange={(e) => handleFieldChange("firstName", e.target.value, setFirstName)}
											onBlur={() => handleBlur("firstName", firstName)}
											placeholder={t("firstNamePlaceholder")}
											className={`mt-1 h-9 text-xs ${touched.firstName && errors.firstName ? "border-error focus-visible:ring-error/40 bg-error/10" : ""
												}`}
										/>
										{touched.firstName && errors.firstName && (
											<p className="text-[11px] font-semibold text-error mt-1 flex items-center gap-1 animate-in fade-in duration-150">
												<AlertCircle className="w-3.5 h-3.5 shrink-0" />
												<span>{errors.firstName}</span>
											</p>
										)}
									</div>

									<div>
										<Label htmlFor="usr-citizen" className="text-xs font-semibold">
											{t("citizenIdLabel")} <span className="text-error">*</span>
										</Label>
										<Input
											id="usr-citizen"
											value={citizenId}
											onChange={(e) =>
												handleFieldChange(
													"citizenId",
													sanitizeCitizenIdInput(e.target.value),
													setCitizenId
												)
											}
											onBlur={() => handleBlur("citizenId", citizenId)}
											placeholder={t("citizenIdPlaceholder")}
											maxLength={CITIZEN_ID_LENGTH}
											inputMode="numeric"
											pattern="[0-9]*"
											autoComplete="off"
											className={`mt-1 h-9 text-xs ${touched.citizenId && errors.citizenId ? "border-error focus-visible:ring-error/40 bg-error/10" : ""
												}`}
										/>
										{touched.citizenId && errors.citizenId && (
											<p className="text-[11px] font-semibold text-error mt-1 flex items-center gap-1 animate-in fade-in duration-150">
												<AlertCircle className="w-3.5 h-3.5 shrink-0" />
												<span>{errors.citizenId}</span>
											</p>
										)}
									</div>

									<div className="grid grid-cols-2 gap-2">
										<div>
											<Label className="text-xs font-semibold">{t("genderLabel")}</Label>
											<Select
												value={gender}
												onValueChange={(val: GenderType) => setGender(val)}
											>
												<SelectTrigger className="mt-1 h-9 text-xs">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="Male">{t("male")}</SelectItem>
													<SelectItem value="Female">{t("female")}</SelectItem>
												</SelectContent>
											</Select>
										</div>

										<div>
											<Label htmlFor="usr-dob" className="text-xs font-semibold">
												{t("dobLabel")}
											</Label>
											<Input
												id="usr-dob"
												type="date"
												value={dateOfBirth}
												onChange={(e) => handleFieldChange("dateOfBirth", e.target.value, setDateOfBirth)}
												onBlur={() => handleBlur("dateOfBirth", dateOfBirth)}
												className={`mt-1 h-9 text-xs ${touched.dateOfBirth && errors.dateOfBirth ? "border-error focus-visible:ring-error/40 bg-error/10" : ""
													}`}
											/>
											{touched.dateOfBirth && errors.dateOfBirth && (
												<p className="text-[11px] font-semibold text-error mt-1 flex items-center gap-1 animate-in fade-in duration-150">
													<AlertCircle className="w-3.5 h-3.5 shrink-0" />
													<span>{errors.dateOfBirth}</span>
												</p>
											)}
										</div>
									</div>

									<div className="sm:col-span-2">
										<Label htmlFor="usr-address" className="text-xs font-semibold">
											{t("addressLabel")} <span className="text-error">*</span>
										</Label>
										<Input
											id="usr-address"
											value={address}
											onChange={(e) => handleFieldChange("address", e.target.value, setAddress)}
											onBlur={() => handleBlur("address", address)}
											placeholder={t("addressPlaceholder")}
											className={`mt-1 h-9 text-xs ${touched.address && errors.address ? "border-error focus-visible:ring-error/40 bg-error/10" : ""
												}`}
										/>
										{touched.address && errors.address && (
											<p className="text-[11px] font-semibold text-error mt-1 flex items-center gap-1 animate-in fade-in duration-150">
												<AlertCircle className="w-3.5 h-3.5 shrink-0" />
												<span>{errors.address}</span>
											</p>
										)}
									</div>
								</div>
							</div>

							{/* Medical Qualifications */}
							<div className="border-t border-border-default dark:border-border-default pt-4">
								<h4 className="text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-3">
									{t("professionalTitle")}
								</h4>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
									<div>
										<Label className="text-xs font-semibold">{t("academicTitleLabel")}</Label>
										<Select
											value={academicTitle}
											onValueChange={(val: AcademicTitle) => setAcademicTitle(val)}
										>
											<SelectTrigger className="mt-1 h-9 text-xs">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{["None", "AssociateProfessor", "Professor"].map((value) => (
													<SelectItem key={value} value={value}>
														{academicTitleLabels[value] ?? value}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label className="text-xs font-semibold">{t("positionLabel")}</Label>
										<Select
											value={position}
											onValueChange={(val: PositionType) => setPosition(val)}
											disabled={role === "HeadDepartmentDoctor"}
										>
											<SelectTrigger className="mt-1 h-9 text-xs">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{positionOptions.map((pos) => (
													<SelectItem key={pos} value={pos}>
														{positionLabels[pos] || pos}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="sm:col-span-2">
										<Label className="text-xs font-semibold mb-1.5 block">
											{t("degreesLabel")}
										</Label>
										<div className="flex flex-wrap gap-1.5">
											{ALL_DEGREES.map((deg) => {
												const selected = degrees.includes(deg);
												return (
													<button
														key={deg}
														type="button"
														onClick={() => toggleDegree(deg)}
														className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${selected
															? "bg-primary/10 text-primary border-primary/30 dark:bg-primary/10 dark:text-primary"
															: "bg-surface-secondary text-text-secondary border-border-default hover:bg-surface-secondary"
															}`}
													>
														{selected && <Check className="w-3.5 h-3.5 text-primary" />}
														<span>{degreeLabels[deg] || deg}</span>
													</button>
												);
											})}
										</div>
									</div>
								</div>
							</div>
						</>
					)}

					<DialogFooter className="pt-3 gap-2">
						{isCheckingDuplicates && (
							<span className="mr-auto inline-flex items-center gap-1.5 text-[11px] font-medium text-text-secondary">
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
								{t("checkingDuplicate")}
							</span>
						)}
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isSubmitting}
							className="h-11 px-6 text-sm font-semibold"
						>
							{tCommon("cancel")}
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting || isCheckingDuplicates}
							className="h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold"
						>
							{isSubmitting
								? t("saving")
								: isCheckingDuplicates
									? t("checkingShort")
									: isEdit
										? t("save")
										: t("create")}
						</Button>
					</DialogFooter>
				</form>
			</UserDialogContent>
		</Dialog>
	);
}
