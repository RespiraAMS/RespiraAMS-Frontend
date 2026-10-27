"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Info, Plus, Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

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

import { useClinicalMetricDetail, useMetricRuleDetail, useMetricRuleMutations } from "../queries";
import { MetricRuleForm } from "./MetricRuleForm";
import { type CreateMetricRuleRequest, type UpdateMetricRuleRequest, type MetricRule } from "../types";
import { PrerequisiteFormatter } from "../../components/PrerequisiteFormatter";

export function ClinicalMetricDetail({ id }: { id: string }) {
	const router = useRouter();
	const tDetail = useTranslations("manager.clinicalMetrics.detail");
	const tCommon = useTranslations("common");

	const { data: metric, isLoading: isLoadingMetric } = useClinicalMetricDetail(id);
	const { createMutation, updateMutation, deleteMutation } = useMetricRuleMutations(id);

	const [modalMode, setModalMode] = useState<"create" | "update" | null>(null);
	const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
	const [ruleToDelete, setRuleToDelete] = useState<MetricRule | null>(null);

	const { data: ruleDetail, isFetching: isFetchingRule } = useMetricRuleDetail(selectedRuleId as string, {
		enabled: modalMode === "update" && !!selectedRuleId,
	});

	if (isLoadingMetric) {
		return (
			<div className="flex justify-center py-12">
				<Loader2 className="animate-spin w-8 h-8 text-primary" />
			</div>
		);
	}

	if (!metric) {
		return (
			<div className="text-center py-12 text-destructive font-medium">
				{tDetail("notFound")}
			</div>
		);
	}

	const openCreate = () => {
		setSelectedRuleId(null);
		setModalMode("create");
	};

	const openUpdate = (rule: MetricRule) => {
		setSelectedRuleId(rule.id);
		setModalMode("update");
	};

	const closeModal = () => {
		setModalMode(null);
		setSelectedRuleId(null);
	};

	const handleFormSubmit = (data: CreateMetricRuleRequest | UpdateMetricRuleRequest) => {
		if (modalMode === "create") {
			createMutation.mutate(data as CreateMetricRuleRequest, {
				onSuccess: () => {
					closeModal();
					toast.success(tDetail("toastCreateSuccess"));
				},
				onError: (err) => toast.error(tDetail("toastCreateError", { error: err.message })),
			});
		} else if (modalMode === "update" && selectedRuleId) {
			updateMutation.mutate(
				{ ruleId: selectedRuleId, data: data as UpdateMetricRuleRequest },
				{
					onSuccess: () => {
						closeModal();
						toast.success(tDetail("toastUpdateSuccess"));
					},
					onError: (err) => toast.error(tDetail("toastUpdateError", { error: err.message })),
				}
			);
		}
	};

	const handleDelete = () => {
		if (ruleToDelete) {
			deleteMutation.mutate(ruleToDelete.id, {
				onSuccess: () => {
					setRuleToDelete(null);
					toast.success(tDetail("toastDeleteSuccess"));
				},
				onError: (err) => toast.error(tDetail("toastDeleteError", { error: err.message })),
			});
		}
	};

	return (
		<div className="mx-auto space-y-6 text-foreground bg-background">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => router.back()}
					className="hover:bg-accent rounded-full text-foreground"
				>
					<ArrowLeft className="w-5 h-5" />
				</Button>
				<div>
					<h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
						{metric.name}
						{metric.isApplied ? (
							<span className="ml-2 text-xs px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
								{tDetail("statusActive")}
							</span>
						) : (
							<span className="ml-2 text-xs px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground font-semibold uppercase">
								{tDetail("statusInactive")}
							</span>
						)}
					</h2>
					<p className="text-muted-foreground text-sm font-mono mt-1">
						{metric.code} | {tDetail("versionLabel")}: {metric.version}
					</p>
				</div>
			</div>

			{/* Metadata Section */}
			<div className="border border-border bg-card p-5 rounded-xl shadow-sm space-y-3 text-sm text-card-foreground">
				<div className="flex gap-2">
					<span className="font-semibold w-48 shrink-0 text-foreground">{tDetail("publisherLabel")}:</span>
					<span className="text-muted-foreground">{metric.publisher}</span>
				</div>
				<div className="flex gap-2">
					<span className="font-semibold w-48 shrink-0 text-foreground">{tDetail("descriptionLabel")}:</span>
					<span className="text-muted-foreground">{metric.description}</span>
				</div>
			</div>

			{/* Rules Section */}
			<div className="border border-border bg-card p-5 rounded-xl shadow-sm text-card-foreground">
				<div className="flex justify-between items-center mb-4 border-b border-border pb-4">
					<div>
						<h3 className="text-lg font-bold text-foreground tracking-wide">
							{tDetail("rulesTitle")}
						</h3>
						<div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
							<Info className="w-4 h-4 text-primary" /> {tDetail("totalRulesCount", { count: metric.rules.length })}
						</div>
					</div>
					<Button onClick={openCreate} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
						<Plus className="w-4 h-4 mr-2" /> {tDetail("addRuleButton")}
					</Button>
				</div>

				{metric.rules.length === 0 ? (
					<div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-lg bg-muted/20">
						{tDetail("emptyRules")}
					</div>
				) : (
					<div className="rounded-md border border-border overflow-hidden">
						<table className="w-full text-sm text-left">
							<thead className="bg-muted/50 text-muted-foreground text-xs uppercase border-b border-border">
								<tr>
									<th className="px-4 py-3 font-semibold w-1/6">{tDetail("colCriterionName")}</th>
									<th className="px-4 py-3 font-semibold w-3/6">{tDetail("colFormula")}</th>
									<th className="px-4 py-3 font-semibold text-center w-1/6">{tDetail("colTypeScore")}</th>
									<th className="px-4 py-3 font-semibold text-right">{tCommon("actions")}</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{metric.rules.map((rule) => (
									<tr key={rule.id} className="hover:bg-accent/50 border-border">
										<td className="px-4 py-3 font-medium text-foreground align-top">
											{rule.criterion.name}
										</td>
										<td className="px-4 py-3 align-top">
											<div className="bg-muted/40 p-2 rounded border border-border">
												<PrerequisiteFormatter formula={rule.criterion.formula} />
											</div>
										</td>
										<td className="px-4 py-3 text-center align-top font-mono font-bold">
											{rule.isMajorRule != null ? (
												rule.isMajorRule ? (
													<span className="text-rose-600 dark:text-rose-400 font-bold bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded text-xs">
														{tDetail("majorRule")}
													</span>
												) : (
													<span className="text-muted-foreground font-medium bg-muted border border-border px-2 py-0.5 rounded text-xs">
														{tDetail("minorRule")}
													</span>
												)
											) : (
												<span className="text-foreground">
													{rule.scoreFunction != null ? rule.scoreFunction : "-"}
												</span>
											)}
										</td>
										<td className="px-4 py-3 align-top">
											<div className="flex justify-end gap-1">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => openUpdate(rule)}
													className="hover:bg-accent text-foreground h-8 w-8"
												>
													<Edit className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => setRuleToDelete(rule)}
													className="hover:bg-destructive/10 text-destructive h-8 w-8"
												>
													<Trash className="h-4 w-4" />
												</Button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* Form Dialog */}
			<Dialog open={modalMode !== null} onOpenChange={(open) => !open && closeModal()}>
				<DialogContent className="sm:max-w-2xl border-border bg-popover text-popover-foreground max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="text-foreground">
							{modalMode === "create" ? tDetail("dialogCreateTitle") : tDetail("dialogUpdateTitle")}
						</DialogTitle>
					</DialogHeader>
					{modalMode === "update" && isFetchingRule ? (
						<div className="flex justify-center p-10">
							<Loader2 className="animate-spin w-8 h-8 text-primary" />
						</div>
					) : (
						modalMode && (
							<MetricRuleForm
								metricId={id}
								existingRules={metric.rules}
								initialData={modalMode === "update" ? ruleDetail : null}
								onSubmit={handleFormSubmit}
								onCancel={closeModal}
								isPending={createMutation.isPending || updateMutation.isPending}
							/>
						)
					)}
				</DialogContent>
			</Dialog>

			{/* Delete Alert */}
			<AlertDialog open={!!ruleToDelete} onOpenChange={(open) => !open && setRuleToDelete(null)}>
				<AlertDialogContent className="border-border bg-popover text-popover-foreground">
					<AlertDialogHeader>
						<AlertDialogTitle className="text-destructive font-semibold">
							{tDetail("dialogDeleteTitle")}
						</AlertDialogTitle>
						<AlertDialogDescription className="text-muted-foreground">
							{tDetail.rich("dialogDeleteDescription", {
								name: ruleToDelete?.criterion.name || "",
								b: (chunks) => <span className="font-bold text-foreground">{chunks}</span>,
							})}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<Button
							variant="outline"
							onClick={() => setRuleToDelete(null)}
							className="border-border text-foreground hover:bg-accent"
						>
							{tCommon("cancel")}
						</Button>
						<Button
							variant="destructive"
							onClick={handleDelete}
							disabled={deleteMutation.isPending}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}{" "}
							{tCommon("delete")}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}