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

import { cn } from "@/lib/utils";
import { type CreateRiskFactorRequest, type RiskFactorItem } from "../types";
import { usePathogensDropdown, useCriteriaDropdown, riskFactorKeys } from "../queries";

import { CriteriaForm } from "@/features/manager/criteria/components/CriteriaForm";
import { useCriteriaMutations } from "@/features/manager/criteria/queries";
import { type CreateCriteriaRequest } from "@/features/manager/criteria/types";

interface RiskFactorFormProps {
	initialData?: RiskFactorItem | null;
	onSubmit: (data: CreateRiskFactorRequest) => void;
	onCancel: () => void;
	isPending?: boolean;
}

export function RiskFactorForm({ initialData, onSubmit, onCancel, isPending }: RiskFactorFormProps) {
	const tForm = useTranslations("manager.riskFactors.form");
	const tVal = useTranslations("manager.riskFactors.validation");
	const tToast = useTranslations("manager.riskFactors.toast");
	const tCommon = useTranslations("common");

	const isEdit = !!initialData;
	const queryClient = useQueryClient();

	const [openPathogenCombo, setOpenPathogenCombo] = useState(false);
	const [openCriteriaCombo, setOpenCriteriaCombo] = useState(false);
	const [isCreateCriteriaOpen, setIsCreateCriteriaOpen] = useState(false);

	const { data: pathogensData, isLoading: loadingPathogens } = usePathogensDropdown();
	const { data: criteriaData, isLoading: loadingCriteria } = useCriteriaDropdown();
	const { createMutation: createCriteriaMutation } = useCriteriaMutations();

	const pathogens = pathogensData?.pathogens || [];
	const criteriaList = criteriaData?.criteria || [];

	const formSchema = useMemo(() => {
		return z.object({
			pathogenId: z.string().min(1, tVal("pathogenRequired")),
			criterionId: z.string().min(1, tVal("criterionRequired")),
		});
	}, [tVal]);

	type FormValues = z.infer<typeof formSchema>;

	const defaultValues: FormValues = useMemo(() => {
		if (!initialData) return { pathogenId: "", criterionId: "" };
		return {
			pathogenId: initialData.pathogen.id,
			criterionId: initialData.criterion.id,
		};
	}, [initialData]);

	const {
		control,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues,
	});

	const handleCreateCriteria = (data: CreateCriteriaRequest) => {
		createCriteriaMutation.mutate(data, {
			onSuccess: (response: unknown) => {
				toast.success(tToast("createCriteriaSuccess"));
				setIsCreateCriteriaOpen(false);

				queryClient.invalidateQueries({ queryKey: riskFactorKeys.dropdownCriteria });

				const result = response as { data?: { id?: string }; id?: string } | undefined;
				const newId = result?.data?.id || result?.id;
				if (newId) {
					setValue("criterionId", newId, { shouldValidate: true });
				}
			},
			onError: (err) => toast.error(tToast("createCriteriaError", { error: err.message })),
		});
	};

	return (
		<>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-foreground">
				{/* Pathogen Selection */}
				<div className="space-y-2 flex flex-col">
					<Label className="text-foreground">
						{tForm("pathogenLabel")} <span className="text-destructive">*</span>
					</Label>
					<Controller
						control={control}
						name="pathogenId"
						render={({ field }) => (
							<Popover open={openPathogenCombo} onOpenChange={setOpenPathogenCombo}>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										role="combobox"
										aria-expanded={openPathogenCombo}
										className={cn(
											"justify-between font-normal bg-background text-foreground border-input hover:bg-accent",
											!field.value && "text-muted-foreground",
											errors.pathogenId && "border-destructive"
										)}
										disabled={isPending || loadingPathogens}
									>
										<span className="truncate flex-1 text-left">
											{field.value
												? pathogens.find((p) => p.id === field.value)?.name
												: loadingPathogens
												? tForm("loading")
												: tForm("pathogenPlaceholder")}
										</span>
										<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover border-border" align="start">
									<Command className="bg-popover text-popover-foreground">
										<CommandInput placeholder={tForm("pathogenSearch")} className="border-none focus:ring-0" />
										<CommandEmpty>{tForm("pathogenEmpty")}</CommandEmpty>
										<CommandList>
											<CommandGroup>
												{pathogens.map((p) => (
													<CommandItem
														key={p.id}
														value={p.name}
														onSelect={() => {
															field.onChange(p.id);
															setOpenPathogenCombo(false);
														}}
														className="aria-selected:bg-accent aria-selected:text-accent-foreground"
													>
														<Check
															className={cn(
																"mr-2 h-4 w-4 text-primary",
																field.value === p.id ? "opacity-100" : "opacity-0"
															)}
														/>
														{p.name}
													</CommandItem>
												))}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
						)}
					/>
					{errors.pathogenId && <p className="text-xs text-destructive font-medium">{errors.pathogenId.message}</p>}
				</div>

				{/* Criterion Selection */}
				<div className="space-y-2 flex flex-col">
					<div className="flex items-center justify-between">
						<Label className="text-foreground">
							{tForm("criterionLabel")} <span className="text-destructive">*</span>
						</Label>
						<Button
							type="button"
							variant="link"
							className="h-auto p-0 text-xs text-primary hover:underline"
							onClick={() => setIsCreateCriteriaOpen(true)}
						>
							<Plus className="w-3 h-3 mr-1" /> {tForm("createNewCriterion")}
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
												? tForm("loading")
												: tForm("criterionPlaceholder")}
										</span>
										<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover border-border" align="start">
									<Command className="bg-popover text-popover-foreground">
										<CommandInput placeholder={tForm("criterionSearch")} className="border-none focus:ring-0" />
										<CommandEmpty>{tForm("criterionEmpty")}</CommandEmpty>
										<CommandList>
											<CommandGroup>
												{criteriaList.map((c) => (
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
					{errors.criterionId && <p className="text-xs text-destructive font-medium">{errors.criterionId.message}</p>}
				</div>

				{/* Actions */}
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

			{/* Nested Dialog for Quick Criteria Creation */}
			<Dialog open={isCreateCriteriaOpen} onOpenChange={setIsCreateCriteriaOpen}>
				<DialogContent className="w-[95vw] sm:max-w-5xl border-border bg-popover text-popover-foreground">
					<DialogHeader>
						<DialogTitle className="text-foreground">{tForm("createCriteriaModalTitle")}</DialogTitle>
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