"use client";

import { useRef } from "react";
import { Eye, EyeOff, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DoctorProfile, formatDate, maskValue } from "../types";

interface ProfileAvatarCardProps {
	doctor: DoctorProfile;
	showEmail: boolean;
	showCccd: boolean;
	onToggleEmail: () => void;
	onToggleCccd: () => void;
	onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileAvatarCard({
	doctor,
	showEmail,
	showCccd,
	onToggleEmail,
	onToggleCccd,
	onAvatarChange,
}: ProfileAvatarCardProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const fullName =
		[doctor.firstName, doctor.lastName].filter(Boolean).join(" ") ||
		"Chưa cập nhật";
	const dob = formatDate(doctor.dateOfBirth);

	return (
		<div className="h-full rounded-md border-2 bg-white p-6">
			{/* ── Avatar + Name ── */}
			<div className="flex flex-col items-center">
				<div className="relative h-28 w-28">
					{doctor.mediaUrl ? (
						<img
							src={doctor.mediaUrl}
							alt="Doctor Avatar"
							className="h-full w-full rounded-md object-cover border border-gray-200"
						/>
					) : (
						<div className="absolute inset-0 flex items-center justify-center rounded-md bg-slate-200 text-4xl font-bold text-[#003461]">
							{doctor.firstName ? doctor.firstName.charAt(0).toUpperCase() : "N"}
						</div>
					)}

					{/* Camera button */}
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => fileInputRef.current?.click()}
						className="absolute right-0 bottom-0 translate-x-1 translate-y-1 h-8 w-8 rounded-full border-2 border-white bg-white hover:bg-slate-100 shadow-sm"
						title="Đổi ảnh đại diện"
					>
						<Pencil size={14} className="text-gray-600" />
					</Button>

					<input
						type="file"
						ref={fileInputRef}
						onChange={onAvatarChange}
						accept="image/*"
						className="hidden"
					/>
				</div>

				<h2 className="mt-6 text-xl font-semibold">BS. {fullName}</h2>
				<p className="mt-1 text-sm text-gray-500">{doctor.specialty || "Bác sĩ"}</p>

				<div className="my-5 w-full border-b-2" />
			</div>

			{/* ── Personal Info ── */}
			<div>
				<h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#003461]">
					Thông tin cá nhân
				</h3>

				<div className="grid gap-4 text-sm sm:grid-cols-2">
					{/* Ngày sinh */}
					<div>
						<div className="text-xs uppercase text-gray-500">Ngày sinh</div>
						<div className="mt-1 font-medium">{dob}</div>
					</div>

					{/* Giới tính */}
					<div>
						<div className="text-xs uppercase text-gray-500">Giới tính</div>
						<div className="mt-1 font-medium">
							{doctor.gender ? "Nam" : "Nữ"}
						</div>
					</div>

					{/* CCCD */}
					<div>
						<div className="text-xs uppercase text-gray-500">CCCD</div>
						<div className="mt-1 flex items-center gap-2">
							<span className="font-medium">
								{showCccd
									? doctor.citizenIdentificationCard || "Chưa cập nhật"
									: maskValue(doctor.citizenIdentificationCard)}
							</span>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={onToggleCccd}
								className="h-6 w-6 text-gray-400 hover:text-gray-700"
								aria-label={showCccd ? "Ẩn CCCD" : "Hiện CCCD"}
							>
								{showCccd ? <EyeOff size={14} /> : <Eye size={14} />}
							</Button>
						</div>
					</div>

					{/* Số điện thoại */}
					<div>
						<div className="text-xs uppercase text-gray-500">Số điện thoại</div>
						<div className="mt-1 font-medium">{doctor.phoneNumber || "Chưa cập nhật"}</div>
					</div>

					{/* Email */}
					<div>
						<div className="text-xs uppercase text-gray-500">Email</div>
						<div className="mt-1 flex items-center gap-2">
							<span className="font-medium">
								{showEmail
									? doctor.email || "Chưa cập nhật"
									: maskValue(doctor.email)}
							</span>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={onToggleEmail}
								className="h-6 w-6 text-gray-400 hover:text-gray-700"
								aria-label={showEmail ? "Ẩn email" : "Hiện email"}
							>
								{showEmail ? <EyeOff size={14} /> : <Eye size={14} />}
							</Button>
						</div>
					</div>

					{/* Địa chỉ */}
					<div className="sm:col-span-2">
						<div className="text-xs uppercase text-gray-500">Địa chỉ thường trú</div>
						<div className="mt-1 font-medium">{doctor.address || "Chưa cập nhật"}</div>
					</div>
				</div>
			</div>
		</div>
	);
}
