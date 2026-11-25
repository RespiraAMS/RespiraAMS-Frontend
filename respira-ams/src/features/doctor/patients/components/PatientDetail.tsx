"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
	AlertTriangle,
	ArrowLeft,
	CheckCircle2,
	Clock,
	Copy,
	Edit,
	Loader2,
	LogOut,
	Phone,
	Plus,
	ShieldCheck,
	Trash,
	XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { cn } from "@/lib/utils";
import {
	usePatientDetail,
	usePatientMutations,
	useNextOfKinMutations,
	useTreatmentPlanMutations,
} from "../queries";
import { PatientForm } from "./PatientForm";
import { DischargePatientDialog } from "./DischargePatientDialog";
import { NextOfKinFormDialog } from "./NextOfKinFormDialog";
import {
	type UpdatePatientRequest,
	type TreatmentOutcome,
	type NextOfKinItem,
	type NextOfKinRequest,
	type PatientTreatmentPlanItem,
	type AdherenceState,
} from "../types";
import {
	CloseTreatmentPlanDialog,
	ReviewTreatmentPlanDialog,
	TreatmentPlanDetailDialog,
} from "../treatment-plans";

function calculateAge(dobString: string): number {
	const dob = new Date(dobString);
	if (Number.isNaN(dob.getTime())) return 0;
	const today = new Date();
	let age = today.getFullYear() - dob.getFullYear();
	const m = today.getMonth() - dob.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
		age--;
	}
	return age;
}

function formatDateLocalized(dateString: string | null | undefined, locale: string): string {
	if (!dateString) return "—";
	const d = new Date(dateString);
	if (Number.isNaN(d.getTime())) return dateString;
	const dateLocale = locale === "en" ? "en-GB" : "vi-VN";
	return d.toLocaleDateString(dateLocale, {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

function formatDateTimeLocalized(
	isoString: string | null | undefined,
	emptyText: string,
	locale: string
): string {
	if (!isoString) return emptyText;
	const d = new Date(isoString);
	if (Number.isNaN(d.getTime())) return isoString;
	const dateLocale = locale === "en" ? "en-GB" : "vi-VN";
	const time = d.toLocaleTimeString(dateLocale, {
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "Asia/Ho_Chi_Minh",
	});
	const date = d.toLocaleDateString(dateLocale, {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		timeZone: "Asia/Ho_Chi_Minh",
	});
	return `${time} - ${date}`;
}

function calculateBMI(
	heightCm: number,
	weightKg: number,
	labels: {
		unknown: string;
		underweight: string;
		normal: string;
		overweight: string;
	}
) {
	if (!heightCm || heightCm <= 0) {
		return {
			value: "0.0",
			label: labels.unknown,
			color: "text-muted-foreground bg-muted border-border",
		};
	}
	const h = heightCm / 100;
	const bmiNum = weightKg / (h * h);
	const value = bmiNum.toFixed(1);

	if (bmiNum < 18.5) {
		return {
			value,
			label: labels.underweight,
			color: "text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/30",
		};
	}
	if (bmiNum < 23) {
		return {
			value,
			label: labels.normal,
			color: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
		};
	}
	return {
		value,
		label: labels.overweight,
		color: "text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/30",
	};
}

function AdherenceBadge({ state }: { state: AdherenceState }) {
	const tAdherence = useTranslations("doctor.patients.detail.adherence");

	switch (state) {
		case "Adhere":
			return (
				<span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
					<CheckCircle2 className="w-3.5 h-3.5" />
					{tAdherence("Adhere")}
				</span>
			);
		case "NotAdhere":
			return (
				<span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
					<AlertTriangle className="w-3.5 h-3.5" />
					{tAdherence("NotAdhere")}
				</span>
			);
		case "NotAdhereValid":
			return (
				<span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
					<ShieldCheck className="w-3.5 h-3.5" />
					{tAdherence("NotAdhereValid")}
				</span>
			);
		case "NotAdhereInvalid":
			return (
				<span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
					<XCircle className="w-3.5 h-3.5" />
					{tAdherence("NotAdhereInvalid")}
				</span>
			);
		default:
			return null;
	}
}

function HeaderOutcomeBadge({ outcome }: { outcome: TreatmentOutcome }) {
	const tOutcome = useTranslations("doctor.patients.outcomes");

	switch (outcome) {
		case "InTreatment":
			return (
				<span className="inline-flex items-center gap-1.5 px-3 py-0.5 text-xs font-semibold rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
					<span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
					{tOutcome("InTreatment")}
				</span>
			);
		case "Recovered":
			return (
				<span className="px-3 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
					{tOutcome("Recovered")}
				</span>
			);
		case "Death":
			return (
				<span className="px-3 py-0.5 text-xs font-semibold rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
					{tOutcome("Death")}
				</span>
			);
		case "OutOfScope":
			return (
				<span className="px-3 py-0.5 text-xs font-semibold rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
					{tOutcome("OutOfScope")}
				</span>
			);
		default:
			return null;
	}
}

interface PatientDetailProps {
	id: string;
	isHeadDepartmentDoctor?: boolean;
}

export function PatientDetail({ id, isHeadDepartmentDoctor = false }: PatientDetailProps) {
	const router = useRouter();
	const locale = useLocale();
	const tDetail = useTranslations("doctor.patients.detail");
	const tDialog = useTranslations("doctor.patients.dialog");
	const tToast = useTranslations("doctor.patients.toast");
	const tGender = useTranslations("doctor.patients.gender");
	const tCommon = useTranslations("common");

	const { data: patient, isLoading } = usePatientDetail(id);
	const { updateMutation, deleteMutation, dischargeMutation } = usePatientMutations();
	const { addKinMutation, updateKinMutation, deleteKinMutation } = useNextOfKinMutations(id);
	const { closePlanMutation, reviewPlanMutation } = useTreatmentPlanMutations(id);

	const [isUpdateOpen, setIsUpdateOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [isDischargeOpen, setIsDischargeOpen] = useState(false);

	const [kinModalOpen, setKinModalOpen] = useState(false);
	const [editingKin, setEditingKin] = useState<NextOfKinItem | null>(null);
	const [kinToDelete, setKinToDelete] = useState<NextOfKinItem | null>(null);

	const [planFilter, setPlanFilter] = useState<"ALL" | "IN_PROGRESS" | "NOT_ADHERE">("ALL");
	const [detailPlanId, setDetailPlanId] = useState<string | null>(null);
	const [closingPlanId, setClosingPlanId] = useState<string | null>(null);
	const [reviewingPlan, setReviewingPlan] = useState<PatientTreatmentPlanItem | null>(null);

	const treatmentPlans = patient?.treatmentPlans;
	const sortedPlans = useMemo(() => {
		if (!treatmentPlans) return [];
		return treatmentPlans;
	}, [treatmentPlans]);

	const inProgressCount = useMemo(
		() => sortedPlans.filter((p) => p.treatmentPlanStatus === 0).length,
		[sortedPlans]
	);

	const notAdhereCount = useMemo(
		() => sortedPlans.filter((p) => p.adherenceState === "NotAdhere").length,
		[sortedPlans]
	);

	const filteredPlans = useMemo(() => {
		return sortedPlans.filter((plan) => {
			if (planFilter === "IN_PROGRESS") return plan.treatmentPlanStatus === 0;
			if (planFilter === "NOT_ADHERE") return plan.adherenceState === "NotAdhere";
			return true;
		});
	}, [sortedPlans, planFilter]);

	const copyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text);
		toast.success(tDetail("toast.copied", { label, text }));
	};

	if (isLoading) {
		return (
			<div className="flex justify-center py-16">
				<Loader2 className="animate-spin w-8 h-8 text-primary" />
			</div>
		);
	}

	if (!patient) {
		return (
			<div className="text-center py-16 text-destructive font-medium">
				{tDetail("notFound")}
			</div>
		);
	}

	const age = calculateAge(patient.dateOfBirth);
	const genderLabel = tGender(patient.gender);
	const bmi = calculateBMI(patient.height, patient.weight, {
		unknown: tDetail("bmi.unknown"),
		underweight: tDetail("bmi.underweight"),
		normal: tDetail("bmi.normal"),
		overweight: tDetail("bmi.overweight"),
	});
	const notDischargedLabel = tDetail("notDischarged");

	const handleUpdateSubmit = (data: UpdatePatientRequest) => {
		updateMutation.mutate(
			{ id, data },
			{
				onSuccess: () => {
					setIsUpdateOpen(false);
					toast.success(tToast("updateSuccess"));
				},
				onError: (err) => toast.error(tToast("updateError", { error: err.message })),
			}
		);
	};

	const handleDeletePatient = () => {
		deleteMutation.mutate(id, {
			onSuccess: () => {
				toast.success(tDetail("toast.deleteSuccess"));
				router.push("/doctor/patients");
			},
			onError: (err) => toast.error(tToast("deleteError", { error: err.message })),
		});
	};

	const handleDischargeConfirm = (outcome: TreatmentOutcome) => {
		dischargeMutation.mutate(
			{ id, outcome },
			{
				onSuccess: () => {
					setIsDischargeOpen(false);
					toast.success(tToast("dischargeSuccess"));
				},
				onError: (err) => toast.error(tToast("dischargeError", { error: err.message })),
			}
		);
	};

	const openAddKin = () => {
		setEditingKin(null);
		setKinModalOpen(true);
	};

	const openEditKin = (kin: NextOfKinItem) => {
		setEditingKin(kin);
		setKinModalOpen(true);
	};

	const handleKinSubmit = (data: NextOfKinRequest) => {
		if (editingKin) {
			updateKinMutation.mutate(
				{ nextOfKinId: editingKin.id, data },
				{
					onSuccess: () => {
						setKinModalOpen(false);
						setEditingKin(null);
						toast.success(tDetail("toast.kinUpdateSuccess"));
					},
					onError: (err) =>
						toast.error(tDetail("toast.kinUpdateError", { error: err.message })),
				}
			);
		} else {
			addKinMutation.mutate(data, {
				onSuccess: () => {
					setKinModalOpen(false);
					toast.success(tDetail("toast.kinCreateSuccess"));
				},
				onError: (err) =>
					toast.error(tDetail("toast.kinCreateError", { error: err.message })),
			});
		}
	};

	const handleDeleteKin = () => {
		if (!kinToDelete) return;
		deleteKinMutation.mutate(kinToDelete.id, {
			onSuccess: () => {
				setKinToDelete(null);
				toast.success(tDetail("toast.kinDeleteSuccess"));
			},
			onError: (err) =>
				toast.error(tDetail("toast.kinDeleteError", { error: err.message })),
		});
	};

	const handleClosePlan = (planId: string, reason: string) => {
		closePlanMutation.mutate(
			{ planId, data: { reason } },
			{
				onSuccess: () => {
					setClosingPlanId(null);
					toast.success(tDetail("toast.planCloseSuccess"));
				},
				onError: (err) =>
					toast.error(tDetail("toast.planCloseError", { error: err.message })),
			}
		);
	};

	const handleReviewPlan = (planId: string, adherenceState: AdherenceState) => {
		reviewPlanMutation.mutate(
			{ planId, data: { adherenceState } },
			{
				onSuccess: () => {
					setReviewingPlan(null);
					toast.success(tDetail("toast.planReviewSuccess"));
				},
				onError: (err) =>
					toast.error(tDetail("toast.planReviewError", { error: err.message })),
			}
		);
	};

	return (
		<div className="max-w-6xl mx-auto space-y-6 text-foreground">
			{/* Patient Header Card */}
			<section className="bg-card text-card-foreground rounded-xl border border-border shadow-sm p-5 md:p-6">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border">
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => router.push("/doctor/patients")}
							className="hover:bg-accent text-foreground rounded-full shrink-0"
							title={tDetail("backButton")}
						>
							<ArrowLeft className="w-5 h-5" />
						</Button>

						<div>
							<div className="flex flex-wrap items-center gap-2.5">
								<h1 className="text-2xl font-bold text-foreground">
									{patient.fullName}
								</h1>
								<span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground border border-border">
									{tDetail("genderAge", { gender: genderLabel, age })}
								</span>
								<HeaderOutcomeBadge outcome={patient.treatmentOutcome} />
							</div>
							<p className="text-sm text-muted-foreground mt-1">
								{tDetail("dob", {
									date: formatDateLocalized(patient.dateOfBirth, locale),
								})}
							</p>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setIsDischargeOpen(true)}
							disabled={patient.treatmentOutcome !== "InTreatment"}
							className="border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
						>
							<LogOut className="w-4 h-4 mr-1.5" /> {tDetail("actions.discharge")}
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={patient.treatmentOutcome !== "InTreatment"}
							onClick={() => router.push(`/doctor/diagnose?patientId=${patient.id}`)}
							className="border-border text-foreground hover:bg-accent"
						>
							<Plus className="w-4 h-4 mr-1.5 text-amber-600 dark:text-amber-400" />{" "}
							{tDetail("actions.addTreatment")}
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setIsUpdateOpen(true)}
							className="border-border text-foreground hover:bg-accent"
						>
							<Edit className="w-4 h-4 mr-1.5 text-blue-600 dark:text-blue-400" />{" "}
							{tDetail("actions.edit")}
						</Button>
						<Button
							variant="destructive"
							size="sm"
							onClick={() => setIsDeleteOpen(true)}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							<Trash className="w-4 h-4 mr-1.5" /> {tDetail("actions.delete")}
						</Button>
					</div>
				</div>

				{/* Metadata Bar */}
				<div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-sm">
					<div className="flex items-center justify-between sm:justify-start gap-2 bg-muted/50 dark:bg-muted/30 px-3.5 py-2 rounded-lg border border-border">
						<span className="text-muted-foreground">
							{tDetail("meta.medicalRecordCode")}
						</span>
						<span className="font-semibold text-foreground font-mono">
							{patient.medicalRecordCode}
						</span>
						<button
							type="button"
							onClick={() =>
								copyToClipboard(
									patient.medicalRecordCode,
									tDetail("meta.medicalRecordCodeShort")
								)
							}
							title={tDetail("meta.copyMedicalRecordCode")}
							className="text-muted-foreground hover:text-primary ml-auto sm:ml-1 transition-colors"
						>
							<Copy className="w-3.5 h-3.5" />
						</button>
					</div>

					<div className="flex items-center justify-between sm:justify-start gap-2 bg-muted/50 dark:bg-muted/30 px-3.5 py-2 rounded-lg border border-border">
						<span className="text-muted-foreground">
							{tDetail("meta.healthInsuranceCard")}
						</span>
						<span className="font-semibold text-foreground font-mono">
							{patient.healthInsuranceCard}
						</span>
						<button
							type="button"
							onClick={() =>
								copyToClipboard(
									patient.healthInsuranceCard,
									tDetail("meta.healthInsuranceCardShort")
								)
							}
							title={tDetail("meta.copyHealthInsuranceCard")}
							className="text-muted-foreground hover:text-primary ml-auto sm:ml-1 transition-colors"
						>
							<Copy className="w-3.5 h-3.5" />
						</button>
					</div>

					<div className="flex items-center justify-between sm:justify-start gap-2 bg-muted/50 dark:bg-muted/30 px-3.5 py-2 rounded-lg border border-border">
						<span className="text-muted-foreground">{tDetail("meta.admission")}</span>
						<span className="font-semibold text-foreground">
							{formatDateTimeLocalized(
								patient.admission,
								notDischargedLabel,
								locale
							)}
						</span>
					</div>
					<div className="flex items-center justify-between sm:justify-start gap-2 bg-muted/50 dark:bg-muted/30 px-3.5 py-2 rounded-lg border border-border">
						<span className="text-muted-foreground">{tDetail("meta.discharge")}</span>
						<span className="font-semibold text-foreground">
							{formatDateTimeLocalized(
								patient.discharge,
								notDischargedLabel,
								locale
							)}
						</span>
					</div>
				</div>
			</section>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
				{/* Left Column */}
				<div className="lg:col-span-4 space-y-6">
					{/* Biometrics Card */}
					<div className="bg-card text-card-foreground rounded-xl border border-border shadow-sm p-5">
						<h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
							{tDetail("biometrics.title")}
						</h2>
						<div className="grid grid-cols-2 gap-3 mb-3">
							<div className="p-3 rounded-lg bg-muted/40 dark:bg-muted/25 border border-border">
								<div className="text-xs text-muted-foreground">
									{tDetail("biometrics.height")}
								</div>
								<div className="text-xl font-bold text-foreground mt-0.5">
									{patient.height}{" "}
									<span className="text-xs font-normal text-muted-foreground">
										cm
									</span>
								</div>
							</div>
							<div className="p-3 rounded-lg bg-muted/40 dark:bg-muted/25 border border-border">
								<div className="text-xs text-muted-foreground">
									{tDetail("biometrics.weight")}
								</div>
								<div className="text-xl font-bold text-foreground mt-0.5">
									{patient.weight}{" "}
									<span className="text-xs font-normal text-muted-foreground">
										kg
									</span>
								</div>
							</div>
						</div>
						<div
							className={cn(
								"flex items-center justify-between p-3 rounded-lg border",
								bmi.color
							)}
						>
							<div>
								<div className="text-xs opacity-80">{tDetail("biometrics.bmi")}</div>
								<div className="text-lg font-bold">
									{bmi.value} <span className="text-xs font-normal">kg/m²</span>
								</div>
							</div>
							<span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-background/80 border border-border/50">
								{bmi.label}
							</span>
						</div>
					</div>

					{/* Contact Info Card */}
					<div className="bg-card text-card-foreground rounded-xl border border-border shadow-sm p-5">
						<h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
							{tDetail("contact.title")}
						</h2>
						<dl className="space-y-3.5 text-sm">
							<div className="flex items-center justify-between">
								<dt className="text-muted-foreground">{tDetail("contact.phone")}</dt>
								<dd>
									<a
										href={`tel:${patient.phoneNumber}`}
										className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline font-mono"
									>
										<Phone className="w-3.5 h-3.5" />
										{patient.phoneNumber}
									</a>
								</dd>
							</div>
							<div className="flex items-start justify-between gap-4">
								<dt className="text-muted-foreground shrink-0">
									{tDetail("contact.address")}
								</dt>
								<dd className="font-medium text-foreground text-right">
									{patient.address}, {patient.city}
								</dd>
							</div>
						</dl>
					</div>

					{/* Next of Kin Card */}
					<div className="bg-card text-card-foreground rounded-xl border border-border shadow-sm p-5">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									{tDetail("nextOfKinSection.title")}
								</h2>
								<span className="text-xs font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
									{patient.nextOfKins.length}
								</span>
							</div>

							<Button
								type="button"
								size="sm"
								variant="outline"
								onClick={openAddKin}
								className="h-7 px-2.5 text-xs gap-1 border-border text-foreground hover:bg-accent"
							>
								<Plus className="w-3.5 h-3.5" />{" "}
								{tDetail("nextOfKinSection.addButton")}
							</Button>
						</div>

						{patient.nextOfKins.length === 0 ? (
							<div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
								{tDetail("nextOfKinSection.empty")}
							</div>
						) : (
							<div className="space-y-3">
								{patient.nextOfKins.map((kin) => (
									<div
										key={kin.id}
										className="p-3 rounded-lg border border-border bg-muted/30 dark:bg-muted/20 flex items-center justify-between gap-2"
									>
										<div className="min-w-0">
											<div className="flex flex-wrap items-center gap-1.5">
												<span className="font-semibold text-sm text-foreground truncate">
													{kin.fullName}
												</span>
												<span className="text-[11px] font-medium px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
													{kin.relationship}
												</span>
											</div>
											<div className="text-xs text-muted-foreground mt-1 font-mono">
												{kin.phoneNumber}
											</div>
										</div>

										<div className="flex items-center gap-1 shrink-0">
											<a
												href={`tel:${kin.phoneNumber}`}
												title={tDetail("nextOfKinSection.callTitle", {
													name: kin.fullName,
												})}
												className="p-1.5 rounded-md bg-background border border-border text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition"
											>
												<Phone className="w-3.5 h-3.5" />
											</a>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												onClick={() => openEditKin(kin)}
												title={tDetail("nextOfKinSection.editTitle")}
												className="h-7 w-7 text-blue-600 dark:text-blue-400 hover:bg-accent"
											>
												<Edit className="w-3.5 h-3.5" />
											</Button>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												onClick={() => setKinToDelete(kin)}
												title={tDetail("nextOfKinSection.deleteTitle")}
												className="h-7 w-7 text-destructive hover:bg-destructive/10"
											>
												<Trash className="w-3.5 h-3.5" />
											</Button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Right Column: Treatment Plans */}
				<div className="lg:col-span-8 bg-card text-card-foreground rounded-xl border border-border shadow-sm p-5 md:p-6">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
						<div>
							<h2 className="text-base font-bold text-foreground">
								{tDetail("plansSection.title")}
							</h2>
							{/* <p className="text-xs text-muted-foreground mt-0.5">
								{tDetail("plansSection.subtitle")}
							</p> */}
						</div>

						{/* Filter Tabs */}
						<div className="inline-flex p-1 bg-muted rounded-lg text-xs font-medium self-start border border-border">
							<button
								type="button"
								onClick={() => setPlanFilter("ALL")}
								className={cn(
									"px-3 py-1.5 rounded-md transition",
									planFilter === "ALL"
										? "bg-background text-foreground shadow-xs font-semibold"
										: "text-muted-foreground hover:text-foreground"
								)}
							>
								{tDetail("plansSection.filterAll", {
									count: sortedPlans.length,
								})}
							</button>
							<button
								type="button"
								onClick={() => setPlanFilter("IN_PROGRESS")}
								className={cn(
									"px-3 py-1.5 rounded-md transition",
									planFilter === "IN_PROGRESS"
										? "bg-background text-foreground shadow-xs font-semibold"
										: "text-muted-foreground hover:text-foreground"
								)}
							>
								{tDetail("plansSection.filterInProgress", {
									count: inProgressCount,
								})}
							</button>
							<button
								type="button"
								onClick={() => setPlanFilter("NOT_ADHERE")}
								className={cn(
									"px-3 py-1.5 rounded-md transition",
									planFilter === "NOT_ADHERE"
										? "bg-background text-rose-600 dark:text-rose-400 shadow-xs font-semibold"
										: "text-muted-foreground hover:text-foreground"
								)}
							>
								{tDetail("plansSection.filterNotAdhere", {
									count: notAdhereCount,
								})}
							</button>
						</div>
					</div>

					<div className="mt-4 space-y-3">
						{filteredPlans.length === 0 ? (
							<div className="text-center py-10 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
								{tDetail("plansSection.empty")}
							</div>
						) : (
							filteredPlans.map((plan) => {
								const isInProgress = plan.treatmentPlanStatus === 0;

								return (
									<div
										key={plan.id}
										className={cn(
											"p-4 rounded-xl border transition",
											isInProgress
												? "border-blue-500/40 bg-blue-500/[0.04] dark:bg-blue-500/[0.08] shadow-xs"
												: "border-border bg-card opacity-85 hover:opacity-100"
										)}
									>
										<div className="flex flex-wrap items-center justify-between gap-2">
											<div className="flex flex-wrap items-center gap-2">
												{isInProgress ? (
													<span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
														<span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
														{tDetail("plansSection.statusInProgress")}
													</span>
												) : (
													<span className="px-2.5 py-1 text-xs font-medium rounded-md bg-muted text-muted-foreground border border-border">
														{tDetail("plansSection.statusClosed")}
													</span>
												)}

												<AdherenceBadge state={plan.adherenceState} />

												{isHeadDepartmentDoctor &&
													plan.adherenceState === "NotAdhere" && (
														<Button
															type="button"
															variant="outline"
															size="sm"
															onClick={() => setReviewingPlan(plan)}
															title={tDetail(
																"plansSection.reviewAdherenceTitle"
															)}
															className="h-7 px-2.5 text-xs border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
														>
															<Edit className="w-3.5 h-3.5" />
														</Button>
													)}
											</div>

											<span
												className="text-xs font-mono text-muted-foreground"
												title={plan.id}
											>
												ID: #{plan.id.slice(0, 8)}
											</span>
										</div>

										<div className="mt-3 pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
											<div className="flex items-center gap-1.5">
												<Clock className="w-3.5 h-3.5" />
												<span>
													{tDetail.rich("plansSection.updatedAt", {
														time: formatDateTimeLocalized(
															plan.updatedAt,
															notDischargedLabel,
															locale
														),
														strong: (chunks) => (
															<strong className="text-foreground font-medium">
																{chunks}
															</strong>
														),
													})}
												</span>
											</div>

											{/* Actions for each Treatment Plan */}
											<div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
												{isInProgress && (
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => setClosingPlanId(plan.id)}
														className="h-7 px-2.5 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
													>
														{tDetail("plansSection.closePlanButton")}
													</Button>
												)}

												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => setDetailPlanId(plan.id)}
													className="h-7 px-2.5 text-xs text-primary hover:text-primary hover:bg-primary/10 font-semibold"
												>
													{tDetail("plansSection.viewDetailButton")}
												</Button>
											</div>
										</div>
									</div>
								);
							})
						)}
					</div>
				</div>
			</div>

			{/* --- MODALS --- */}

			{/* 1. Update Patient Modal */}
			<Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
				<DialogContent className="sm:max-w-xl border-border bg-popover text-popover-foreground max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="text-foreground">
							{tDialog("updateTitle")}
						</DialogTitle>
					</DialogHeader>
					{isUpdateOpen && (
						<PatientForm
							initialData={patient}
							onSubmit={handleUpdateSubmit}
							onCancel={() => setIsUpdateOpen(false)}
							isPending={updateMutation.isPending}
						/>
					)}
				</DialogContent>
			</Dialog>

			{/* 2. Discharge Patient Modal */}
			<DischargePatientDialog
				open={isDischargeOpen}
				onOpenChange={setIsDischargeOpen}
				patientName={patient.fullName}
				currentOutcome={patient.treatmentOutcome}
				onConfirm={handleDischargeConfirm}
				isPending={dischargeMutation.isPending}
			/>

			{/* 3. Delete Patient Alert */}
			<AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<AlertDialogContent className="border-border bg-popover text-popover-foreground">
					<AlertDialogHeader>
						<AlertDialogTitle className="text-destructive font-semibold">
							{tDialog("deleteTitle")}
						</AlertDialogTitle>
						<AlertDialogDescription className="text-muted-foreground">
							{tDialog.rich("deleteDescription", {
								name: patient.fullName,
								bold: (chunks) => (
									<span className="font-bold text-foreground">{chunks}</span>
								),
							})}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsDeleteOpen(false)}
							className="border-border text-foreground hover:bg-accent"
						>
							{tCommon("cancel")}
						</Button>
						<Button
							variant="destructive"
							onClick={handleDeletePatient}
							disabled={deleteMutation.isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteMutation.isPending && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							{tCommon("delete")}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* 4. Add / Edit Next of Kin Modal */}
			<NextOfKinFormDialog
				open={kinModalOpen}
				onOpenChange={(open) => {
					setKinModalOpen(open);
					if (!open) setEditingKin(null);
				}}
				initialData={editingKin}
				existingKins={patient.nextOfKins}
				onSubmit={handleKinSubmit}
				isPending={addKinMutation.isPending || updateKinMutation.isPending}
			/>

			{/* 5. Delete Next of Kin Alert */}
			<AlertDialog
				open={!!kinToDelete}
				onOpenChange={(open) => !open && setKinToDelete(null)}
			>
				<AlertDialogContent className="border-border bg-popover text-popover-foreground">
					<AlertDialogHeader>
						<AlertDialogTitle className="text-destructive font-semibold">
							{tDetail("deleteKinDialog.title")}
						</AlertDialogTitle>
						<AlertDialogDescription className="text-muted-foreground">
							{tDetail.rich("deleteKinDialog.description", {
								name: kinToDelete?.fullName ?? "",
								bold: (chunks) => (
									<span className="font-bold text-foreground">{chunks}</span>
								),
							})}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<Button
							variant="outline"
							onClick={() => setKinToDelete(null)}
							className="border-border text-foreground hover:bg-accent"
						>
							{tCommon("cancel")}
						</Button>
						<Button
							variant="destructive"
							onClick={handleDeleteKin}
							disabled={deleteKinMutation.isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteKinMutation.isPending && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							{tCommon("delete")}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* 6. Close Treatment Plan Modal */}
			<CloseTreatmentPlanDialog
				open={!!closingPlanId}
				onOpenChange={(open) => !open && setClosingPlanId(null)}
				planId={closingPlanId}
				onConfirm={handleClosePlan}
				isPending={closePlanMutation.isPending}
			/>

			{/* 7. Review Treatment Plan Modal (HeadDepartmentDoctor) */}
			<ReviewTreatmentPlanDialog
				open={!!reviewingPlan}
				onOpenChange={(open) => !open && setReviewingPlan(null)}
				planId={reviewingPlan?.id ?? null}
				currentAdherence={reviewingPlan?.adherenceState}
				onConfirm={handleReviewPlan}
				isPending={reviewPlanMutation.isPending}
			/>

			{/* 8. Treatment Plan Detail Modal */}
			<TreatmentPlanDetailDialog
				planId={detailPlanId}
				onClose={() => setDetailPlanId(null)}
			/>
		</div>
	);
}