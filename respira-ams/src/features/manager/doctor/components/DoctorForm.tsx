"use client";

import { useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	ACADEMIC_TITLE_OPTIONS,
	POSITION_OPTIONS,
	DEGREE_OPTIONS,
} from "../types";

// ─── Validation Schema ─────────────────────────────────────────────────────────

const doctorSchema = z.object({
	firstName: z.string().trim().min(1, "Họ là bắt buộc!"),
	lastName: z.string().trim().min(1, "Tên là bắt buộc!"),
	email: z.string().trim().email("Email không hợp lệ!"),
	password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự!"),
	phoneNumber: z.string().trim().min(1, "Số điện thoại là bắt buộc!"),
	address: z.string().trim().min(1, "Địa chỉ là bắt buộc!"),
	citizenIdentificationCard: z.string().trim().min(1, "CCCD là bắt buộc!"),
	dateOfBirth: z.string().min(1, "Ngày sinh là bắt buộc!"),
	gender: z.string().min(1),
	academicTitle: z.string().min(1),
	position: z.string().min(1),
});

type FormErrors = Record<string, string>;

interface DoctorFormProps {
	onSubmit: (data: Record<string, unknown>) => void;
	onCancel: () => void;
	isPending?: boolean;
}

// ─── Helper ────────────────────────────────────────────────────────────────────

const selectCls =
	"flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50";

// ─── Component ─────────────────────────────────────────────────────────────────

export function DoctorForm({ onSubmit, onCancel, isPending = false }: DoctorFormProps) {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		phoneNumber: "",
		address: "",
		citizenIdentificationCard: "",
		dateOfBirth: "",
		gender: "true",
		academicTitle: "None",
		position: "StaffDoctor",
	});
	const [selectedDegrees, setSelectedDegrees] = useState<string[]>([]);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [formErrors, setFormErrors] = useState<FormErrors>({});

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: "" }));
	};

	const toggleDegree = (degree: string) => {
		setSelectedDegrees((prev) =>
			prev.includes(degree)
				? prev.filter((d) => d !== degree)
				: [...prev, degree]
		);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const result = doctorSchema.safeParse(formData);
		if (!result.success) {
			const errs: FormErrors = {};
			result.error.issues.forEach(
				(issue) => (errs[issue.path[0] as string] = issue.message)
			);
			setFormErrors(errs);
			return;
		}
		setFormErrors({});
		// UI-only: log thay vì gọi API
		onSubmit({ ...formData, degrees: selectedDegrees, avatar: avatarFile });
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col gap-4 animate-in fade-in"
			noValidate
			id="doctor-create-form"
		>
			{/* Họ / Tên */}
			<div className="grid grid-cols-2 gap-4">
				<div>
					<label className="block text-xs font-semibold text-gray-600 mb-1">
						Họ <span className="text-red-500">*</span>
					</label>
					<Input
						id="doctor-firstName"
						value={formData.firstName}
						onChange={(e) => handleChange("firstName", e.target.value)}
						disabled={isPending}
						className={formErrors.firstName ? "border-red-500" : ""}
					/>
					{formErrors.firstName && (
						<p className="text-xs text-red-500 mt-1">{formErrors.firstName}</p>
					)}
				</div>
				<div>
					<label className="block text-xs font-semibold text-gray-600 mb-1">
						Tên <span className="text-red-500">*</span>
					</label>
					<Input
						id="doctor-lastName"
						value={formData.lastName}
						onChange={(e) => handleChange("lastName", e.target.value)}
						disabled={isPending}
						className={formErrors.lastName ? "border-red-500" : ""}
					/>
					{formErrors.lastName && (
						<p className="text-xs text-red-500 mt-1">{formErrors.lastName}</p>
					)}
				</div>
			</div>

			{/* Email / Password */}
			<div className="grid grid-cols-2 gap-4">
				<div>
					<label className="block text-xs font-semibold text-gray-600 mb-1">
						Email <span className="text-red-500">*</span>
					</label>
					<Input
						id="doctor-email"
						type="email"
						value={formData.email}
						onChange={(e) => handleChange("email", e.target.value)}
						disabled={isPending}
						className={formErrors.email ? "border-red-500" : ""}
					/>
					{formErrors.email && (
						<p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
					)}
				</div>
				<div>
					<label className="block text-xs font-semibold text-gray-600 mb-1">
						Mật khẩu <span className="text-red-500">*</span>
					</label>
					<Input
						id="doctor-password"
						type="password"
						value={formData.password}
						onChange={(e) => handleChange("password", e.target.value)}
						disabled={isPending}
						className={formErrors.password ? "border-red-500" : ""}
					/>
					{formErrors.password && (
						<p className="text-xs text-red-500 mt-1">{formErrors.password}</p>
					)}
				</div>
			</div>

			{/* Phone / CCCD */}
			<div className="grid grid-cols-2 gap-4">
				<div>
					<label className="block text-xs font-semibold text-gray-600 mb-1">
						Số điện thoại <span className="text-red-500">*</span>
					</label>
					<Input
						id="doctor-phone"
						value={formData.phoneNumber}
						onChange={(e) => handleChange("phoneNumber", e.target.value)}
						disabled={isPending}
						className={formErrors.phoneNumber ? "border-red-500" : ""}
					/>
					{formErrors.phoneNumber && (
						<p className="text-xs text-red-500 mt-1">{formErrors.phoneNumber}</p>
					)}
				</div>
				<div>
					<label className="block text-xs font-semibold text-gray-600 mb-1">
						CCCD <span className="text-red-500">*</span>
					</label>
					<Input
						id="doctor-cccd"
						value={formData.citizenIdentificationCard}
						onChange={(e) =>
							handleChange("citizenIdentificationCard", e.target.value)
						}
						disabled={isPending}
						className={
							formErrors.citizenIdentificationCard ? "border-red-500" : ""
						}
					/>
					{formErrors.citizenIdentificationCard && (
						<p className="text-xs text-red-500 mt-1">
							{formErrors.citizenIdentificationCard}
						</p>
					)}
				</div>
			</div>

			{/* DOB / Gender */}
			<div className="grid grid-cols-2 gap-4">
				<div>
					<label className="block text-xs font-semibold text-gray-600 mb-1">
						Ngày sinh <span className="text-red-500">*</span>
					</label>
					<Input
						id="doctor-dob"
						type="date"
						value={formData.dateOfBirth}
						onChange={(e) => handleChange("dateOfBirth", e.target.value)}
						disabled={isPending}
						className={formErrors.dateOfBirth ? "border-red-500" : ""}
					/>
					{formErrors.dateOfBirth && (
						<p className="text-xs text-red-500 mt-1">{formErrors.dateOfBirth}</p>
					)}
				</div>
				<div>
					<label className="block text-xs font-semibold text-gray-600 mb-1">
						Giới tính <span className="text-red-500">*</span>
					</label>
					<select
						id="doctor-gender"
						value={formData.gender}
						onChange={(e) => handleChange("gender", e.target.value)}
						disabled={isPending}
						className={selectCls}
					>
						<option value="true">Nam</option>
						<option value="false">Nữ</option>
					</select>
				</div>
			</div>

			{/* Address */}
			<div>
				<label className="block text-xs font-semibold text-gray-600 mb-1">
					Địa chỉ <span className="text-red-500">*</span>
				</label>
				<Input
					id="doctor-address"
					value={formData.address}
					onChange={(e) => handleChange("address", e.target.value)}
					disabled={isPending}
					className={formErrors.address ? "border-red-500" : ""}
				/>
				{formErrors.address && (
					<p className="text-xs text-red-500 mt-1">{formErrors.address}</p>
				)}
			</div>

			{/* Academic Title / Position */}
			<div className="grid grid-cols-2 gap-4">
				<div>
					<label className="block text-xs font-semibold text-gray-600 mb-1">
						Học hàm <span className="text-red-500">*</span>
					</label>
					<select
						id="doctor-academicTitle"
						value={formData.academicTitle}
						onChange={(e) => handleChange("academicTitle", e.target.value)}
						disabled={isPending}
						className={selectCls}
					>
						{ACADEMIC_TITLE_OPTIONS.map((t) => (
							<option key={t} value={t}>
								{t}
							</option>
						))}
					</select>
				</div>
				<div>
					<label className="block text-xs font-semibold text-gray-600 mb-1">
						Chức vụ <span className="text-red-500">*</span>
					</label>
					<select
						id="doctor-position"
						value={formData.position}
						onChange={(e) => handleChange("position", e.target.value)}
						disabled={isPending}
						className={selectCls}
					>
						{POSITION_OPTIONS.map((p) => (
							<option key={p} value={p}>
								{p}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Degrees */}
			<div>
				<label className="block text-xs font-semibold text-gray-600 mb-2">
					Bằng cấp
				</label>
				<div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-zinc-50 p-3 rounded-md border">
					{DEGREE_OPTIONS.map((deg) => (
						<label
							key={deg}
							className="flex items-center gap-2 cursor-pointer text-sm"
						>
							<input
								type="checkbox"
								checked={selectedDegrees.includes(deg)}
								onChange={() => toggleDegree(deg)}
								disabled={isPending}
								className="rounded text-primary focus:ring-primary"
							/>
							{deg}
						</label>
					))}
				</div>
			</div>

			{/* Avatar */}
			<div>
				<label className="block text-xs font-semibold text-gray-600 mb-1">
					Ảnh đại diện{" "}
					<span className="font-normal italic text-zinc-400">- Tuỳ chọn</span>
				</label>
				<Input
					id="doctor-avatar"
					type="file"
					accept="image/*"
					onChange={(e) =>
						setAvatarFile(e.target.files?.[0] ?? null)
					}
					disabled={isPending}
					className="cursor-pointer bg-white pt-1.5"
				/>
			</div>

			{/* Footer buttons */}
			<div className="flex justify-end gap-3 mt-4 pt-4 border-t">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					disabled={isPending}
					id="doctor-form-cancel"
				>
					Hủy
				</Button>
				<Button
					type="submit"
					disabled={isPending}
					id="doctor-form-submit"
					className="bg-primary text-white hover:opacity-90"
				>
					{isPending ? "Đang tạo..." : "Tạo Bác sĩ"}
				</Button>
			</div>
		</form>
	);
}
