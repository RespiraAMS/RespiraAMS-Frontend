"use client";

import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
	useCriteriaMutations,
	useCriteriaReferencedEntities,
	useRiskFactorsDetails,
	useMetricRulesDetails,
} from "../queries";
import { type CriteriaItem } from "../types";

interface CriteriaDeleteAlertProps {
	criteriaItem: CriteriaItem;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

export function CriteriaDeleteAlert({
	criteriaItem,
	isOpen,
	onClose,
	onSuccess,
}: CriteriaDeleteAlertProps) {
	const tDelete = useTranslations("manager.criteria.deleteAlert");
	const tCommon = useTranslations("common");

	const { deleteMutation } = useCriteriaMutations();

	const { data: refEntities, isLoading: isLoadingRefs } = useCriteriaReferencedEntities(
		criteriaItem.id,
		{ enabled: isOpen }
	);

	const riskFactorQueries = useRiskFactorsDetails(refEntities?.riskFactorReference || []);
	const metricRuleQueries = useMetricRulesDetails(refEntities?.metricRuleReference || []);

	const pathogens = riskFactorQueries.map((q) => q.data?.pathogen).filter(Boolean);
	const clinicalMetrics = metricRuleQueries.map((q) => q.data?.clinicalMetricName).filter(Boolean);

	const isFetchingDetails =
		riskFactorQueries.some((q) => q.isLoading) || metricRuleQueries.some((q) => q.isLoading);
	const showLoading = isLoadingRefs || isFetchingDetails;

	const hasReferences = refEntities?.hasReferencedEntities;

	const handleDelete = () => {
		deleteMutation.mutate(criteriaItem.id, {
			onSuccess: () => {
				toast.success(tDelete("toastSuccess", { name: criteriaItem.name }));
				onSuccess();
			},
			onError: (error) => toast.error(tDelete("toastError", { error: error.message })),
		});
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<AlertDialogContent className="border-border bg-popover text-popover-foreground max-w-lg shadow-lg">
				<AlertDialogHeader>
					<AlertDialogTitle className="text-destructive font-semibold flex items-center gap-2">
						<AlertTriangle className="w-5 h-5 text-destructive" /> {tDelete("title")}
					</AlertDialogTitle>
					<AlertDialogDescription className="text-muted-foreground text-sm">
						{tDelete.rich("description", {
							name: criteriaItem.name,
							b: (chunks) => <span className="font-bold text-foreground">{chunks}</span>,
						})}
					</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="my-4 p-4 rounded-lg bg-muted/50 border border-border">
					<h4 className="text-sm font-semibold mb-2 text-foreground">{tDelete("refHeader")}</h4>
					{showLoading ? (
						<div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
							<Loader2 className="w-4 h-4 animate-spin text-primary" /> {tDelete("checkingRefs")}
						</div>
					) : hasReferences ? (
						<div className="space-y-4">
							<p className="text-xs font-semibold text-destructive">{tDelete("warningHeader")}</p>
							<ScrollArea className="h-[120px] rounded-md border border-border p-2 bg-background">
								{pathogens.length > 0 && (
									<div className="mb-2">
										<p className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
											{tDelete("pathogensLabel")}
										</p>
										<ul className="list-disc pl-4 text-xs space-y-1 text-foreground">
											{pathogens.map((p, idx) => (
												<li key={idx}>{p?.name}</li>
											))}
										</ul>
									</div>
								)}
								{clinicalMetrics.length > 0 && (
									<div>
										<p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
											{tDelete("metricsLabel")}
										</p>
										<ul className="list-disc pl-4 text-xs space-y-1 text-foreground">
											{clinicalMetrics.map((name, idx) => (
												<li key={idx}>{name}</li>
											))}
										</ul>
									</div>
								)}
							</ScrollArea>
						</div>
					) : (
						<p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium py-2 flex items-center gap-2">
							{tDelete("safeToDelete")}
						</p>
					)}
				</div>

				<AlertDialogFooter>
					<Button
						variant="outline"
						onClick={onClose}
						className="border-border text-foreground hover:bg-accent"
					>
						{tCommon("cancel")}
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={deleteMutation.isPending || showLoading}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{deleteMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
						{tCommon("delete")}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}