"use client";

import { useRef, useState } from "react";
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
import { useTranslations } from "next-intl";

import {
	DoctorProfile,
	formatDate,
	maskValue,
	getDoctorDisplayName,
	getRoleLabel,
	getPositionLabel,
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
	const t = useTranslations("doctor.profile");
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [failedAvatarSrc, setFailedAvatarSrc] = useState<string | null>(null);

	const fullName = [doctor.lastName, doctor.firstName]
		.filter(Boolean)
		.join(" ")
		.trim();
	const displayName = getDoctorDisplayName(doctor, t);
	const roleText = getRoleLabel(doctor.role || "Doctor", t);
	const positionText = getPositionLabel(doctor.position || "StaffDoctor", t);
	const dob = formatDate(doctor.dateOfBirth, t);

	const avatarSrc = doctor.mediaUrl || doctor.avatarUrl;
	// A stored URL can expire or point at a revoked blob; fall back to the initial.
	const showAvatarImage = Boolean(avatarSrc) && failedAvatarSrc !== avatarSrc;
	const fallbackChar = t("initialsFallback").charAt(0) || "B";
	const initial = doctor.firstName
		? doctor.firstName.charAt(0).toUpperCase()
		: doctor.lastName
			? doctor.lastName.charAt(0).toUpperCase()
			: fallbackChar;

	return (
		<div className="rounded-[14px] border border-border bg-card text-card-foreground p-6 shadow-2xs">
			{/* ── Avatar & Name Header ── */}
			<div className="flex flex-col items-center text-center">
				<div className="relative group">
					<div className="relative h-28 w-28 rounded-full ring-4 ring-sky-500/20 overflow-hidden bg-muted flex items-center justify-center shadow-xs">
						{showAvatarImage ? (
							<img
								key={avatarSrc}
								src={avatarSrc}
								alt={displayName}
								onError={() => setFailedAvatarSrc(avatarSrc ?? null)}
								className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center bg-linear-to-tr from-[#0284C7] to-[#38BDF8] text-3xl font-bold text-white select-none">
								{initial}
							</div>
						)}

						{/* Overlay loading khi đang upload avatar */}
						{isUploadingAvatar && (
							<div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex flex-col items-center justify-center text-white z-10">
								<Loader2 className="h-6 w-6 animate-spin text-white" />
								<span className="text-[9px] font-semibold mt-1">
									{t("avatarCard.uploading")}
								</span>
							</div>
						)}
					</div>

					{/* Online status indicator */}
					<span
						className="absolute bottom-1 right-2 h-4 w-4 rounded-full bg-emerald-500 ring-3 ring-card"
						title={t("avatarCard.online")}
					/>

					{/* Camera button to upload avatar */}
					<button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						disabled={isUploadingAvatar}
						className="absolute top-0 right-0 h-8 w-8 rounded-full border border-border bg-card hover:bg-accent text-muted-foreground hover:text-primary shadow-sm flex items-center justify-center transition-all cursor-pointer hover:scale-105 disabled:opacity-75 disabled:cursor-not-allowed"
						title={t("avatarCard.uploadTooltip")}
						id="btn-upload-avatar"
					>
						{isUploadingAvatar ? (
							<Loader2 className="h-4 w-4 animate-spin text-primary" />
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

				<h2 className="mt-4 text-base font-bold text-foreground tracking-tight">
					{displayName}
				</h2>

				<div className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5">
					<span className="inline-flex items-center gap-1 rounded-full border border-sky-500/20 bg-sky-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700 dark:text-sky-300">
						{positionText}
					</span>
					<span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
						{roleText}
					</span>
				</div>

				{doctor.email && (
					<p
						className="mt-2 text-xs text-muted-foreground max-w-[240px] truncate"
						title={doctor.email}
					>
						{doctor.email}
					</p>
				)}
			</div>

			<div className="my-5 border-t border-border" />

			{/* ── Personal Info List ── */}
			<div>
				<h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3.5 flex items-center gap-1.5">
					<User className="h-3.5 w-3.5 text-muted-foreground" />
					<span>{t("avatarCard.personalInfoTitle")}</span>
				</h3>

				<div className="space-y-3 text-xs">
					{/* Họ và tên */}
					<div className="flex items-start justify-between gap-2 py-1 border-b border-border/60">
						<div className="flex items-center gap-2 text-muted-foreground">
							<User className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
							<span>{t("avatarCard.fullName")}</span>
						</div>
						<span className="font-semibold text-foreground text-right">
							{fullName || t("notUpdated")}
						</span>
					</div>

					{/* Ngày sinh */}
					<div className="flex items-start justify-between gap-2 py-1 border-b border-border/60">
						<div className="flex items-center gap-2 text-muted-foreground">
							<Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
							<span>{t("avatarCard.dob")}</span>
						</div>
						<span className="font-semibold text-foreground">{dob}</span>
					</div>

					{/* Giới tính */}
					<div className="flex items-start justify-between gap-2 py-1 border-b border-border/60">
						<div className="flex items-center gap-2 text-muted-foreground">
							<User className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
							<span>{t("avatarCard.gender")}</span>
						</div>
						<span className="font-semibold text-foreground">
							{doctor.gender ? t("avatarCard.male") : t("avatarCard.female")}
						</span>
					</div>

					{/* CCCD / CMND */}
					<div className="flex items-start justify-between gap-2 py-1 border-b border-border/60">
						<div className="flex items-center gap-2 text-muted-foreground">
							<Fingerprint className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
							<span>{t("avatarCard.cccd")}</span>
						</div>
						<div className="flex items-center gap-1.5">
							<span className="font-semibold font-mono text-foreground">
								{showCccd
									? doctor.citizenIdentificationCard || t("notUpdated")
									: maskValue(doctor.citizenIdentificationCard, t)}
							</span>
							<button
								type="button"
								onClick={onToggleCccd}
								className="text-muted-foreground hover:text-foreground p-0.5 cursor-pointer transition-colors"
								title={
									showCccd
										? t("avatarCard.hideCccd")
										: t("avatarCard.showCccd")
								}
							>
								{showCccd ? (
									<EyeOff className="h-3.5 w-3.5" />
								) : (
									<Eye className="h-3.5 w-3.5" />
								)}
							</button>
						</div>
					</div>

					{/* Số điện thoại */}
					<div className="flex items-start justify-between gap-2 py-1 border-b border-border/60">
						<div className="flex items-center gap-2 text-muted-foreground">
							<Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
							<span>{t("avatarCard.phone")}</span>
						</div>
						{doctor.phoneNumber ? (
							<a
								href={`tel:${doctor.phoneNumber}`}
								className="font-semibold text-primary hover:underline"
							>
								{doctor.phoneNumber}
							</a>
						) : (
							<span className="font-semibold text-foreground">
								{t("notUpdated")}
							</span>
						)}
					</div>

					{/* Email */}
					<div className="flex items-start justify-between gap-2 py-1 border-b border-border/60">
						<div className="flex items-center gap-2 text-muted-foreground">
							<Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
							<span>{t("avatarCard.email")}</span>
						</div>
						<div className="flex items-center gap-1 max-w-[170px] justify-end">
							<span
								className="font-semibold text-foreground truncate"
								title={doctor.email}
							>
								{showEmail
									? doctor.email || t("notUpdated")
									: maskValue(doctor.email, t)}
							</span>
							<button
								type="button"
								onClick={onToggleEmail}
								className="text-muted-foreground hover:text-foreground p-0.5 shrink-0 cursor-pointer transition-colors"
								title={
									showEmail
										? t("avatarCard.hideEmail")
										: t("avatarCard.showEmail")
								}
							>
								{showEmail ? (
									<EyeOff className="h-3.5 w-3.5" />
								) : (
									<Eye className="h-3.5 w-3.5" />
								)}
							</button>
						</div>
					</div>

					{/* Địa chỉ */}
					<div className="pt-1">
						<div className="flex items-center gap-2 text-muted-foreground mb-1">
							<MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
							<span>{t("avatarCard.address")}</span>
						</div>
						<p className="font-medium text-foreground pl-5.5 leading-relaxed text-[11.5px]">
							{doctor.address || t("notUpdated")}
						</p>
					</div>
				</div>
			</div>

			<div className="my-5 border-t border-border" />

			{/* ── System Identification Info ── */}
			<div className="rounded-[10px] border border-border/60 bg-muted/50 p-3 text-[11px] text-muted-foreground space-y-1.5">
				<div className="flex items-center justify-between">
					<span className="flex items-center gap-1 text-muted-foreground">
						<IdCard className="h-3 w-3" />
						{t("avatarCard.profileId")}
					</span>
					<span
						className="font-mono font-medium text-foreground truncate max-w-[140px]"
						title={doctor.doctorId || doctor.id}
					>
						{doctor.doctorId || doctor.id || "N/A"}
					</span>
				</div>
				{doctor.accountId && (
					<div className="flex items-center justify-between">
						<span className="flex items-center gap-1 text-muted-foreground">
							<Fingerprint className="h-3 w-3" />
							{t("avatarCard.accountId")}
						</span>
						<span
							className="font-mono font-medium text-foreground truncate max-w-[140px]"
							title={doctor.accountId}
						>
							{doctor.accountId}
						</span>
					</div>
				)}
				{doctor.createdAt && (
					<div className="flex items-center justify-between">
						<span className="flex items-center gap-1 text-muted-foreground">
							<Calendar className="h-3 w-3" />
							{t("avatarCard.createdAt")}
						</span>
						<span className="font-medium text-foreground">
							{formatDate(doctor.createdAt, t)}
						</span>
					</div>
				)}
				<div className="flex items-center justify-between">
					<span className="flex items-center gap-1 text-muted-foreground">
						<CheckCircle2 className="h-3 w-3 text-emerald-500" />
						{t("avatarCard.accountStatus")}
					</span>
					<span className="font-medium text-emerald-600 dark:text-emerald-400">
						{doctor.accountStatus || t("avatarCard.activeStatus")}
					</span>
				</div>
			</div>
		</div>
	);
}