"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, UserPlus, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { diagnoseApi } from "../api";
import type {
	DiagnoseFormResponse,
	DiagnosisResultDto,
	PatientDetailWithPlans,
	SubmitDiagnosisRequest,
} from "../types";
import { parseDiagnosisJson } from "../validation";
import { PatientContextHeader } from "./PatientContextHeader";
import { CreatePatientModal } from "./CreatePatientModal";
import { DiagnoseAssessmentForm } from "./DiagnoseAssessmentForm";
import { DiagnoseResultView } from "./DiagnoseResultView";

export function DiagnoseWorkspace() {
	const t = useTranslations("doctor.diagnose");
	const searchParams = useSearchParams();
	const queryPatientId = searchParams.get("patientId")?.trim() || "";

	const [patient, setPatient] = useState<PatientDetailWithPlans | null>(null);
	const [patientId, setPatientId] = useState<string>(queryPatientId);
	const [previousDiagnosis, setPreviousDiagnosis] =
		useState<DiagnosisResultDto | null>(null);

	const [isLoadingPatient, setIsLoadingPatient] = useState<boolean>(
		Boolean(queryPatientId)
	);
	const [patientLoadError, setPatientLoadError] = useState<string | null>(null);

	const [isCreatePatientModalOpen, setIsCreatePatientModalOpen] =
		useState<boolean>(!queryPatientId);

	const [metadata, setMetadata] = useState<DiagnoseFormResponse | null>(null);
	const [isLoadingMeta, setIsLoadingMeta] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [diagnosisResult, setDiagnosisResult] =
		useState<DiagnosisResultDto | null>(null);

	useEffect(() => {
		if (!queryPatientId) {
			setIsCreatePatientModalOpen(true);
			setIsLoadingPatient(false);
			return;
		}

		setPatientId(queryPatientId);
		setIsCreatePatientModalOpen(false);

		let active = true;
		(async () => {
			try {
				setIsLoadingPatient(true);
				setPatientLoadError(null);

				const patientData = await diagnoseApi.getPatientDetail(queryPatientId);
				if (!active) return;
				setPatient(patientData);

				const plans = patientData.treatmentPlans;
				if (Array.isArray(plans) && plans.length > 0) {
					const lastPlan = plans[plans.length - 1];
					if (lastPlan?.id) {
						const planDetail = await diagnoseApi.getTreatmentPlanDetail(
							lastPlan.id
						);
						if (!active) return;
						const parsedDiag = parseDiagnosisJson(planDetail.diagnosis);
						setPreviousDiagnosis(parsedDiag);
					}
				}
			} catch (err) {
				if (active) {
					setPatientLoadError(
						err instanceof Error
							? err.message
							: t("workspace.errors.loadPatientFallback")
					);
				}
			} finally {
				if (active) setIsLoadingPatient(false);
			}
		})();

		return () => {
			active = false;
		};
	}, [queryPatientId, t]);

	useEffect(() => {
		let active = true;
		(async () => {
			try {
				setIsLoadingMeta(true);
				const data = await diagnoseApi.getFormMetadata();
				if (active) setMetadata(data);
			} catch (err) {
				if (active) {
					setLoadError(
						err instanceof Error
							? err.message
							: t("workspace.errors.loadMetaFallback")
					);
				}
			} finally {
				if (active) setIsLoadingMeta(false);
			}
		})();

		return () => {
			active = false;
		};
	}, [t]);

	const handleSubmitDiagnosis = async (payload: SubmitDiagnosisRequest) => {
		setIsSubmitting(true);
		setSubmitError(null);
		try {
			const result = await diagnoseApi.submitDiagnosis(payload);
			setDiagnosisResult(result);
		} catch (err) {
			setSubmitError(
				err instanceof Error
					? err.message
					: t("workspace.errors.submitFallback")
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const isReadyToDiagnose =
		Boolean(patientId) && !isLoadingPatient && !isLoadingMeta;

	return (
		<div className="mx-auto max-w-6xl px-4 py-6 text-foreground">
			<div className="mb-5">
				<h1 className="text-xl font-bold text-foreground">
					{t("workspace.title")}
				</h1>
				<p className="mt-1 text-xs text-muted-foreground">
					{t("workspace.subtitle")}
				</p>
			</div>

			{!patientId ? (
				<div className="rounded-xl border border-dashed border-border bg-card text-card-foreground p-8 text-center shadow-sm space-y-4">
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
						<UserPlus className="h-6 w-6" />
					</div>
					<div className="space-y-1">
						<h2 className="text-base font-bold text-foreground">
							{t("workspace.noPatient.title")}
						</h2>
						<p className="mx-auto max-w-md text-xs text-muted-foreground">
							{t("workspace.noPatient.description")}
						</p>
					</div>
					<div className="flex flex-wrap items-center justify-center gap-2 pt-1">
						<Button
							variant="outline"
							asChild
							className="gap-1.5 border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
						>
							<Link href="/doctor/patients">
								<ArrowLeft className="h-4 w-4" />
								{t("workspace.noPatient.backToList")}
							</Link>
						</Button>
						<Button
							type="button"
							onClick={() => setIsCreatePatientModalOpen(true)}
							className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
						>
							<UserPlus className="h-4 w-4" />
							{t("workspace.noPatient.createButton")}
						</Button>
					</div>
				</div>
			) : (
				<>
					<PatientContextHeader
						patient={patient}
						patientId={patientId}
						isLoadingPatient={isLoadingPatient}
						hasPreviousDiagnosis={Boolean(previousDiagnosis)}
					/>

					{patientLoadError && (
						<div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3.5 text-xs font-medium text-destructive">
							{t("workspace.errors.patientLoadPrefix", {
								error: patientLoadError,
							})}
						</div>
					)}

					{submitError && (
						<div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3.5 text-xs font-medium text-destructive">
							{submitError}
						</div>
					)}

					{(isLoadingMeta || isLoadingPatient) && (
						<div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card text-card-foreground p-10 text-sm text-muted-foreground">
							<Loader2 className="h-4 w-4 animate-spin text-primary" />
							<span>{t("workspace.loading")}</span>
						</div>
					)}

					{loadError && (
						<div className="rounded-xl border border-destructive/40 bg-destructive/10 p-5 text-sm font-medium text-destructive">
							{t("workspace.errors.dataLoadPrefix", {
								error: loadError,
							})}
						</div>
					)}

					{isReadyToDiagnose && metadata && !diagnosisResult && (
						<DiagnoseAssessmentForm
							metadata={metadata}
							patient={patient}
							previousDiagnosis={previousDiagnosis}
							isSubmitting={isSubmitting}
							onSubmit={handleSubmitDiagnosis}
						/>
					)}

					{isReadyToDiagnose && metadata && diagnosisResult && (
						<DiagnoseResultView
							patientId={patientId}
							diagnosis={diagnosisResult}
							allAntibiotics={metadata.antibiotics}
							onResetDiagnosis={() => setDiagnosisResult(null)}
						/>
					)}
				</>
			)}

			{!patientId && (
				<CreatePatientModal
					open={isCreatePatientModalOpen}
					onOpenChange={setIsCreatePatientModalOpen}
					onCreated={(createdPatient) => {
						setPatient(createdPatient);
						setPatientId(createdPatient.id);
						setIsCreatePatientModalOpen(false);
					}}
				/>
			)}
		</div>
	);
}