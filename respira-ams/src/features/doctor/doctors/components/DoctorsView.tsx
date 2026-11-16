"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { DoctorsTable } from "./DoctorsTable";
import { DoctorDetailModal } from "./DoctorDetailModal";
import { DoctorSubordinateItem } from "../types";
import { formatDoctorFullName } from "../constants";
import { useAnalysisMutations } from "../../analysis/queries";
import { CreateAnalysisReportRequest } from "../../analysis/types";
import { CreateAnalysisReportForm } from "../../analysis/components/CreateAnalysisReportForm";

export function DoctorsView() {
	const router = useRouter();
	const t = useTranslations("doctor.doctors");

	const [detailDoctor, setDetailDoctor] = useState<DoctorSubordinateItem | null>(null);
	const [reportDoctor, setReportDoctor] = useState<DoctorSubordinateItem | null>(null);

	const { createMutation } = useAnalysisMutations();

	const formatName = (doc: {
		firstName: string;
		lastName: string;
		academicTitle?: string;
	}) => formatDoctorFullName(doc, (key) => t(`prefixes.${key}`));

	const handleCreateReportSubmit = (payload: CreateAnalysisReportRequest) => {
		createMutation.mutate(payload, {
			onSuccess: (createdReport) => {
				toast.success(
					t("toast.createReportSuccess", {
						name: reportDoctor
							? formatName(reportDoctor)
							: t("toast.defaultDoctorName"),
					})
				);
				setReportDoctor(null);
				if (createdReport?.analysisId) {
					router.push(`/doctor/analysis/${createdReport.analysisId}`);
				}
			},
			onError: (error) => {
				toast.error(t("toast.createReportError", { error: error.message }));
			},
		});
	};

	return (
		<div className="space-y-6 text-foreground">
			<div>
				<h2 className="text-2xl font-bold tracking-tight text-foreground">
					{t("title")}
				</h2>
				<p className="text-muted-foreground mt-1">{t("subtitle")}</p>
			</div>

			<div className="rounded-xl border border-border bg-card text-card-foreground p-4 shadow-sm overflow-x-auto">
				<DoctorsTable
					onViewDetail={(doctor) => setDetailDoctor(doctor)}
					onCreateReport={(doctor) => setReportDoctor(doctor)}
				/>
			</div>

			<DoctorDetailModal
				doctorItem={detailDoctor}
				isOpen={!!detailDoctor}
				onClose={() => setDetailDoctor(null)}
				onCreateReport={(doctor) => setReportDoctor(doctor)}
			/>

			<Dialog
				open={!!reportDoctor}
				onOpenChange={(open) => !open && setReportDoctor(null)}
			>
				<DialogContent className="sm:max-w-lg border-border bg-popover text-popover-foreground">
					<DialogHeader>
						<DialogTitle className="text-xl text-foreground">
							{t("createReportDialog.title")}
						</DialogTitle>
					</DialogHeader>
					{reportDoctor && (
						<CreateAnalysisReportForm
							doctorId={reportDoctor.id}
							doctorName={formatName(reportDoctor)}
							onSubmit={handleCreateReportSubmit}
							onCancel={() => setReportDoctor(null)}
							isPending={createMutation.isPending}
						/>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}