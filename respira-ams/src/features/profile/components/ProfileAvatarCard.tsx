"use client";

import { useRef } from "react";
import {
	Camera,
	Eye,
	EyeOff,
	Mail,
	Phone,
	MapPin,
	Calendar,
	User,
	Fingerprint,
	CheckCircle2,
	IdCard,
	Loader2,
} from "lucide-react";
import {
	DoctorProfile,
	formatDate,
	maskValue,
	getDoctorDisplayName,
	ROLE_LABELS,
	POSITION_LABELS,
} from "../types";

interface ProfileAvatarCardProps {
	doctor: DoctorProfile;
	showEmail: boolean;
	showCccd: boolean;
	isUploadingAvatar?: boolean;
	onToggleEmail: () => void;
	onToggleCccd: () => void;
	onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileAvatarCard({
	doctor,
	showEmail,
	showCccd,
	isUploadingAvatar = false,
	onToggleEmail,
	onToggleCccd,
	onAvatarChange,
}: ProfileAvatarCardProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const fullName = [doctor.lastName, doctor.firstName].filter(Boolean).join(" ").trim();
	const displayName = getDoctorDisplayName(doctor);
	const roleText = ROLE_LABELS[doctor.role || "Doctor"] || "Bác sĩ chuyên môn";
	const positionText = POSITION_LABELS[doctor.position] || doctor.position || "Bác sĩ điều trị";
	const dob = formatDate(doctor.dateOfBirth);

	const avatarSrc = doctor.mediaUrl || doctor.avatarUrl;
	const initial = doctor.firstName
		? doctor.firstName.charAt(0).toUpperCase()
		: doctor.lastName
			? doctor.lastName.charAt(0).toUpperCase()
			: "B";

	return (
		<div className="rounded-[14px] border border-slate-200/80 bg-white p-6 shadow-2xs">
			{/* ── Avatar & Name Header ── */}
			<div className="flex flex-col items-center text-center">
				<div className="relative group">
					<div className="relative h-28 w-28 rounded-full ring-4 ring-sky-100 overflow-hidden bg-slate-100 flex items-center justify-center shadow-xs">
						{avatarSrc ? (
							<img
								src={avatarSrc}
								alt={displayName}
								className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center bg-linear-to-tr from-[#0284C7] to-[#38BDF8] text-3xl font-bold text-white select-none">
								{initial}
							</div>
						)}

						{/* Overlay loading khi đang upload avatar */}
						{isUploadingAvatar && (
							<div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex flex-col items-center justify-center text-white z-10">
								<Loader2 className="h-6 w-6 animate-spin text-white" />
								<span className="text-[9px] font-semibold mt-1">Đang tải...</span>
							</div>
						)}
					</div>

					{/* Online status indicator */}
					<span
						className="absolute bottom-1 right-2 h-4 w-4 rounded-full bg-[#10B981] ring-3 ring-white"
						title="Đang trực tuyến"
					/>

					{/* Camera button to upload avatar */}
					<button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						disabled={isUploadingAvatar}
						className="absolute top-0 right-0 h-8 w-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-sky-600 shadow-sm flex items-center justify-center transition-all cursor-pointer hover:scale-105 disabled:opacity-75 disabled:cursor-not-allowed"
						title="Tải ảnh đại diện mới"
						id="btn-upload-avatar"
					>
						{isUploadingAvatar ? (
							<Loader2 className="h-4 w-4 animate-spin text-[#0EA5E9]" />
						) : (
							<Camera className="h-4 w-4" />
						)}
					</button>

					<input
						type="file"
						ref={fileInputRef}
						onChange={onAvatarChange}
						accept="image/jpeg,image/png,image/webp,image/jpg"
						className="hidden"
						disabled={isUploadingAvatar}
					/>
				</div>

				<h2 className="mt-4 text-base font-bold text-slate-900 tracking-tight">
					{displayName}
				</h2>

				<div className="mt-1 flex flex-wrap items-center justify-center gap-1.5">
					<span className="inline-flex items-center gap-1 rounded-full bg-[#E0F2FE] px-2.5 py-0.5 text-[11px] font-semibold text-[#0369A1]">
						{positionText}
					</span>
					<span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
						{roleText}
					</span>
				</div>

				{doctor.email && (
					<p className="mt-2 text-xs text-slate-500 max-w-[240px] truncate" title={doctor.email}>
						{doctor.email}
					</p>
				)}
			</div>

			<div className="my-5 border-t border-slate-100" />

			{/* ── Personal Info List ── */}
			<div>
				<h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5 flex items-center gap-1.5">
					<User className="h-3.5 w-3.5 text-slate-400" />
					<span>Thông tin cá nhân</span>
				</h3>

				<div className="space-y-3 text-xs">
					{/* Họ và tên */}
					<div className="flex items-start justify-between gap-2 py-1 border-b border-slate-50">
						<div className="flex items-center gap-2 text-slate-500">
							<User className="h-3.5 w-3.5 shrink-0 text-slate-400" />
							<span>Họ và tên:</span>
						</div>
						<span className="font-semibold text-slate-800">
							{fullName || "Chưa cập nhật"}
						</span>
					</div>

					{/* Ngày sinh */}
					<div className="flex items-start justify-between gap-2 py-1 border-b border-slate-50">
						<div className="flex items-center gap-2 text-slate-500">
							<Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
							<span>Ngày sinh:</span>
						</div>
						<span className="font-semibold text-slate-800">{dob}</span>
					</div>

					{/* Giới tính */}
					<div className="flex items-start justify-between gap-2 py-1 border-b border-slate-50">
						<div className="flex items-center gap-2 text-slate-500">
							<User className="h-3.5 w-3.5 shrink-0 text-slate-400" />
							<span>Giới tính:</span>
						</div>
						<span className="font-semibold text-slate-800">
							{doctor.gender ? "Nam" : "Nữ"}
						</span>
					</div>

					{/* CCCD / CMND */}
					<div className="flex items-start justify-between gap-2 py-1 border-b border-slate-50">
						<div className="flex items-center gap-2 text-slate-500">
							<Fingerprint className="h-3.5 w-3.5 shrink-0 text-slate-400" />
							<span>Số CCCD/CMND:</span>
						</div>
						<div className="flex items-center gap-1.5">
							<span className="font-semibold font-mono text-slate-800">
								{showCccd
									? doctor.citizenIdentificationCard || "Chưa cập nhật"
									: maskValue(doctor.citizenIdentificationCard)}
							</span>
							<button
								type="button"
								onClick={onToggleCccd}
								className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
								title={showCccd ? "Ẩn số CCCD" : "Xem số CCCD"}
							>
								{showCccd ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
							</button>
						</div>
					</div>

					{/* Số điện thoại */}
					<div className="flex items-start justify-between gap-2 py-1 border-b border-slate-50">
						<div className="flex items-center gap-2 text-slate-500">
							<Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
							<span>Số điện thoại:</span>
						</div>
						<a
							href={`tel:${doctor.phoneNumber}`}
							className="font-semibold text-[#0EA5E9] hover:underline"
						>
							{doctor.phoneNumber || "Chưa cập nhật"}
						</a>
					</div>

					{/* Email */}
					<div className="flex items-start justify-between gap-2 py-1 border-b border-slate-50">
						<div className="flex items-center gap-2 text-slate-500">
							<Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
							<span>Email:</span>
						</div>
						<div className="flex items-center gap-1 max-w-[170px] justify-end">
							<span
								className="font-semibold text-slate-800 truncate"
								title={doctor.email}
							>
								{showEmail
									? doctor.email || "Chưa cập nhật"
									: maskValue(doctor.email)}
							</span>
							<button
								type="button"
								onClick={onToggleEmail}
								className="text-slate-400 hover:text-slate-600 p-0.5 shrink-0 cursor-pointer"
								title={showEmail ? "Ẩn email" : "Xem email đầy đủ"}
							>
								{showEmail ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
							</button>
						</div>
					</div>

					{/* Địa chỉ */}
					<div className="pt-1">
						<div className="flex items-center gap-2 text-slate-500 mb-1">
							<MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
							<span>Địa chỉ thường trú:</span>
						</div>
						<p className="font-medium text-slate-800 pl-5.5 leading-relaxed text-[11.5px]">
							{doctor.address || "Chưa cập nhật"}
						</p>
					</div>
				</div>
			</div>

			<div className="my-5 border-t border-slate-100" />

			{/* ── System Identification Info ── */}
			<div className="rounded-[10px] bg-slate-50 p-3 text-[11px] text-slate-500 space-y-1.5">
				<div className="flex items-center justify-between">
					<span className="flex items-center gap-1 text-slate-400">
						<IdCard className="h-3 w-3" />
						Mã hồ sơ:
					</span>
					<span className="font-mono font-medium text-slate-700 truncate max-w-[140px]" title={doctor.doctorId || doctor.id}>
						{doctor.doctorId || doctor.id || "N/A"}
					</span>
				</div>
				{doctor.accountId && (
					<div className="flex items-center justify-between">
						<span className="flex items-center gap-1 text-slate-400">
							<Fingerprint className="h-3 w-3" />
							Mã tài khoản:
						</span>
						<span className="font-mono font-medium text-slate-700 truncate max-w-[140px]" title={doctor.accountId}>
							{doctor.accountId}
						</span>
					</div>
				)}
				{doctor.createdAt && (
					<div className="flex items-center justify-between">
						<span className="flex items-center gap-1 text-slate-400">
							<Calendar className="h-3 w-3" />
							Ngày tạo:
						</span>
						<span className="font-medium text-slate-700">
							{formatDate(doctor.createdAt)}
						</span>
					</div>
				)}
				<div className="flex items-center justify-between">
					<span className="flex items-center gap-1 text-slate-400">
						<CheckCircle2 className="h-3 w-3 text-emerald-500" />
						Trạng thái tài khoản:
					</span>
					<span className="font-medium text-emerald-700">
						{doctor.accountStatus || "Đang hoạt động"}
					</span>
				</div>
			</div>
		</div>
	);
}
