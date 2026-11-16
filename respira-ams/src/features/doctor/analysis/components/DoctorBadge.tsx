"use client";

import { Building2, UserCheck, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useDoctorDetail } from "../queries";

interface DoctorBadgeProps {
	doctorId: string | null;
	variant?: "badge" | "inline";
}

export function DoctorBadge({ doctorId, variant = "badge" }: DoctorBadgeProps) {
	const t = useTranslations("doctor.analysis.doctorBadge");
	const { data: doctor, isLoading } = useDoctorDetail(doctorId);

	if (!doctorId) {
		if (variant === "inline") {
			return (
				<span className="inline-flex items-center gap-1.5 font-semibold text-primary">
					<Building2 className="h-4 w-4" />
					{t("generalReport")}
				</span>
			);
		}
		return (
			<span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 border border-primary/25 px-2.5 py-1 text-xs font-semibold text-primary">
				<Building2 className="h-3.5 w-3.5" />
				{t("general")}
			</span>
		);
	}

	if (isLoading) {
		return (
			<span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
				<Loader2 className="h-3.5 w-3.5 animate-spin" />
				{t("loading")}
			</span>
		);
	}

	const getPrefix = (academicTitle?: string) => {
		if (academicTitle === "Professor") return t("prefixes.Professor");
		if (academicTitle === "AssociateProfessor")
			return t("prefixes.AssociateProfessor");
		return t("prefixes.Default");
	};

	const fullName = doctor
		? `${getPrefix(doctor.academicTitle)} ${doctor.lastName} ${doctor.firstName}`.trim()
		: t("fallbackName", { id: doctorId.slice(0, 8) });

	if (variant === "inline") {
		return (
			<span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
				<UserCheck className="h-4 w-4 text-sky-600 dark:text-sky-400" />
				{fullName}
			</span>
		);
	}

	return (
		<span className="inline-flex items-center gap-1.5 rounded-md bg-sky-500/15 border border-sky-500/30 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300">
			<UserCheck className="h-3.5 w-3.5" />
			{fullName}
		</span>
	);
}