"use client";

import { type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	ProfileFormState,
	positionOptions,
	academicTitleOptions,
	degreeOptions,
} from "../types";

interface ProfileEditModalProps {
	form: ProfileFormState;
	isSaving: boolean;
	onClose: () => void;
	onChange: (
		field: keyof ProfileFormState
	) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
	onDegreeToggle: (value: string) => void;
	onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

const selectCls =
	"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function ProfileEditModal({
	form,
	isSaving,
	onClose,
	onChange,
	onDegreeToggle,
	onSubmit,
}: ProfileEditModalProps) {
	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
			onClick={onClose}
		>
			<div
				className="w-full max-w-5xl rounded-xl border bg-white p-5 shadow-xl max-h-[90vh] overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
				aria-labelledby="edit-profile-title"
			>
				{/* Header */}
				<div className="mb-4 flex items-center justify-between">
					<h2
						id="edit-profile-title"
						className="text-xl font-semibold text-[#003461]"
					>
						Chỉnh sửa hồ sơ
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
						aria-label="Đóng"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				<form className="space-y-4" onSubmit={onSubmit}>
					{/* ── Name ── */}
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label
								htmlFor="profile-firstName"
								className="text-xs uppercase text-gray-500"
							>
								Họ
							</Label>
							<Input
								id="profile-firstName"
								value={form.firstName}
								onChange={onChange("firstName")}
								placeholder="Họ"
							/>
						</div>
						<div className="space-y-2">
							<Label
								htmlFor="profile-lastName"
								className="text-xs uppercase text-gray-500"
							>
								Tên
							</Label>
							<Input
								id="profile-lastName"
								value={form.lastName}
								onChange={onChange("lastName")}
								placeholder="Tên"
							/>
						</div>
					</div>

					{/* ── Phone & Address ── */}
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label
								htmlFor="profile-phone"
								className="text-xs uppercase text-gray-500"
							>
								Số điện thoại
							</Label>
							<Input
								id="profile-phone"
								value={form.phoneNumber}
								onChange={onChange("phoneNumber")}
								placeholder="Số điện thoại"
							/>
						</div>
						<div className="space-y-2">
							<Label
								htmlFor="profile-address"
								className="text-xs uppercase text-gray-500"
							>
								Địa chỉ
							</Label>
							<Input
								id="profile-address"
								value={form.address}
								onChange={onChange("address")}
								placeholder="Địa chỉ thường trú"
							/>
						</div>
					</div>

					{/* ── Read-only fields ── */}
					<div className="rounded-md border border-gray-200 bg-gray-50 p-3">
						<div className="grid gap-3 sm:grid-cols-3">
							<div>
								<div className="text-xs uppercase text-gray-500">Email</div>
								<div className="mt-1 text-sm text-gray-700">
									{form.email || "Chưa cập nhật"}
								</div>
							</div>
							<div>
								<div className="text-xs uppercase text-gray-500">CCCD</div>
								<div className="mt-1 text-sm text-gray-700">
									{form.citizenIdentificationCard || "Chưa cập nhật"}
								</div>
							</div>
							<div>
								<div className="text-xs uppercase text-gray-500">Ngày sinh</div>
								<div className="mt-1 text-sm text-gray-700">
									{form.dateOfBirth
										? new Date(form.dateOfBirth).toLocaleDateString("vi-VN")
										: "Chưa cập nhật"}
								</div>
							</div>
						</div>
					</div>

					{/* ── Position & Academic Title ── */}
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label
								htmlFor="profile-position"
								className="text-xs uppercase text-gray-500"
							>
								Chức vụ
							</Label>
							<select
								id="profile-position"
								className={selectCls}
								value={form.position}
								onChange={onChange("position")}
							>
								<option value="">Chọn chức vụ</option>
								{positionOptions.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
						</div>
						<div className="space-y-2">
							<Label
								htmlFor="profile-academicTitle"
								className="text-xs uppercase text-gray-500"
							>
								Học hàm
							</Label>
							<select
								id="profile-academicTitle"
								className={selectCls}
								value={form.academicTitle}
								onChange={onChange("academicTitle")}
							>
								<option value="">Chọn học hàm</option>
								{academicTitleOptions.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* ── Gender & Degrees ── */}
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label
								htmlFor="profile-gender"
								className="text-xs uppercase text-gray-500"
							>
								Giới tính
							</Label>
							<select
								id="profile-gender"
								className={selectCls}
								value={form.gender ? "true" : "false"}
								onChange={onChange("gender")}
							>
								<option value="true">Nam</option>
								<option value="false">Nữ</option>
							</select>
						</div>
						<div className="space-y-2">
							<Label className="text-xs uppercase text-gray-500">
								Học vị / Bằng cấp
							</Label>
							<div className="space-y-2 rounded-md border border-gray-200 p-3">
								<div className="flex flex-wrap gap-2">
									{degreeOptions.map((opt) => {
										const checked = form.degrees.includes(opt.value);
										return (
											<label
												key={opt.value}
												className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors ${
													checked
														? "border-[#003461] bg-[#003461] text-white"
														: "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
												}`}
											>
												<input
													type="checkbox"
													checked={checked}
													onChange={() => onDegreeToggle(opt.value)}
													className="sr-only"
												/>
												{opt.label}
											</label>
										);
									})}
								</div>
							</div>
						</div>
					</div>

					{/* ── Actions ── */}
					<div className="flex items-center justify-end gap-3 pt-4">
						<Button
							variant="outline"
							type="button"
							onClick={onClose}
							id="profile-edit-cancel"
						>
							Hủy
						</Button>
						<Button
							type="submit"
							disabled={isSaving}
							id="profile-edit-save"
							className="bg-[#0A3D73] text-white hover:bg-[#0D4D8C]"
						>
							{isSaving ? "Đang lưu..." : "Lưu"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
