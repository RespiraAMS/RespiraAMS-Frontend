"use client";

import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { cn } from "@/lib/utils";
import { type CreateMetricRuleRequest, type MetricRuleDetail, type MetricRule } from "../types";
import { useCriteriaDropdown, riskFactorKeys } from "@/features/manager/risk-factors/queries";
import { useClinicalVariablesDropdown } from "@/features/manager/clinical-variables/queries";

import { CriteriaForm } from "@/features/manager/criteria/components/CriteriaForm";
import { useCriteriaMutations } from "@/features/manager/criteria/queries";
import { type CreateCriteriaRequest } from "@/features/manager/criteria/types";
import { PrerequisiteBuilder } from "../../components/PrerequisiteBuilder";

interface MetricRuleFormProps {
	metricId: string;
	existingRules: MetricRule[];
	initialData?: MetricRuleDetail | null;
	onSubmit: (data: CreateMetricRuleRequest) => void;
	onCancel: () => void;
	isPending?: boolean;
}

export function MetricRuleForm({
	metricId,
	existingRules,
	initialData,
	onSubmit,
	onCancel,
	isPending,
}: MetricRuleFormProps) {
	const tRuleForm = useTranslations("manager.clinicalMetrics.ruleForm");
	const tCommon = useTranslations("common");

	const isEdit = !!initialData;
	const queryClient = useQueryClient();

	const { data: criteriaData, isLoading: loadingCriteria } = useCriteriaDropdown();
	const criteriaList = criteriaData?.criteria || [];
	const { data: variablesData } = useClinicalVariablesDropdown();
	const variablesList = variablesData?.clinicalVariables || [];

	const availableCriteria = useMemo(() => {
		const usedCriteriaIds = new Set(
			existingRules
				.filter((r) => r.id !== initialData?.id)
				.map((r) => r.criterion.id)
		);

		return criteriaList.filter((c) => !usedCriteriaIds.has(c.id));
	}, [criteriaList, existingRules, initialData]);

	const [openCriteriaCombo, setOpenCriteriaCombo] = useState(false);
	const [isCreateCriteriaOpen, setIsCreateCriteriaOpen] = useState(false);
	const { createMutation: createCriteriaMutation } = useCriteriaMutations();

	const hasScoreRules = existingRules.some((r) => r.scoreFunction != null);
	const hasCriteriaRules = existingRules.some((r) => r.isMajorRule != null);

	let allowedRuleType: "major" | "minor" | "score" | "all" = "all";
	if (hasScoreRules) allowedRuleType = "score";
	if (hasCriteriaRules) allowedRuleType = "major";

	const formSchema = useMemo(() => {
		return z.object({
			criterionId: z.string().min(1, tRuleForm("validationCriterionRequired")),
			ruleType: z.enum(["major", "minor", "score"]),
			scoreFunctionFormula: z.any().optional(),
		});
	}, [tRuleForm]);

	type FormValues = z.infer<typeof formSchema>;

	const defaultValues: FormValues = useMemo(() => {
		if (!initialData) {
			return {
				criterionId: "",
				ruleType: allowedRuleType === "score" ? "score" : "major",
				scoreFunctionFormula: undefined,
			};
		}

		let type: "major" | "minor" | "score" = "major";
		if (initialData.scoreFunction != null) {
			type = "score";
		} else if (
			initialData.isMajorRule === false ||
			(initialData as unknown as { isMajor?: boolean }).isMajor === false
		) {
			type = "minor";
		}

		return {
			criterionId: initialData.criterion.id,
			ruleType: type,
			scoreFunctionFormula: initialData.scoreFunctionFormula,
		};
	}, [initialData, allowedRuleType]);

	const {
		control,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues,
	});

	const selectedRuleType = watch("ruleType");

	const handleCreateCriteria = (data: CreateCriteriaRequest) => {
		createCriteriaMutation.mutate(data, {
			onSuccess: (response: unknown) => {
				toast.success(tRuleForm("toastCreateCriteriaSuccess"));
				setIsCreateCriteriaOpen(false);
				queryClient.invalidateQueries({ queryKey: riskFactorKeys.dropdownCriteria });
				const result = response as { data?: { id?: string }; id?: string };
				const newId = result.data?.id || result.id;
				if (newId) {
					setValue("criterionId", newId, { shouldValidate: true });
				}
			},
			onError: (err) => toast.error(tRuleForm("toastCreateCriteriaError", { error: err.message })),
		});
	};

	const handleValidSubmit = (data: FormValues) => {
		const payload: CreateMetricRuleRequest = {
			criterionId: data.criterionId,
		};

		if (data.ruleType === "major") {
			payload.isMajor = true;
			payload.scoreFunction = undefined;
		} else if (data.ruleType === "minor") {
			payload.isMajor = false;
			payload.scoreFunction = undefined;
		} else if (data.ruleType === "score") {
			payload.isMajor = undefined;
			if (!data.scoreFunctionFormula || Object.keys(data.scoreFunctionFormula).length === 0) {
				toast.error(tRuleForm("scoreFormulaRequired"));
				return;
			}
			payload.scoreFunction = data.scoreFunctionFormula;
		}

		onSubmit(payload);
	};

	return (
		<>
			<form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-6 text-foreground">
				{/* Criterion Select */}
				<div className="space-y-2 flex flex-col">
					<div className="flex items-center justify-between">
						<Label className="text-foreground">
							{tRuleForm("criterionLabel")} <span className="text-destructive">*</span>
						</Label>
						<Button
							type="button"
							variant="link"
							className="h-auto p-0 text-xs text-primary hover:underline"
							onClick={() => setIsCreateCriteriaOpen(true)}
						>
							<Plus className="w-3 h-3 mr-1" /> {tRuleForm("createNewCriterion")}
						</Button>
					</div>
					<Controller
						control={control}
						name="criterionId"
						render={({ field }) => (
							<Popover open={openCriteriaCombo} onOpenChange={setOpenCriteriaCombo}>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										role="combobox"
										aria-expanded={openCriteriaCombo}
										className={cn(
											"justify-between font-normal bg-background text-foreground border-input hover:bg-accent",
											!field.value && "text-muted-foreground",
											errors.criterionId && "border-destructive"
										)}
										disabled={isPending || loadingCriteria}
									>
										<span className="truncate flex-1 text-left">
											{field.value
												? criteriaList.find((c) => c.id === field.value)?.name
												: loadingCriteria
												? tRuleForm("loading")
												: tRuleForm("criterionPlaceholder")}
										</span>
										<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover border-border" align="start">
									<Command className="bg-popover text-popover-foreground">
										<CommandInput placeholder={tRuleForm("criterionSearch")} className="border-none focus:ring-0" />
										<CommandEmpty>{tRuleForm("criterionEmpty")}</CommandEmpty>
										<CommandList>
											<CommandGroup>
												{availableCriteria.map((c) => (
													<CommandItem
														key={c.id}
														value={c.name}
														onSelect={() => {
															field.onChange(c.id);
															setOpenCriteriaCombo(false);
														}}
														className="aria-selected:bg-accent aria-selected:text-accent-foreground"
													>
														<Check
															className={cn(
																"mr-2 h-4 w-4 text-primary",
																field.value === c.id ? "opacity-100" : "opacity-0"
															)}
														/>
														{c.name}
													</CommandItem>
												))}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
						)}
					/>
					{errors.criterionId && (
						<p className="text-xs text-destructive font-medium">{errors.criterionId.message}</p>
					)}
				</div>

				{/* Classification / Rule Type */}
				<div className="space-y-4">
					<Label className="text-foreground">
						{tRuleForm("ruleTypeLabel")} <span className="text-destructive">*</span>
					</Label>
					<Controller
						control={control}
						name="ruleType"
						render={({ field }) => (
							<RadioGroup
								onValueChange={field.onChange}
								value={field.value}
								className="flex flex-col space-y-2"
								disabled={isPending}
							>
								<div className="flex items-center space-x-3 bg-muted/40 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
									<RadioGroupItem value="major" id="r-major" disabled={allowedRuleType === "score"} />
									<Label
										htmlFor="r-major"
										className={cn(
											"cursor-pointer font-medium flex-1 text-foreground",
											allowedRuleType === "score" && "text-muted-foreground cursor-not-allowed"
										)}
									>
										{tRuleForm("ruleTypeMajor")}
									</Label>
								</div>
								<div className="flex items-center space-x-3 bg-muted/40 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
									<RadioGroupItem value="minor" id="r-minor" disabled={allowedRuleType === "score"} />
									<Label
										htmlFor="r-minor"
										className={cn(
											"cursor-pointer font-medium flex-1 text-foreground",
											allowedRuleType === "score" && "text-muted-foreground cursor-not-allowed"
										)}
									>
										{tRuleForm("ruleTypeMinor")}
									</Label>
								</div>
								<div className="flex items-center space-x-3 bg-muted/40 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
									<RadioGroupItem value="score" id="r-score" disabled={allowedRuleType === "major"} />
									<Label
										htmlFor="r-score"
										className={cn(
											"cursor-pointer font-medium flex-1 text-foreground",
											allowedRuleType === "major" && "text-muted-foreground cursor-not-allowed"
										)}
									>
										{tRuleForm("ruleTypeScore")}
									</Label>
								</div>
							</RadioGroup>
						)}
					/>
				</div>

				{/* Score Formula Builder */}
				{selectedRuleType === "score" && (
					<div className="space-y-2 pt-4 border-t border-border">
						<Label className="text-foreground">
							{tRuleForm("scoreFormulaLabel")} <span className="text-destructive">*</span>
						</Label>
						<p className="text-xs text-muted-foreground mb-2">
							{tRuleForm("scoreFormulaHelp")}
						</p>
						<Controller
							control={control}
							name="scoreFunctionFormula"
							render={({ field }) => (
								<PrerequisiteBuilder
									value={field.value || null}
									onChange={field.onChange}
									variables={variablesList}
								/>
							)}
						/>
					</div>
				)}

				{/* Form Actions */}
				<div className="flex justify-end gap-2 pt-4 border-t border-border">
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
						disabled={isPending}
						className="border-border text-foreground hover:bg-accent"
					>
						{tCommon("cancel")}
					</Button>
					<Button
						type="submit"
						disabled={isPending}
						className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
					>
						{isPending && <Loader2 className="h-4 w-4 animate-spin" />}
						{isEdit ? tCommon("update") : tCommon("create")}
					</Button>
				</div>
			</form>

			{/* Criteria Create Modal */}
			<Dialog open={isCreateCriteriaOpen} onOpenChange={setIsCreateCriteriaOpen}>
				<DialogContent className="w-[95vw] sm:max-w-5xl border-border bg-popover text-popover-foreground">
					<DialogHeader>
						<DialogTitle className="text-foreground">{tRuleForm("createCriteriaModalTitle")}</DialogTitle>
					</DialogHeader>
					{isCreateCriteriaOpen && (
						<CriteriaForm
							onSubmit={handleCreateCriteria}
							onCancel={() => setIsCreateCriteriaOpen(false)}
							isPending={createCriteriaMutation.isPending}
						/>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}