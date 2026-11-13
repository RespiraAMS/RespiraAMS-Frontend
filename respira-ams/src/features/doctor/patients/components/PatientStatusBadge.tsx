"use client";

import { useTranslations } from "next-intl";
import { PatientStatus } from "../types";
import { cn } from "@/lib/utils";

interface PatientStatusBadgeProps {
	status: PatientStatus;
	className?: string;
}

export function PatientStatusBadge({ status, className }: PatientStatusBadgeProps) {
	const t = useTranslations("doctor.patients");

	if (status === "treating") {
		return (
			<span
				className={cn(
					"inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#92400E]",
					className
				)}
			>
				<span className="h-1.5 w-1.5 rounded-full bg-[#D97706] shrink-0" />
				<span>{t("statusTreating")}</span>
			</span>
		);
	}

	if (status === "recovered") {
		return (
			<span
				className={cn(
					"inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#166534]",
					className
				)}
			>
				<span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] shrink-0" />
				<span>{t("statusRecovered")}</span>
			</span>
		);
	}

	if (status === "deceased") {
		return (
			<span
				className={cn(
					"inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#991B1B]",
					className
				)}
			>
				<span className="h-1.5 w-1.5 rounded-full bg-[#DC2626] shrink-0" />
				<span>{t("statusDeceased")}</span>
			</span>
		);
	}

	if (status === "outOfScope") {
		return (
			<span
				className={cn(
					"inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E2E8F0] text-[#475569]",
					className
				)}
			>
				<span className="h-1.5 w-1.5 rounded-full bg-[#64748B] shrink-0" />
				<span>{t("statusOutOfScope")}</span>
			</span>
		);
	}

	return null;
}
