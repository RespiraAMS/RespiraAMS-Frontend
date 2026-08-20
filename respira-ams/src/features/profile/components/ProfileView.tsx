"use client";

import { type FormEvent, useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
	DoctorProfile,
	ProfileFormState,
	defaultDoctor,
	defaultFormState,
} from "../types";
import { ProfileAvatarCard } from "./ProfileAvatarCard";
import { ProfileQualificationsCard } from "./ProfileQualificationsCard";
import { ProfileEditModal } from "./ProfileEditModal";

export function ProfileView() {
	// ── State ────────────────────────────────────────────────────────────────
	const [doctor, setDoctor] = useState<DoctorProfile>(defaultDoctor);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [showEmail, setShowEmail] = useState(false);
	const [showCccd, setShowCccd] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [form, setForm] = useState<ProfileFormState>(defaultFormState);

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
			degrees: doctor.degrees,
		});
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

	const handleDegreeToggle = (value: string) => {
		setForm((prev) => ({
			...prev,
			degrees: prev.degrees.includes(value)
				? prev.degrees.filter((d) => d !== value)
				: [...prev.degrees, value],
		}));
	};

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			setError("Vui lòng chọn tệp hình ảnh hợp lệ.");
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			setError("Kích thước ảnh không được vượt quá 5MB.");
			return;
		}

		const previewUrl = URL.createObjectURL(file);
		setDoctor((prev) => ({ ...prev, mediaUrl: previewUrl }));
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSaving(true);
		setError(null);

		// Simulate API call delay (UI only)
		await new Promise((res) => setTimeout(res, 800));

		setDoctor((prev) => ({
			...prev,
			...form,
			degree: form.degrees.join(", "),
		}));
		setIsSaving(false);
		setIsEditOpen(false);
	};

	// ── Render ───────────────────────────────────────────────────────────────
	return (
		<div className="min-h-screen bg-gray-50 p-6">
			{/* Page header */}
			<div className="mb-6 flex items-start justify-between gap-4">
				<div>
					<h1 className="text-3xl font-semibold text-[#003461]">
						Thông tin Bác sĩ
					</h1>
					<p className="mt-1 text-sm text-gray-500">
						Xem và quản lý thông tin chứng chỉ hành nghề và thông tin cá nhân
						của bác sĩ.
					</p>
				</div>

				<Button
					type="button"
					id="profile-edit-open"
					className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#0A3D73] px-6 text-white font-medium hover:bg-[#0D4D8C]"
					onClick={openEdit}
				>
					<Pencil size={16} />
					Chỉnh sửa
				</Button>
			</div>

			<div className="mt-4 border-b-2 border-gray-200" />

			{/* Error banner */}
			{error && (
				<div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					{error}
				</div>
			)}

			{/* Main grid */}
			<div className="mt-6 grid grid-cols-12 gap-6">
				{/* Left column – avatar card */}
				<div className="col-span-12 md:col-span-4">
					<ProfileAvatarCard
						doctor={doctor}
						showEmail={showEmail}
						showCccd={showCccd}
						onToggleEmail={() => setShowEmail((v) => !v)}
						onToggleCccd={() => setShowCccd((v) => !v)}
						onAvatarChange={handleAvatarChange}
					/>
				</div>

				{/* Right column – qualifications card */}
				<div className="col-span-12 md:col-span-8 space-y-6">
					<ProfileQualificationsCard doctor={doctor} />
				</div>
			</div>

			{/* Edit modal */}
			{isEditOpen && (
				<ProfileEditModal
					form={form}
					isSaving={isSaving}
					onClose={() => setIsEditOpen(false)}
					onChange={handleChange}
					onDegreeToggle={handleDegreeToggle}
					onSubmit={handleSubmit}
				/>
			)}
		</div>
	);
}
