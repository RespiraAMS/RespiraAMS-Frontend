"use client";

import Link from "next/link";
import { FileText, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PatientDetailWithPlans } from "../types";
import { calculateAge } from "../validation";

interface PatientContextHeaderProps {
	patient: PatientDetailWithPlans | null;
	patientId: string;
	isLoadingPatient?: boolean;
	hasPreviousDiagnosis?: boolean;
}

export function PatientContextHeader({
	patient,
	patientId,
	isLoadingPatient,
	hasPreviousDiagnosis,
}: PatientContextHeaderProps) {
	const t = useTranslations("doctor.diagnose");
	const age = calculateAge(patient?.dateOfBirth);

	const genderLabel =
		patient?.gender === "Male"
			? t("patientHeader.gender.male")
			: patient?.gender === "Female"
				? t("patientHeader.gender.female")
				: patient?.gender;

	return (
		<div className="mb-5 rounded-xl border border-border bg-card text-card-foreground p-4 shadow-sm">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-1">
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-xs font-semibold uppercase tracking-wider text-primary">
							{t("patientHeader.sectionTitle")}
						</span>
						{hasPreviousDiagnosis && (
							<Badge variant="secondary" className="text-[11px]">
								{t("patientHeader.previousDiagnosisRef")}
							</Badge>
						)}
					</div>

					{isLoadingPatient ? (
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Loader2 className="h-4 w-4 animate-spin text-primary" />
							<span>{t("patientHeader.loading")}</span>
						</div>
					) : (
						<div className="flex flex-wrap items-center gap-2">
							<h2 className="text-base font-bold text-foreground">
								{patient?.fullName ||
									t("patientHeader.fallbackId", { id: patientId })}
							</h2>
							{patient?.medicalRecordCode && (
								<Badge variant="secondary">
									{patient.medicalRecordCode}
								</Badge>
							)}
							{age !== undefined && (
								<Badge variant="outline" className="border-border">
									{t("patientHeader.age", { age })}
								</Badge>
							)}
							{genderLabel && (
								<Badge variant="outline" className="border-border">
									{genderLabel}
								</Badge>
							)}
							{patient?.height !== undefined &&
								patient?.weight !== undefined && (
									<Badge variant="outline" className="border-border">
										{t("patientHeader.measurements", {
											height: patient.height,
											weight: patient.weight,
										})}
									</Badge>
								)}
						</div>
					)}
				</div>

				{patientId && (
					<Button
						variant="outline"
						size="sm"
						asChild
						className="border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground self-start sm:self-auto"
					>
						<Link
							href={`/doctor/patients/${patientId}`}
							className="gap-1.5"
						>
							<FileText className="h-3.5 w-3.5" />
							{t("patientHeader.viewProfile")}
						</Link>
					</Button>
				)}
			</div>
		</div>
	);
}