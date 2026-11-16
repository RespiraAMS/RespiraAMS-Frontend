"use client";

import React, { useEffect, useState } from "react";
import { Upload, X, ShieldAlert, Check, AlertCircle, Eye, EyeOff } from "lucide-react";
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
import {
	ACADEMIC_TITLE_LABELS,
	DEGREE_LABELS,
	POSITION_LABELS,
} from "../utils";

interface UserFormDialogProps {
	isOpen: boolean;
	onClose: () => void;
	editingUser: UserItem | null;
	existingUsers?: UserItem[];
	onSubmitCreate: (payload: CreateUserPayload) => Promise<void>;
	onSubmitUpdate: (payload: UpdateUserPayload) => Promise<void>;
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

function normalizeCitizenId(c?: string | null): string {
	return (c || "").replace(/\s+/g, "").trim();
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

const ALL_POSITIONS: PositionType[] = [
	"StaffDoctor",
	"SeniorDoctor",
	"DepartmentDeputyHead",
	"HeadOfDepartment",
	"DeputyDirector",
	"Director",
];

export function UserFormDialog({
	isOpen,
	onClose,
	editingUser,
	existingUsers = [],
	onSubmitCreate,
	onSubmitUpdate,
	isSubmitting = false,
}: UserFormDialogProps) {
	const isEdit = !!editingUser;

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
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

	// Avatar file & preview
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

	// Toggle ẩn/hiện mật khẩu (mặc định luôn hiện khi thêm mới theo yêu cầu)
	const [showPassword, setShowPassword] = useState(!isEdit);

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});

	// Kiểm tra trùng lặp email, sđt, cccd đối chiếu với DB đã được lược bỏ theo yêu cầu của người dùng
	const isEmailTaken = (_testEmail: string): boolean => false;
	const isPhoneTaken = (_testPhone: string): boolean => false;
	const isCitizenIdTaken = (_testCccd: string): boolean => false;

	useEffect(() => {
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
			setShowPassword(true);
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
	}, [editingUser, isOpen]);

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setAvatarFile(file);
		setAvatarPreview(URL.createObjectURL(file));
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
				if (!val) return "Email là bắt buộc.";
				if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Email không đúng định dạng.";
				if (!isEdit && isEmailTaken(val)) {
					return "Email này đã tồn tại trong danh sách bác sĩ. Vui lòng nhập email khác.";
				}
				return null;
			case "phone":
				if (!val) return "Số điện thoại là bắt buộc.";
				if (!/^(0|\+84|84)(3|5|7|8|9)[0-9]{8}$/.test(val)) {
					return "Số điện thoại không hợp lệ (10 số, bắt đầu 03, 05, 07, 08, 09).";
				}
				if (isPhoneTaken(val)) {
					return "Số điện thoại này đã tồn tại trong danh sách bác sĩ. Vui lòng nhập số khác.";
				}
				return null;
			case "password":
				if (!isEdit && !val) return "Mật khẩu khởi tạo là bắt buộc.";
				if (val && val.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự.";
				return null;
			case "lastName":
				if (!val) return "Họ và tên đệm là bắt buộc.";
				return null;
			case "firstName":
				if (!val) return "Tên là bắt buộc.";
				return null;
			case "citizenId":
				const rawCccd = val.replace(/\s+/g, "");
				if (!rawCccd) return "Số CCCD/CMND là bắt buộc.";
				if (!/^[0-9]{9,12}$/.test(rawCccd)) {
					return "Số CCCD/CMND phải gồm 9 hoặc 12 chữ số.";
				}
				if (!isEdit && isCitizenIdTaken(rawCccd)) {
					return "Số CCCD/CMND này đã được đăng ký cho bác sĩ khác trong danh sách.";
				}
				return null;
			case "dateOfBirth":
				if (val) {
					const d = new Date(val);
					if (isNaN(d.getTime())) return "Ngày sinh không hợp lệ.";
					if (d > new Date()) return "Ngày sinh không được ở tương lai.";
					const age = new Date().getFullYear() - d.getFullYear();
					if (age < 18) return "Nhân viên y tế phải từ 18 tuổi trở lên.";
				}
				return null;
			case "address":
				if (!val) return "Địa chỉ là bắt buộc.";
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
		// Với email, phone, citizenId: Luôn kiểm tra trùng lặp realtime ngay khi người dùng gõ
		if (field === "email" || field === "phone" || field === "citizenId") {
			const err = validateField(field, value);
			setTouched((prev) => ({ ...prev, [field]: true }));
			setErrors((prev) => {
				const next = { ...prev };
				if (err) next[field] = err;
				else delete next[field];
				return next;
			});
		} else if (touched[field]) {
			const err = validateField(field, value);
			setErrors((prev) => {
				const next = { ...prev };
				if (err) next[field] = err;
				else delete next[field];
				return next;
			});
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const fieldsToValidate = [
			{ name: "email", value: email, id: "usr-email" },
			{ name: "phone", value: phone, id: "usr-phone" },
			{ name: "password", value: password, id: "usr-pass" },
			{ name: "lastName", value: lastName, id: "usr-lname" },
			{ name: "firstName", value: firstName, id: "usr-fname" },
			{ name: "citizenId", value: citizenId, id: "usr-citizen" },
			{ name: "dateOfBirth", value: dateOfBirth, id: "usr-dob" },
			{ name: "address", value: address, id: "usr-address" },
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

		// Kiểm tra trùng lặp đối chiếu với danh sách bác sĩ trên giao diện
		if (!isEdit && isEmailTaken(email)) {
			nextErr.email = "Email này đã tồn tại trong danh sách bác sĩ. Vui lòng nhập email khác.";
			allTouched.email = true;
			if (!firstInvalidId) firstInvalidId = "usr-email";
		}
		if (isPhoneTaken(phone)) {
			nextErr.phone = "Số điện thoại này đã tồn tại trong danh sách bác sĩ. Vui lòng nhập số khác.";
			allTouched.phone = true;
			if (!firstInvalidId) firstInvalidId = "usr-phone";
		}
		if (!isEdit && isCitizenIdTaken(citizenId)) {
			nextErr.citizenId = "Số CCCD/CMND này đã được đăng ký cho bác sĩ khác trong danh sách.";
			allTouched.citizenId = true;
			if (!firstInvalidId) firstInvalidId = "usr-citizen";
		}

		setTouched(allTouched);
		setErrors(nextErr);

		if (firstInvalidId) {
			// Nhập sai hoặc trùng lặp: Cảnh báo ngay trên form, focus vào ô sai và không cho gửi
			const targetEl = document.getElementById(firstInvalidId);
			if (targetEl) {
				targetEl.focus();
				targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
			}
			return;
		}

		const dobIso = dateOfBirth ? new Date(dateOfBirth).toISOString() : undefined;

		if (isEdit && editingUser) {
			const payload: UpdateUserPayload = {
				accountId: editingUser.id,
				doctorId: editingUser.doctorId || editingUser.id,
				email: email.trim(),
				phone: phone.trim(),
				password: password.trim() || undefined,
				role,
				status: editingUser.status || "Active",
				firstName: firstName.trim(),
				lastName: lastName.trim(),
				degrees,
				academicTitle,
				position,
				gender,
				citizenIdentificationNumber: citizenId.trim(),
				dateOfBirth: dobIso,
				address: address.trim(),
				avatarFile,
			};
			await onSubmitUpdate(payload);
		} else {
			const payload: CreateUserPayload = {
				email: email.trim(),
				password: password.trim(),
				phone: phone.trim(),
				role,
				firstName: firstName.trim(),
				lastName: lastName.trim(),
				degrees,
				academicTitle,
				position,
				gender,
				citizenIdentificationNumber: citizenId.trim(),
				dateOfBirth: dobIso,
				address: address.trim(),
				avatarFile,
			};
			await onSubmitCreate(payload);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<UserDialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
						{isEdit ? "Cập nhật hồ sơ Bác sĩ" : "Thêm hồ sơ Bác sĩ mới"}
					</DialogTitle>
					<DialogDescription className="text-xs text-slate-500">
						{isEdit
							? "Cập nhật thông tin hồ sơ và tài khoản Bác sĩ trong cơ sở dữ liệu."
							: "Hệ thống sẽ đồng thời khởi tạo Tài khoản (Authentication), Hồ sơ Bác sĩ (Doctor), và lưu trực tiếp vào Database."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} noValidate className="space-y-5 pt-2 min-w-0">
					{/* Banner cảnh báo nếu trùng lặp */}
					{(errors.email?.includes("tồn tại") ||
						errors.phone?.includes("tồn tại") ||
						errors.citizenId?.includes("đã được đăng ký")) && (
						<div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-bold flex items-center gap-2.5 animate-in fade-in duration-200">
							<AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
							<span>Phát hiện thông tin (Email, Số điện thoại hoặc CCCD) bị trùng lặp trong hệ thống. Vui lòng sửa lại các ô được viền đỏ bên dưới để tiếp tục!</span>
						</div>
					)}

					{/* Avatar & Basic Role */}
					<div className="flex items-center gap-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
						<Avatar className="h-16 w-16 border-2 border-white shadow-sm shrink-0">
							{avatarPreview ? (
								<AvatarImage src={avatarPreview} alt="Preview" />
							) : (
								<AvatarFallback className="bg-sky-100 text-sky-800 font-bold text-lg">
									{firstName ? firstName[0] : "BS"}
								</AvatarFallback>
							)}
						</Avatar>

						<div className="flex-1 space-y-1.5">
							<Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
								Ảnh đại diện y bác sĩ (.jpg, .png, .webp)
							</Label>
							<div className="flex items-center gap-2">
								<label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors">
									<Upload className="w-3.5 h-3.5 text-slate-500" />
									<span>Chọn ảnh</span>
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
										Xóa ảnh
									</Button>
								)}
							</div>
						</div>

						<div className="flex items-start gap-3">
							<div className="flex-1">
								<Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
									Vai trò phân quyền <span className="text-red-500">*</span>
								</Label>
								{isEdit ? (
									<div className="mt-1 h-9 px-3 flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 text-xs font-semibold text-slate-800 dark:text-slate-200 select-none">
										{role === "HeadDepartmentDoctor" ? "Bác sĩ Trưởng khoa" : "Bác sĩ điều trị"}
									</div>
								) : (
									<Select
										value={role}
										onValueChange={(val: UserRole) => {
											setRole(val);
											if (val === "HeadDepartmentDoctor" && position === "StaffDoctor") {
												setPosition("HeadOfDepartment");
											} else if (val === "Doctor" && position === "HeadOfDepartment") {
												setPosition("StaffDoctor");
											}
										}}
									>
										<SelectTrigger className="mt-1 h-9 text-xs font-semibold bg-white dark:bg-slate-900">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Doctor">Bác sĩ điều trị (Doctor)</SelectItem>
											<SelectItem value="HeadDepartmentDoctor">Bác sĩ Trưởng khoa (Head Doctor)</SelectItem>
										</SelectContent>
									</Select>
								)}
							</div>
						</div>
					</div>

					{/* Account Info */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
						<div>
							<Label htmlFor="usr-email" className="text-xs font-semibold">
								Email đăng nhập <span className="text-red-500">*</span>
							</Label>
							<Input
								id="usr-email"
								type="email"
								value={email}
								disabled={isEdit}
								onChange={(e) => handleFieldChange("email", e.target.value, setEmail)}
								onBlur={() => handleBlur("email", email)}
								className={`mt-1 h-9 text-xs ${
									isEdit ? "disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed dark:disabled:bg-slate-900/80" : ""
								} ${
									errors.email ? "border-red-500 ring-1 ring-red-500 focus-visible:ring-red-500 bg-red-50/20" : ""
								}`}
							/>
							{errors.email && (
								<p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
									<AlertCircle className="w-3.5 h-3.5 shrink-0" />
									<span>{errors.email}</span>
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="usr-phone" className="text-xs font-semibold">
								Số điện thoại liên hệ <span className="text-red-500">*</span>
							</Label>
							<Input
								id="usr-phone"
								type="tel"
								value={phone}
								onChange={(e) => handleFieldChange("phone", e.target.value, setPhone)}
								onBlur={() => handleBlur("phone", phone)}
								className={`mt-1 h-9 text-xs ${
									errors.phone ? "border-red-500 ring-1 ring-red-500 focus-visible:ring-red-500 bg-red-50/20" : ""
								}`}
							/>
							{errors.phone && (
								<p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
									<AlertCircle className="w-3.5 h-3.5 shrink-0" />
									<span>{errors.phone}</span>
								</p>
							)}
						</div>

						<div className="sm:col-span-2">
							<Label htmlFor="usr-pass" className="text-xs font-semibold">
								{isEdit ? "Mật khẩu mới (bỏ trống nếu giữ nguyên)" : "Mật khẩu"} {!isEdit && <span className="text-red-500">*</span>}
							</Label>
							<div className="relative mt-1">
								<Input
									id="usr-pass"
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => handleFieldChange("password", e.target.value, setPassword)}
									onBlur={() => handleBlur("password", password)}
									className={`h-9 text-xs pr-10 ${
										touched.password && errors.password ? "border-red-400 focus-visible:ring-red-400 bg-red-50/20" : ""
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
								<p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
									<AlertCircle className="w-3.5 h-3.5 shrink-0" />
									<span>{errors.password}</span>
								</p>
							)}
						</div>
					</div>

					{/* Profile Info */}
					<div className="border-t border-slate-200 dark:border-slate-800 pt-4">
						<h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
							Thông tin cá nhân & Nhân thân
						</h4>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
							<div>
								<Label htmlFor="usr-lname" className="text-xs font-semibold">
									Họ và tên đệm <span className="text-red-500">*</span>
								</Label>
								<Input
									id="usr-lname"
									value={lastName}
									onChange={(e) => handleFieldChange("lastName", e.target.value, setLastName)}
									onBlur={() => handleBlur("lastName", lastName)}
									className={`mt-1 h-9 text-xs ${
										touched.lastName && errors.lastName ? "border-red-400 focus-visible:ring-red-400 bg-red-50/20" : ""
									}`}
								/>
								{touched.lastName && errors.lastName && (
									<p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
										<AlertCircle className="w-3.5 h-3.5 shrink-0" />
										<span>{errors.lastName}</span>
									</p>
								)}
							</div>

							<div>
								<Label htmlFor="usr-fname" className="text-xs font-semibold">
									Tên <span className="text-red-500">*</span>
								</Label>
								<Input
									id="usr-fname"
									value={firstName}
									onChange={(e) => handleFieldChange("firstName", e.target.value, setFirstName)}
									onBlur={() => handleBlur("firstName", firstName)}
									className={`mt-1 h-9 text-xs ${
										touched.firstName && errors.firstName ? "border-red-400 focus-visible:ring-red-400 bg-red-50/20" : ""
									}`}
								/>
								{touched.firstName && errors.firstName && (
									<p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
										<AlertCircle className="w-3.5 h-3.5 shrink-0" />
										<span>{errors.firstName}</span>
									</p>
								)}
							</div>

							<div>
								<Label htmlFor="usr-citizen" className="text-xs font-semibold">
									Số CCCD / CMND <span className="text-red-500">*</span>
								</Label>
								<Input
									id="usr-citizen"
									value={citizenId}
									disabled={isEdit}
									onChange={(e) => handleFieldChange("citizenId", e.target.value, setCitizenId)}
									onBlur={() => handleBlur("citizenId", citizenId)}
									className={`mt-1 h-9 text-xs ${
										isEdit ? "disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed dark:disabled:bg-slate-900/80" : ""
									} ${
										errors.citizenId ? "border-red-500 ring-1 ring-red-500 focus-visible:ring-red-500 bg-red-50/20" : ""
									}`}
								/>
								{errors.citizenId && (
									<p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
										<AlertCircle className="w-3.5 h-3.5 shrink-0" />
										<span>{errors.citizenId}</span>
									</p>
								)}
							</div>

							<div className="grid grid-cols-2 gap-2">
								<div>
									<Label className="text-xs font-semibold">Giới tính</Label>
									<Select
										value={gender}
										onValueChange={(val: GenderType) => setGender(val)}
									>
										<SelectTrigger className="mt-1 h-9 text-xs">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Male">Nam</SelectItem>
											<SelectItem value="Female">Nữ</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label htmlFor="usr-dob" className="text-xs font-semibold">
										Ngày sinh
									</Label>
									<Input
										id="usr-dob"
										type="date"
										value={dateOfBirth}
										onChange={(e) => handleFieldChange("dateOfBirth", e.target.value, setDateOfBirth)}
										onBlur={() => handleBlur("dateOfBirth", dateOfBirth)}
										className={`mt-1 h-9 text-xs ${
											touched.dateOfBirth && errors.dateOfBirth ? "border-red-400 focus-visible:ring-red-400 bg-red-50/20" : ""
										}`}
									/>
									{touched.dateOfBirth && errors.dateOfBirth && (
										<p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
											<AlertCircle className="w-3.5 h-3.5 shrink-0" />
											<span>{errors.dateOfBirth}</span>
										</p>
									)}
								</div>
							</div>

							<div className="sm:col-span-2">
								<Label htmlFor="usr-address" className="text-xs font-semibold">
									Địa chỉ nơi cư trú / Khoa phòng <span className="text-red-500">*</span>
								</Label>
								<Input
									id="usr-address"
									value={address}
									onChange={(e) => handleFieldChange("address", e.target.value, setAddress)}
									onBlur={() => handleBlur("address", address)}
									className={`mt-1 h-9 text-xs ${
										touched.address && errors.address ? "border-red-400 focus-visible:ring-red-400 bg-red-50/20" : ""
									}`}
								/>
								{touched.address && errors.address && (
									<p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1 animate-in fade-in duration-150">
										<AlertCircle className="w-3.5 h-3.5 shrink-0" />
										<span>{errors.address}</span>
									</p>
								)}
							</div>
						</div>
					</div>

					{/* Medical Qualifications */}
					<div className="border-t border-slate-200 dark:border-slate-800 pt-4">
						<h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
							Chuyên môn & Chức vụ bệnh viện
						</h4>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
							<div>
								<Label className="text-xs font-semibold">Học hàm</Label>
								<Select
									value={academicTitle}
									onValueChange={(val: AcademicTitle) => setAcademicTitle(val)}
								>
									<SelectTrigger className="mt-1 h-9 text-xs">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="None">Không</SelectItem>
										<SelectItem value="AssociateProfessor">Phó giáo sư (PGS)</SelectItem>
										<SelectItem value="Professor">Giáo sư (GS)</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label className="text-xs font-semibold">Vị trí / Chức vụ</Label>
								<Select
									value={position}
									onValueChange={(val: PositionType) => setPosition(val)}
								>
									<SelectTrigger className="mt-1 h-9 text-xs">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{ALL_POSITIONS.map((pos) => (
											<SelectItem key={pos} value={pos}>
												{POSITION_LABELS[pos] || pos}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="sm:col-span-2">
								<Label className="text-xs font-semibold mb-1.5 block">
									Học vị y khoa (Chọn một hoặc nhiều)
								</Label>
								<div className="flex flex-wrap gap-1.5">
									{ALL_DEGREES.map((deg) => {
										const selected = degrees.includes(deg);
										return (
											<button
												key={deg}
												type="button"
												onClick={() => toggleDegree(deg)}
												className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
													selected
														? "bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300"
														: "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
												}`}
											>
												{selected && <Check className="w-3.5 h-3.5 text-sky-600" />}
												<span>{DEGREE_LABELS[deg] || deg}</span>
											</button>
										);
									})}
								</div>
							</div>
						</div>
					</div>

					<DialogFooter className="pt-3 gap-2">
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
							id="btn-submit-doctor"
						>
							{isSubmitting
								? "Đang lưu..."
								: isEdit
								? "Lưu thay đổi"
								: "Thêm Bác sĩ"}
						</Button>
					</DialogFooter>
				</form>
			</UserDialogContent>
		</Dialog>
	);
}

