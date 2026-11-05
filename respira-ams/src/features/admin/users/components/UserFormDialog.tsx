"use client";

import React, { useEffect, useState } from "react";
import { Upload, X, ShieldAlert, Check } from "lucide-react";
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
	const [role, setRole] = useState<"Doctor" | "Manager">("Doctor");
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

	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (editingUser) {
			setEmail(editingUser.email || "");
			setPassword("");
			setPhone(editingUser.phone || "");
			setRole(editingUser.role === "Manager" ? "Manager" : "Doctor");
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

	const validate = (): boolean => {
		const nextErr: Record<string, string> = {};

		if (!email.trim()) nextErr.email = "Email là bắt buộc";
		else if (!/\S+@\S+\.\S+/.test(email)) nextErr.email = "Email không đúng định dạng";

		if (!isEdit && !password.trim()) {
			nextErr.password = "Mật khẩu khởi tạo là bắt buộc";
		}

		if (!phone.trim()) nextErr.phone = "Số điện thoại là bắt buộc";
		if (!firstName.trim()) nextErr.firstName = "Tên là bắt buộc";
		if (!lastName.trim()) nextErr.lastName = "Họ và tên đệm là bắt buộc";
		if (!citizenId.trim()) nextErr.citizenId = "Số CCCD/CMND là bắt buộc";
		if (!address.trim()) nextErr.address = "Địa chỉ là bắt buộc";

		setErrors(nextErr);
		return Object.keys(nextErr).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validate()) return;

		const dobIso = dateOfBirth ? new Date(dateOfBirth).toISOString() : undefined;

		if (isEdit && editingUser) {
			const payload: UpdateUserPayload = {
				accountId: editingUser.id,
				doctorId: editingUser.doctorId || editingUser.id,
				email: email.trim(),
				phone: phone.trim(),
				password: password.trim() || undefined,
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
						{isEdit ? "Chỉnh sửa thông tin người dùng" : "Tạo mới tài khoản y tế"}
					</DialogTitle>
					<DialogDescription className="text-xs text-slate-500">
						{isEdit
							? "Cập nhật thông tin tài khoản và hồ sơ bác sĩ theo quy trình Saga của hệ thống."
							: "Hệ thống sẽ đồng thời khởi tạo Tài khoản (Authentication), Hồ sơ Bác sĩ (Doctor), và cấp quyền tương ứng."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-5 pt-2 min-w-0">
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

						{!isEdit && (
							<div className="w-40">
								<Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
									Vai trò phân quyền <span className="text-red-500">*</span>
								</Label>
								<Select
									value={role}
									onValueChange={(val: "Doctor" | "Manager") => setRole(val)}
								>
									<SelectTrigger className="mt-1 h-9 text-xs font-semibold bg-white dark:bg-slate-900">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Doctor">Bác sĩ</SelectItem>
										<SelectItem value="Manager">Trưởng khoa</SelectItem>
									</SelectContent>
								</Select>
							</div>
						)}
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
								onChange={(e) => setEmail(e.target.value)}
								placeholder="doctor@respira.vn"
								className="mt-1 h-9 text-xs"
							/>
							{errors.email && (
								<p className="text-[11px] font-semibold text-red-500 mt-1">{errors.email}</p>
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
								onChange={(e) => setPhone(e.target.value)}
								placeholder="0912345678"
								className="mt-1 h-9 text-xs"
							/>
							{errors.phone && (
								<p className="text-[11px] font-semibold text-red-500 mt-1">{errors.phone}</p>
							)}
						</div>

						<div className="sm:col-span-2">
							<Label htmlFor="usr-pass" className="text-xs font-semibold">
								{isEdit ? "Mật khẩu mới (bỏ trống nếu giữ nguyên)" : "Mật khẩu khởi tạo"} {!isEdit && <span className="text-red-500">*</span>}
							</Label>
							<Input
								id="usr-pass"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder={isEdit ? "••••••••" : "Mật khẩu ít nhất 8 ký tự..."}
								className="mt-1 h-9 text-xs"
							/>
							{errors.password && (
								<p className="text-[11px] font-semibold text-red-500 mt-1">{errors.password}</p>
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
									onChange={(e) => setLastName(e.target.value)}
									placeholder="Nguyễn Văn"
									className="mt-1 h-9 text-xs"
								/>
								{errors.lastName && (
									<p className="text-[11px] font-semibold text-red-500 mt-1">{errors.lastName}</p>
								)}
							</div>

							<div>
								<Label htmlFor="usr-fname" className="text-xs font-semibold">
									Tên <span className="text-red-500">*</span>
								</Label>
								<Input
									id="usr-fname"
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									placeholder="An"
									className="mt-1 h-9 text-xs"
								/>
								{errors.firstName && (
									<p className="text-[11px] font-semibold text-red-500 mt-1">{errors.firstName}</p>
								)}
							</div>

							<div>
								<Label htmlFor="usr-citizen" className="text-xs font-semibold">
									Số CCCD / CMND <span className="text-red-500">*</span>
								</Label>
								<Input
									id="usr-citizen"
									value={citizenId}
									onChange={(e) => setCitizenId(e.target.value)}
									placeholder="001088012345"
									className="mt-1 h-9 text-xs"
								/>
								{errors.citizenId && (
									<p className="text-[11px] font-semibold text-red-500 mt-1">{errors.citizenId}</p>
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
										onChange={(e) => setDateOfBirth(e.target.value)}
										className="mt-1 h-9 text-xs"
									/>
								</div>
							</div>

							<div className="sm:col-span-2">
								<Label htmlFor="usr-address" className="text-xs font-semibold">
									Địa chỉ nơi cư trú / Khoa phòng <span className="text-red-500">*</span>
								</Label>
								<Input
									id="usr-address"
									value={address}
									onChange={(e) => setAddress(e.target.value)}
									placeholder="Khoa Hồi sức tích cực, Bệnh viện Bạch Mai"
									className="mt-1 h-9 text-xs"
								/>
								{errors.address && (
									<p className="text-[11px] font-semibold text-red-500 mt-1">{errors.address}</p>
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
						>
							{isSubmitting
								? "Đang lưu qua Saga..."
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

