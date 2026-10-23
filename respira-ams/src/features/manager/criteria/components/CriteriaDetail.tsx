"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import {
	useCriteriaDetail,
	useCriteriaMutations,
	useCriteriaReferencedEntities,
	useRiskFactorsDetails,
	useMetricRulesDetails,
} from "../queries";
import { CriteriaForm } from "./CriteriaForm";
import { type UpdateCriteriaRequest } from "../types";
import { PrerequisiteFormatter } from "../../components/PrerequisiteFormatter";
import { CriteriaDeleteAlert } from "./CriteriaDeleteAlert";

export function CriteriaDetail({ id }: { id: string }) {
	const router = useRouter();
	const tDetail = useTranslations("manager.criteria.detail");
	const tCommon = useTranslations("common");

	const { data: criteriaData, isLoading: isLoadingCriteria } = useCriteriaDetail(id);
	const { data: refEntities, isLoading: isLoadingRefs } = useCriteriaReferencedEntities(id);
	const { updateMutation } = useCriteriaMutations();

	const riskFactorQueries = useRiskFactorsDetails(refEntities?.riskFactorReference || []);
	const metricRuleQueries = useMetricRulesDetails(refEntities?.metricRuleReference || []);

	const pathogens = riskFactorQueries.map((q) => q.data?.pathogen).filter(Boolean);
	const clinicalMetrics = metricRuleQueries.map((q) => q.data?.clinicalMetricName).filter(Boolean);

	const [isUpdateOpen, setIsUpdateOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	if (isLoadingCriteria) {
		return (
			<div className="flex justify-center py-12">
				<Loader2 className="animate-spin w-8 h-8 text-primary" />
			</div>
		);
	}

	if (!criteriaData) {
		return (
			<div className="text-center py-12 text-destructive font-medium">
				{tDetail("notFound")}
			</div>
		);
	}

	const handleUpdateSubmit = (payload: UpdateCriteriaRequest) => {
		updateMutation.mutate(
			{ id, data: payload },
			{
				onSuccess: () => {
					toast.success(tDetail("toastUpdateSuccess"));
					setIsUpdateOpen(false);
				},
				onError: (err) => toast.error(tDetail("toastUpdateError", { error: err.message })),
			}
		);
	};

	return (
		<div className="mx-auto space-y-6 text-foreground bg-background">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => router.back()}
						className="hover:bg-accent rounded-full text-foreground"
					>
						<ArrowLeft className="w-5 h-5" />
					</Button>
					<h2 className="text-2xl font-bold tracking-tight text-foreground">{criteriaData.name}</h2>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={() => setIsUpdateOpen(true)}
						className="bg-card text-foreground border-border hover:bg-accent"
					>
						<Edit className="h-4 w-4 mr-2 text-primary" /> {tCommon("update")}
					</Button>
					<Button
						variant="destructive"
						onClick={() => setIsDeleteOpen(true)}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						<Trash className="h-4 w-4 mr-2" /> {tCommon("delete")}
					</Button>
				</div>
			</div>

			{/* Formula Section */}
			<div className="border border-border bg-card p-5 rounded-xl shadow-sm text-card-foreground">
				<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">
					{tDetail("formulaTitle")}
				</h3>
				<div className="bg-muted/40 p-4 rounded-lg border border-border">
					<PrerequisiteFormatter formula={criteriaData.formulaString} />
				</div>
			</div>

			{/* Referenced Entities Section */}
			<div className="border border-border bg-card p-5 rounded-xl shadow-sm space-y-6 text-card-foreground">
				<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b border-border pb-2">
					{tDetail("usageTitle")}
				</h3>

				{isLoadingRefs ? (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Loader2 className="w-4 h-4 animate-spin text-primary" /> {tDetail("checkingRefs")}
					</div>
				) : !refEntities?.hasReferencedEntities ? (
					<p className="text-sm text-muted-foreground italic">{tDetail("unlinked")}</p>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Pathogens / Risk Factors */}
						<div className="space-y-3">
							<h4 className="font-semibold text-sm flex items-center gap-2 text-rose-600 dark:text-rose-400">
								{tDetail("pathogensTitle")}
							</h4>
							{pathogens.length === 0 ? (
								<p className="text-xs text-muted-foreground">{tDetail("noPathogens")}</p>
							) : (
								<ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
									{pathogens.map((p, idx) => (
										<li key={idx}>{p?.name}</li>
									))}
								</ul>
							)}
						</div>

						{/* Clinical Metrics */}
						<div className="space-y-3">
							<h4 className="font-semibold text-sm flex items-center gap-2 text-blue-600 dark:text-blue-400">
								{tDetail("metricsTitle")}
							</h4>
							{clinicalMetrics.length === 0 ? (
								<p className="text-xs text-muted-foreground">{tDetail("noMetrics")}</p>
							) : (
								<ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
									{clinicalMetrics.map((name, idx) => (
										<li key={idx}>{name}</li>
									))}
								</ul>
							)}
						</div>
					</div>
				)}
			</div>

			{/* Update Dialog */}
			<Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
				<DialogContent className="w-[95vw] sm:max-w-5xl border-border bg-popover text-popover-foreground">
					<DialogHeader>
						<DialogTitle className="text-xl text-foreground">{tDetail("dialogUpdateTitle")}</DialogTitle>
					</DialogHeader>
					{isUpdateOpen && (
						<CriteriaForm
							initialData={criteriaData}
							onSubmit={handleUpdateSubmit}
							onCancel={() => setIsUpdateOpen(false)}
							isPending={updateMutation.isPending}
						/>
					)}
				</DialogContent>
			</Dialog>

			{/* Delete Alert */}
			{isDeleteOpen && (
				<CriteriaDeleteAlert
					criteriaItem={{ id, name: criteriaData.name, formula: criteriaData.formulaString }}
					isOpen={isDeleteOpen}
					onClose={() => setIsDeleteOpen(false)}
					onSuccess={() => {
						setIsDeleteOpen(false);
						router.push("/manage/criteria");
					}}
				/>
			)}
		</div>
	);
}