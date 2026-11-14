"use client";

import React, { useEffect, useState } from "react";
import { Upload, X, ShieldAlert, Check, AlertCircle } from "lucide-react";
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
	UserStatus,
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
	onSubmitCreate: (payload: CreateUserPayload) => Promise<void>;
	onSubmitUpdate: (payload: UpdateUserPayload) => Promise<void>;
	isSubmitting?: boolean;
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
	onSubmitCreate,
	onSubmitUpdate,
	isSubmitting = false,
}: UserFormDialogProps) {
	const isEdit = !!editingUser;

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [phone, setPhone] = useState("");
	const [role, setRole] = useState<UserRole>("Doctor");
	const [status, setStatus] = useState<UserStatus>("Active");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [gender, setGender] = useState<GenderType>("Male");
	const [citizenId, setCitizenId] = useState("");
	const [dateOfBirth, setDateOfBirth] = useState("");
	const [address, setAddress] = useState("");
	const [degrees, setDegrees] = useState<DegreeType[]>(["Doctor"]);
	const [academicTitle, setAcademicTitle] = useState<AcademicTitle>("None");
	const [position, setPosition] = useState<PositionType>("StaffDoctor");

	// Tài khoản Quản lý chuyên môn (MedicalRegulationReviewer) không có hồ sơ bác sĩ.
	const isAccountOnly = role === "Manager";

	// Avatar file & preview
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});

	const handleRoleChange = (nextRole: UserRole) => {
		setRole(nextRole);
		if (nextRole !== "Manager") return;

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
		if (editingUser) {
			setEmail(editingUser.email || "");
			setPassword("");
			setPhone(editingUser.phone || "");
			setRole(editingUser.role || "Doctor");
			setStatus(editingUser.status || "Active");
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
			setPassword("Respira@123");
			setPhone("");
			setRole("Doctor");
			setStatus("Active");
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

		if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
			setErrors((prev) => ({
				...prev,
				avatar: "Ảnh đại diện phải là tệp .jpg, .jpeg, .png hoặc .webp.",
			}));
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			setErrors((prev) => ({
				...prev,
				avatar: "Ảnh đại diện phải có dung lượng tối đa 5MB.",
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

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
			nextErr.avatar = "Ảnh đại diện là bắt buộc với tài khoản bác sĩ.";
			allTouched.avatar = true;
		}

		setTouched(allTouched);
		setErrors(nextErr);

		if (firstInvalidId) {
			// Nhập sai format: Báo ngay, không out ra ngoài mà cuộn và focus ngay vào ô sai!
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

		const dobIso = dateOfBirth ? new Date(dateOfBirth).toISOString() : undefined;

		if (isEdit && editingUser) {
			const payload: UpdateUserPayload = {
				accountId: editingUser.id,
				doctorId: editingUser.doctorId || editingUser.id,
				email: email.trim(),
				phone: phone.trim(),
				password: password.trim() || undefined,
				role: isAccountOnly ? "Manager" : role,
				status,
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
					: role === "Manager"
						? "Manager"
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
				position: isAccountOnly ? "StaffDoctor" : position,
				gender,
				citizenIdentificationNumber: isAccountOnly ? "" : citizenId.trim(),
				dateOfBirth: isAccountOnly ? undefined : dobIso,
				address: isAccountOnly ? "" : address.trim(),
				avatarFile: isAccountOnly ? null : avatarFile,
			};
			await onSubmitCreate(payload);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<UserDialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle className="text-lg font-bold text-text-primary dark:text-primary-foreground">
						{isEdit ? "Chỉnh sửa thông tin người dùng" : "Tạo mới tài khoản y tế"}
					</DialogTitle>
					<DialogDescription className="text-xs text-text-secondary">
						{isEdit
							? "Cập nhật thông tin tài khoản và hồ sơ bác sĩ theo quy trình Saga của hệ thống."
							: isAccountOnly
								? "Tài khoản Quản lý chuyên môn chỉ khởi tạo tài khoản (không có hồ sơ bác sĩ)."
								: "Hệ thống sẽ đồng thời khởi tạo Tài khoản (Authentication), Hồ sơ Bác sĩ (Doctor), và cấp quyền tương ứng."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} noValidate className="space-y-5 pt-2 min-w-0">
					{/* Avatar & Basic Role */}
					<div className="flex items-center gap-5 p-4 rounded-xl bg-surface-secondary dark:bg-background/40 border border-border-default dark:border-border-default">
						{!isAccountOnly && (
							<>
								<Avatar className="h-16 w-16 border-2 border-surface shadow-sm shrink-0">
									{avatarPreview ? (
										<AvatarImage src={avatarPreview} alt="Preview" />
									) : (
										<AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
											{firstName ? firstName[0] : "BS"}
										</AvatarFallback>
									)}
								</Avatar>

								<div className="flex-1 space-y-1.5">
									<Label className="text-xs font-semibold text-text-primary dark:text-text-tertiary">
										Ảnh đại diện y bác sĩ (.jpg, .png, .webp){" "}
										{!isEdit && <span className="text-error">*</span>}
									</Label>
									<div className="flex items-center gap-2">
										<label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface dark:bg-surface border border-border-default dark:border-border-default text-xs font-semibold text-text-primary dark:text-text-tertiary hover:bg-surface-secondary transition-colors">
											<Upload className="w-3.5 h-3.5 text-text-secondary" />
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
												className="h-8 text-xs text-error hover:text-error hover:bg-error/10"
											>
												Xóa ảnh
											</Button>
										)}
									</div>
									{errors.avatar && (
										<p className="text-[11px] font-semibold text-error mt-1 flex items-center gap-1">
											<AlertCircle className="w-3.5 h-3.5 shrink-0" />
											<span>{errors.avatar}</span>
										</p>
									)}
								</div>
							</>
						)}

						<div className="flex items-center gap-3">
							<div className="w-36">
								<Label className="text-xs font-semibold text-text-primary dark:text-text-tertiary">
									Vai trò phân quyền <span className="text-error">*</span>
								</Label>
								<Select
									value={role}
									onValueChange={handleRoleChange}
								>
									<SelectTrigger className="mt-1 h-9 text-xs font-semibold bg-surface dark:bg-surface">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Doctor">Bác sĩ</SelectItem>
										<SelectItem value="HeadDepartmentDoctor">Trưởng khoa</SelectItem>
										<SelectItem value="Manager">Quản lý chuyên môn</SelectItem>
										{editingUser?.role === "Admin" && (
											<SelectItem value="Admin">Quản trị viên</SelectItem>
										)}
									</SelectContent>
								</Select>
							</div>

							{isEdit && (
								<div className="w-32">
									<Label className="text-xs font-semibold text-text-primary dark:text-text-tertiary">
										Trạng thái
									</Label>
									<Select
										value={status}
										onValueChange={(val: UserStatus) => setStatus(val)}
										disabled={editingUser?.role === "Admin"}
									>
										<SelectTrigger className="mt-1 h-9 text-xs font-semibold bg-surface dark:bg-surface">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Active">Hoạt động</SelectItem>
											<SelectItem value="Inactive">Đã khóa</SelectItem>
										</SelectContent>
									</Select>
								</div>
							)}
						</div>
					</div>

					{/* Account Info */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
						<div>
							<Label htmlFor="usr-email" className="text-xs font-semibold">
								Email đăng nhập <span className="text-error">*</span>
							</Label>
							<Input
								id="usr-email"
								type="email"
								value={email}
								onChange={(e) => handleFieldChange("email", e.target.value, setEmail)}
								onBlur={() => handleBlur("email", email)}
								placeholder="doctor@respira.vn"
								className={`mt-1 h-9 text-xs ${touched.email && errors.email ? "border-error focus-visible:ring-error/40 bg-error/10" : ""
									}`}
							/>
							{touched.email && errors.email && (
								<p className="text-[11px] font-semibold text-error mt-1 flex items-center gap-1 animate-in fade-in duration-150">
									<AlertCircle className="w-3.5 h-3.5 shrink-0" />
									<span>{errors.email}</span>
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="usr-phone" className="text-xs font-semibold">
								Số điện thoại liên hệ <span className="text-error">*</span>
							</Label>
							<Input
								id="usr-phone"
								type="tel"
								value={phone}
								onChange={(e) => handleFieldChange("phone", e.target.value, setPhone)}
								onBlur={() => handleBlur("phone", phone)}
								placeholder="0912345678"
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
								{isEdit ? "Mật khẩu mới (bỏ trống nếu giữ nguyên)" : "Mật khẩu khởi tạo"} {!isEdit && <span className="text-error">*</span>}
							</Label>
							<Input
								id="usr-pass"
								type="password"
								value={password}
								onChange={(e) => handleFieldChange("password", e.target.value, setPassword)}
								onBlur={() => handleBlur("password", password)}
								placeholder={isEdit ? "••••••••" : "Mật khẩu ít nhất 6 ký tự..."}
								className={`mt-1 h-9 text-xs ${touched.password && errors.password ? "border-error focus-visible:ring-error/40 bg-error/10" : ""
									}`}
							/>
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
									Thông tin cá nhân & Nhân thân
								</h4>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
									<div>
										<Label htmlFor="usr-lname" className="text-xs font-semibold">
											Họ và tên đệm <span className="text-error">*</span>
										</Label>
										<Input
											id="usr-lname"
											value={lastName}
											onChange={(e) => handleFieldChange("lastName", e.target.value, setLastName)}
											onBlur={() => handleBlur("lastName", lastName)}
											placeholder="Nguyễn Văn"
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
											Tên <span className="text-error">*</span>
										</Label>
										<Input
											id="usr-fname"
											value={firstName}
											onChange={(e) => handleFieldChange("firstName", e.target.value, setFirstName)}
											onBlur={() => handleBlur("firstName", firstName)}
											placeholder="An"
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
											Số CCCD / CMND <span className="text-error">*</span>
										</Label>
										<Input
											id="usr-citizen"
											value={citizenId}
											onChange={(e) => handleFieldChange("citizenId", e.target.value, setCitizenId)}
											onBlur={() => handleBlur("citizenId", citizenId)}
											placeholder="001088012345"
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
											Địa chỉ nơi cư trú / Khoa phòng <span className="text-error">*</span>
										</Label>
										<Input
											id="usr-address"
											value={address}
											onChange={(e) => handleFieldChange("address", e.target.value, setAddress)}
											onBlur={() => handleBlur("address", address)}
											placeholder="Khoa Hồi sức tích cực, Bệnh viện Bạch Mai"
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
														className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${selected
																? "bg-primary/10 text-primary border-primary/30 dark:bg-primary/10 dark:text-primary"
																: "bg-surface-secondary text-text-secondary border-border-default hover:bg-surface-secondary"
															}`}
													>
														{selected && <Check className="w-3.5 h-3.5 text-primary" />}
														<span>{DEGREE_LABELS[deg] || deg}</span>
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
							className="h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold"
						>
							{isSubmitting
								? "Đang lưu..."
								: isEdit
									? "Lưu thay đổi"
									: "Tạo người dùng"}
						</Button>
					</DialogFooter>
				</form>
			</UserDialogContent>
		</Dialog>
	);
}

