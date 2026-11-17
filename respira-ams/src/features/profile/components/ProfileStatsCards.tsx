"use client";

import { Building2, GraduationCap, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import {
	DoctorProfile,
	getPositionLabel,
	getAcademicTitleLabel,
	getDegreeLabel,
	getRoleLabel,
} from "../types";

interface ProfileStatsCardsProps {
	doctor: DoctorProfile;
}

export function ProfileStatsCards({ doctor }: ProfileStatsCardsProps) {
	const t = useTranslations("doctor.profile");

	const positionText = getPositionLabel(doctor.position || "StaffDoctor", t);
	const roleText = getRoleLabel(doctor.role || "Doctor", t);
	const hasAcademicTitle =
		doctor.academicTitle && doctor.academicTitle !== "None";
	const academicTitleText = hasAcademicTitle
		? getAcademicTitleLabel(doctor.academicTitle, t)
		: null;
	const primaryDegree = doctor.degrees?.[0]
		? getDegreeLabel(doctor.degrees[0], t)
		: t("fallbackDoctor");

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
			{/* Card 1: Chức vụ & Khoa công tác */}
			<div className="bg-card text-card-foreground rounded-[12px] px-5 py-4 text-left border border-border shadow-2xs hover:shadow-xs transition-all">
				<div className="flex items-center justify-between">
					<p className="text-[10.5px] font-bold text-muted-foreground uppercase tracking-wider">
						{t("statsCards.positionTitle")}
					</p>
					<div className="h-7 w-7 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center">
						<Building2 className="h-3.5 w-3.5" />
					</div>
				</div>
				<p className="text-lg font-bold text-foreground mt-1.5 tracking-tight truncate">
					{positionText}
				</p>
				<p className="text-[11.5px] font-medium text-muted-foreground truncate mt-0.5">
					{roleText}
				</p>
				<div className="h-1 w-20 bg-sky-500 rounded-full mt-2.5" />
			</div>

			{/* Card 2: Trình độ & Bằng cấp cao nhất */}
			<div className="bg-card text-card-foreground rounded-[12px] px-5 py-4 text-left border border-border shadow-2xs hover:shadow-xs transition-all">
				<div className="flex items-center justify-between">
					<p className="text-[10.5px] font-bold text-muted-foreground uppercase tracking-wider">
						{t("statsCards.educationTitle")}
					</p>
					<div className="h-7 w-7 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
						<GraduationCap className="h-3.5 w-3.5" />
					</div>
				</div>
				<p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1.5 tracking-tight truncate">
					{primaryDegree}
					{academicTitleText ? ` • ${academicTitleText}` : ""}
				</p>
				<p className="text-[11.5px] font-medium text-muted-foreground truncate mt-0.5">
					{t("statsCards.degreesRecorded", {
						count: doctor.degrees?.length || 1,
					})}
				</p>
				<div className="h-1 w-14 bg-indigo-500 rounded-full mt-2.5" />
			</div>

			{/* Card 3: Trạng thái chứng chỉ & Xác thực */}
			<div className="bg-card text-card-foreground rounded-[12px] px-5 py-4 text-left border border-border shadow-2xs hover:shadow-xs transition-all">
				<div className="flex items-center justify-between">
					<p className="text-[10.5px] font-bold text-muted-foreground uppercase tracking-wider">
						{t("statsCards.statusTitle")}
					</p>
					<div className="h-7 w-7 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
						<ShieldCheck className="h-3.5 w-3.5" />
					</div>
				</div>
				<div className="flex items-center gap-2 mt-1.5">
					<span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
						<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
						{doctor.accountStatus
							? t("statsCards.activeWithStatus", {
									status: doctor.accountStatus,
								})
							: t("avatarCard.activeStatus")}
					</span>
				</div>
				<p className="text-[11.5px] font-medium text-muted-foreground truncate mt-1">
					{t("statsCards.accountLabel", {
						account: doctor.email || t("statsCards.ssoLinked"),
					})}
				</p>
				<div className="h-1 w-10 bg-emerald-500 rounded-full mt-2.5" />
			</div>
		</div>
	);
}