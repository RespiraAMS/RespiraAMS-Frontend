"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Pencil, RefreshCw, ArrowLeft, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
	DoctorProfile,
	ProfileFormState,
	defaultDoctor,
	defaultFormState,
	DegreeTypeValue,
} from "../types";
import {
	fetchCurrentDoctorProfile,
	updateDoctorProfile,
	notifyDoctorProfileUpdated,
} from "../api";
import { ProfileStatsCards } from "./ProfileStatsCards";
import { ProfileAvatarCard } from "./ProfileAvatarCard";
import { ProfileQualificationsCard } from "./ProfileQualificationsCard";
import { ProfileEditModal } from "./ProfileEditModal";

export function ProfileView() {
	const t = useTranslations("doctor.profile");
	const queryClient = useQueryClient();

	const { data: profileData, isLoading } = useQuery({
		queryKey: ["doctor", "profile"],
		queryFn: fetchCurrentDoctorProfile,
	});

	// ── State ────────────────────────────────────────────────────────────────
	const [doctor, setDoctor] = useState<DoctorProfile>(defaultDoctor);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
	const [showEmail, setShowEmail] = useState(false);
	const [showCccd, setShowCccd] = useState(false);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);

	const [form, setForm] = useState<ProfileFormState>(defaultFormState);

	useEffect(() => {
		if (profileData) {
			setDoctor(profileData);
		}
	}, [profileData]);

	const handleRefresh = async () => {
		setIsRefreshing(true);
		try {
			await queryClient.invalidateQueries({ queryKey: ["doctor", "profile"] });
			toast.success(t("view.toast.refreshSuccess"));
		} catch (err) {
			toast.error(
				err instanceof Error
					? err.message
					: t("view.toast.refreshErrorFallback")
			);
		} finally {
			setIsRefreshing(false);
		}
	};

	// ── Handlers ─────────────────────────────────────────────────────────────
	const openEdit = () => {
		setForm({
			firstName: doctor.firstName,
			lastName: doctor.lastName,
			email: doctor.email,
			phoneNumber: doctor.phoneNumber,
			address: doctor.address,
			position: doctor.position,
			academicTitle: doctor.academicTitle,
			citizenIdentificationCard: doctor.citizenIdentificationCard,
			dateOfBirth: doctor.dateOfBirth,
			gender: doctor.gender,
			degrees: [...doctor.degrees] as DegreeTypeValue[],
			newPassword: "",
			confirmPassword: "",
		});
		setAvatarFile(null);
		setIsEditOpen(true);
	};

	const handleChange =
		(field: keyof ProfileFormState) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
			if (field === "gender") {
				setForm((prev) => ({ ...prev, gender: e.target.value === "true" }));
				return;
			}
			setForm((prev) => ({ ...prev, [field]: e.target.value }));
		};

	const handleDegreeToggle = (value: DegreeTypeValue) => {
		setForm((prev) => {
			const degrees = (prev.degrees || []) as DegreeTypeValue[];
			return {
				...prev,
				degrees: degrees.includes(value)
					? degrees.filter((d) => d !== value)
					: [...degrees, value],
			};
		});
	};

	const handleAvatarSelect = (file: File) => {
		setAvatarFile(file);
	};

	// Đổi avatar trực tiếp ngay tại chỗ khi click icon máy ảnh
	const handleAvatarDirectChange = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			toast.error(t("view.toast.invalidImageType"));
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			toast.error(t("view.toast.imageTooLarge"));
			return;
		}

		setIsUploadingAvatar(true);
		const previousProfile = { ...doctor };
		const previewUrl = URL.createObjectURL(file);
		setDoctor((prev) => ({
			...prev,
			mediaUrl: previewUrl,
			avatarUrl: previewUrl,
		}));

		try {
			const currentForm: ProfileFormState = {
				firstName: doctor.firstName,
				lastName: doctor.lastName,
				email: doctor.email,
				phoneNumber: doctor.phoneNumber,
				address: doctor.address,
				position: doctor.position,
				academicTitle: doctor.academicTitle,
				citizenIdentificationCard: doctor.citizenIdentificationCard,
				dateOfBirth: doctor.dateOfBirth,
				gender: doctor.gender,
				degrees: [...doctor.degrees] as DegreeTypeValue[],
			};

			const res = await updateDoctorProfile(doctor, currentForm, file);
			setDoctor(res.profile);
			notifyDoctorProfileUpdated(res.profile);
			queryClient.invalidateQueries({ queryKey: ["doctor", "profile"] });
			toast.success(t("view.toast.avatarSuccess"));
		} catch (err) {
			console.error("Error uploading avatar:", err);
			setDoctor(previousProfile);
			toast.error(t("view.toast.avatarError"));
		} finally {
			setIsUploadingAvatar(false);
		}
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSaving(true);

		try {
			const res = await updateDoctorProfile(doctor, form, avatarFile);
			setDoctor(res.profile);
			notifyDoctorProfileUpdated(res.profile);
			setAvatarFile(null);
			setIsEditOpen(false);
			queryClient.invalidateQueries({ queryKey: ["doctor", "profile"] });
			toast.success(t("view.toast.updateSuccess"));
		} catch (err) {
			toast.error(
				err instanceof Error
					? err.message
					: t("view.toast.updateErrorFallback")
			);
		} finally {
			setIsSaving(false);
		}
	};

	// ── Render ───────────────────────────────────────────────────────────────
	return (
		<div className="min-h-full bg-background text-foreground p-6 lg:p-8 space-y-5 max-w-[1300px] mx-auto">
			{/* Breadcrumb & Action Bar */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="space-y-1">
					<Link
						href="/doctor/patients"
						className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:text-primary/80 transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						<span>{t("view.backToHome")}</span>
					</Link>
					<h1 className="text-xl font-bold tracking-tight text-foreground">
						{t("view.title")}
					</h1>
					<p className="text-xs text-muted-foreground">
						{t("view.subtitle")}
					</p>
				</div>

				<div className="flex items-center gap-2">
					{/* Refresh Button */}
					<button
						type="button"
						onClick={handleRefresh}
						disabled={isLoading || isRefreshing}
						className="inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-accent hover:text-accent-foreground shadow-2xs transition-all cursor-pointer disabled:opacity-50"
						title={t("view.refreshTooltip")}
					>
						<RefreshCw
							className={`h-3.5 w-3.5 text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`}
						/>
						<span className="hidden sm:inline">{t("view.refreshButton")}</span>
					</button>

					{/* Edit Button */}
					<button
						type="button"
						id="btn-edit-doctor-profile"
						onClick={openEdit}
						className="inline-flex items-center gap-2 rounded-[10px] bg-primary hover:bg-primary/90 px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:shadow-md hover:shadow-primary/15 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
					>
						<Pencil className="h-3.5 w-3.5" />
						<span>{t("view.editButton")}</span>
					</button>
				</div>
			</div>

			{/* ── Summary Stats Cards ── */}
			<ProfileStatsCards doctor={doctor} />

			{/* ── Main Content Grid ── */}
			{isLoading ? (
				<div className="flex flex-col items-center justify-center py-20 bg-card text-card-foreground rounded-[14px] border border-border">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
					<p className="mt-3 text-xs font-medium text-muted-foreground">
						{t("view.loading")}
					</p>
				</div>
			) : (
				<div className="grid grid-cols-12 gap-5">
					{/* Left Column (Avatar & Personal Info) */}
					<div className="col-span-12 lg:col-span-4">
						<ProfileAvatarCard
							doctor={doctor}
							showEmail={showEmail}
							showCccd={showCccd}
							isUploadingAvatar={isUploadingAvatar}
							onToggleEmail={() => setShowEmail((v) => !v)}
							onToggleCccd={() => setShowCccd((v) => !v)}
							onAvatarChange={handleAvatarDirectChange}
						/>
					</div>

					{/* Right Column (Qualifications & Education) */}
					<div className="col-span-12 lg:col-span-8">
						<ProfileQualificationsCard doctor={doctor} />
					</div>
				</div>
			)}

			{/* ── Edit Modal ── */}
			{isEditOpen && (
				<ProfileEditModal
					form={form}
					isSaving={isSaving}
					currentAvatarUrl={doctor.mediaUrl || doctor.avatarUrl}
					onClose={() => setIsEditOpen(false)}
					onChange={handleChange}
					onDegreeToggle={handleDegreeToggle}
					onAvatarSelect={handleAvatarSelect}
					onSubmit={handleSubmit}
				/>
			)}
		</div>
	);
}