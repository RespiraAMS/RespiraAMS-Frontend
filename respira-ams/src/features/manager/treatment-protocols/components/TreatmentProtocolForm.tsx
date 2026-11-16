"use client";

import { useMemo, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Trash2, Check, ChevronsUpDown, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { cn } from "@/lib/utils";
import { type TreatmentProtocolItem, type TreatmentProtocolRequest } from "../types";
import { useDropdownData } from "../queries";

interface TreatmentProtocolFormProps {
	initialData?: TreatmentProtocolItem | null;
	onSubmit: (data: TreatmentProtocolRequest) => void;
	onCancel: () => void;
	isPending?: boolean;
}

export function TreatmentProtocolForm({
	initialData,
	onSubmit,
	onCancel,
	isPending,
}: TreatmentProtocolFormProps) {
	const tForm = useTranslations("manager.treatmentProtocols.form");
	const tVal = useTranslations("manager.treatmentProtocols.validation");
	const tCommon = useTranslations("common");

	const isEdit = !!initialData;
	const { pathogens, criteria, antibiotics, isLoading: isLoadingDropdowns } = useDropdownData();

	const [openPathogenCombo, setOpenPathogenCombo] = useState(false);
	const [openCriteriaCombo, setOpenCriteriaCombo] = useState(false);
	const [openAntibioticComboForGroup, setOpenAntibioticComboForGroup] = useState<number | null>(null);

	const formSchema = useMemo(() => {
		return z.object({
			severity: z.enum(["Mild", "Moderate", "Severe"]),
			treatmentSite: z.enum(["Outpatient", "Inpatient", "IntensiveCareUnit"]),
			version: z.string().min(1, tVal("versionRequired")),
			publisher: z.string().min(1, tVal("publisherRequired")),
			isApplied: z.boolean().default(true),
			pathogens: z.array(z.string()).optional(),
			criteria: z.array(z.string()).optional(),
			medicines: z
				.array(
					z.object({
						antibioticIds: z.array(z.string()).min(1, tVal("groupMinAntibiotics")),
					})
				)
				.min(1, tVal("minMedicinesGroup")),
		});
	}, [tVal]);

	type FormValues = z.infer<typeof formSchema>;

	const defaultValues: FormValues = useMemo(() => {
		if (!initialData) {
			return {
				severity: "Mild",
				treatmentSite: "Outpatient",
				version: "",
				publisher: "",
				isApplied: true,
				pathogens: [],
				criteria: [],
				medicines: [{ antibioticIds: [] }],
			};
		}
		return {
			severity: initialData.severity,
			treatmentSite: initialData.treatmentSite,
			version: initialData.version,
			publisher: initialData.publisher,
			isApplied: initialData.isApplied,
			pathogens: initialData.pathogens.map((p) => p.id),
			criteria: initialData.criteria.map((c) => c.id),
			medicines: initialData.treatments.map((group) => ({
				antibioticIds: group.map((ab) => ab.id),
			})),
		};
	}, [initialData]);

	const {
		register,
		control,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<z.input<typeof formSchema>, unknown, FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues,
	});

	const { fields: medicineGroups, append: appendGroup, remove: removeGroup } = useFieldArray({
		control,
		name: "medicines",
	});

	const watchPathogens = watch("pathogens") || [];
	const watchCriteria = watch("criteria") || [];
	const watchMedicines = watch("medicines") || [];

	const toggleArrayItem = (fieldName: "pathogens" | "criteria", id: string) => {
		const currentList = watch(fieldName) || [];
		if (currentList.includes(id)) {
			setValue(
				fieldName,
				currentList.filter((cid) => cid !== id),
				{ shouldValidate: true }
			);
		} else {
			setValue(fieldName, [...currentList, id], { shouldValidate: true });
		}
	};

	const toggleAntibioticInGroup = (groupIndex: number, antibioticId: string) => {
		const currentGroupList = watchMedicines[groupIndex]?.antibioticIds || [];
		if (currentGroupList.includes(antibioticId)) {
			setValue(
				`medicines.${groupIndex}.antibioticIds`,
				currentGroupList.filter((id) => id !== antibioticId),
				{ shouldValidate: true }
			);
		} else {
			setValue(
				`medicines.${groupIndex}.antibioticIds`,
				[...currentGroupList, antibioticId],
				{ shouldValidate: true }
			);
		}
	};

	const handleValidSubmit = (data: FormValues) => {
		const payload: TreatmentProtocolRequest = {
			severity: data.severity,
			treatmentSite: data.treatmentSite,
			version: data.version || "",
			publisher: data.publisher || "",
			isApplied: data.isApplied,
			pathogens: data.pathogens || [],
			criteria: data.criteria || [],
			medicines: data.medicines.map((group) => group.antibioticIds),
		};
		onSubmit(payload);
	};

	return (
		<form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-6 text-foreground">
			{/* Severity & Treatment Site */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label className="text-foreground">
						{tForm("severityLabel")} <span className="text-destructive">*</span>
					</Label>
					<Controller
						control={control}
						name="severity"
						render={({ field }) => (
							<Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
								<SelectTrigger className="bg-background text-foreground border-input">
									<SelectValue placeholder={tForm("severityPlaceholder")} />
								</SelectTrigger>
								<SelectContent className="bg-popover text-popover-foreground border-border">
									<SelectItem value="Mild">{tForm("severityMild")}</SelectItem>
									<SelectItem value="Moderate">{tForm("severityModerate")}</SelectItem>
									<SelectItem value="Severe">{tForm("severitySevere")}</SelectItem>
								</SelectContent>
							</Select>
						)}
					/>
				</div>

				<div className="space-y-2">
					<Label className="text-foreground">
						{tForm("treatmentSiteLabel")} <span className="text-destructive">*</span>
					</Label>
					<Controller
						control={control}
						name="treatmentSite"
						render={({ field }) => (
							<Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
								<SelectTrigger className="bg-background text-foreground border-input">
									<SelectValue placeholder={tForm("treatmentSitePlaceholder")} />
								</SelectTrigger>
								<SelectContent className="bg-popover text-popover-foreground border-border">
									<SelectItem value="Outpatient">{tForm("treatmentSiteOutpatient")}</SelectItem>
									<SelectItem value="Inpatient">{tForm("treatmentSiteInpatient")}</SelectItem>
									<SelectItem value="IntensiveCareUnit">{tForm("treatmentSiteICU")}</SelectItem>
								</SelectContent>
							</Select>
						)}
					/>
				</div>
			</div>

			{/* Version & Publisher */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label className="text-foreground">
						{tForm("versionLabel")} <span className="text-destructive">*</span>
					</Label>
					<Input
						{...register("version")}
						placeholder={tForm("versionPlaceholder")}
						disabled={isPending}
						className="bg-background text-foreground border-input"
					/>
					{errors.version && (
						<p className="text-xs text-destructive font-medium">{errors.version.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label className="text-foreground">
						{tForm("publisherLabel")} <span className="text-destructive">*</span>
					</Label>
					<Input
						{...register("publisher")}
						placeholder={tForm("publisherPlaceholder")}
						disabled={isPending}
						className="bg-background text-foreground border-input"
					/>
					{errors.publisher && (
						<p className="text-xs text-destructive font-medium">{errors.publisher.message}</p>
					)}
				</div>
			</div>

			{/* Optional Specific Indications */}
			<div className="p-4 border border-border rounded-lg bg-card/50 space-y-4">
				<h4 className="font-semibold text-sm border-b border-border pb-2 text-foreground">
					{tForm("optionalIndicationsTitle")}
				</h4>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Target Pathogens */}
					<div className="space-y-2 flex flex-col">
						<Label className="text-xs text-muted-foreground">{tForm("targetPathogensLabel")}</Label>
						<Popover open={openPathogenCombo} onOpenChange={setOpenPathogenCombo} modal={true}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className="justify-between font-normal bg-background text-muted-foreground border-input hover:bg-accent"
									disabled={isLoadingDropdowns || isPending}
								>
									{isLoadingDropdowns ? tForm("loading") : tForm("addPathogenPlaceholder")}
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover border-border">
								<Command className="bg-popover text-popover-foreground">
									<CommandInput placeholder={tForm("searchPathogenPlaceholder")} className="border-none focus:ring-0" />
									<CommandEmpty>{tForm("emptyPathogen")}</CommandEmpty>
									<CommandList>
										<CommandGroup>
											{pathogens.map((p) => (
												<CommandItem
													key={p.id}
													value={p.name}
													onSelect={() => toggleArrayItem("pathogens", p.id)}
													className="aria-selected:bg-accent aria-selected:text-accent-foreground"
												>
													<Check
														className={cn(
															"mr-2 h-4 w-4 text-primary",
															watchPathogens.includes(p.id) ? "opacity-100" : "opacity-0"
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
						{watchPathogens.length > 0 && (
							<div className="flex flex-wrap gap-1 mt-1">
								{watchPathogens.map((id) => {
									const p = pathogens.find((x) => x.id === id);
									if (!p) return null;
									return (
										<Badge
											key={id}
											variant="secondary"
											className="text-xs bg-background text-foreground border border-border"
										>
											{p.name}
											<X
												className="w-3 h-3 ml-1 cursor-pointer hover:text-destructive transition-colors"
												onClick={() => toggleArrayItem("pathogens", id)}
											/>
										</Badge>
									);
								})}
							</div>
						)}
					</div>

					{/* Criteria */}
					<div className="space-y-2 flex flex-col">
						<Label className="text-xs text-muted-foreground">{tForm("criteriaLabel")}</Label>
						<Popover open={openCriteriaCombo} onOpenChange={setOpenCriteriaCombo} modal={true}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className="justify-between font-normal bg-background text-muted-foreground border-input hover:bg-accent"
									disabled={isLoadingDropdowns || isPending}
								>
									{isLoadingDropdowns ? tForm("loading") : tForm("addCriteriaPlaceholder")}
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover border-border">
								<Command className="bg-popover text-popover-foreground">
									<CommandInput placeholder={tForm("searchCriteriaPlaceholder")} className="border-none focus:ring-0" />
									<CommandEmpty>{tForm("emptyCriteria")}</CommandEmpty>
									<CommandList>
										<CommandGroup>
											{criteria.map((c) => (
												<CommandItem
													key={c.id}
													value={c.name}
													onSelect={() => toggleArrayItem("criteria", c.id)}
													className="aria-selected:bg-accent aria-selected:text-accent-foreground"
												>
													<Check
														className={cn(
															"mr-2 h-4 w-4 text-primary",
															watchCriteria.includes(c.id) ? "opacity-100" : "opacity-0"
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
						{watchCriteria.length > 0 && (
							<div className="flex flex-wrap gap-1 mt-1">
								{watchCriteria.map((id) => {
									const c = criteria.find((x) => x.id === id);
									if (!c) return null;
									return (
										<Badge
											key={id}
											variant="secondary"
											className="text-xs bg-background text-foreground border border-border max-w-full text-left line-clamp-1"
											title={c.name}
										>
											<span className="truncate">{c.name}</span>
											<X
												className="w-3 h-3 ml-1 cursor-pointer shrink-0 hover:text-destructive transition-colors"
												onClick={() => toggleArrayItem("criteria", id)}
											/>
										</Badge>
									);
								})}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Antibiotic Protocols / Regimens */}
			<div className="space-y-4">
				<div className="flex items-center justify-between border-b border-border pb-2">
					<Label className="text-base font-semibold text-foreground">
						{tForm("antibioticProtocolsTitle")} <span className="text-destructive">*</span>
					</Label>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => appendGroup({ antibioticIds: [] })}
						disabled={isPending}
						className="border-border text-foreground hover:bg-accent"
					>
						<Plus className="w-4 h-4 mr-1" /> {tForm("addCombinationButton")}
					</Button>
				</div>

				{errors.medicines?.root && (
					<p className="text-xs text-destructive font-medium">{errors.medicines.root.message}</p>
				)}

				<div className="space-y-3">
					{medicineGroups.map((group, index) => {
						const groupAntibiotics = watchMedicines[index]?.antibioticIds || [];
						const groupError = errors.medicines?.[index]?.antibioticIds;

						return (
							<Card
								key={group.id}
								className={cn(
									"relative overflow-visible bg-card border-border text-card-foreground",
									groupError && "border-destructive"
								)}
							>
								<CardHeader className="py-3 px-4 bg-muted/40 border-b border-border flex flex-row items-center justify-between space-y-0">
									<CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
										<span className="bg-primary text-primary-foreground w-5 h-5 rounded-full inline-flex items-center justify-center text-xs">
											{index + 1}
										</span>
										{tForm("combinationGroupTitle", { index: index + 1 })}
									</CardTitle>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="h-7 w-7 text-destructive hover:bg-destructive/10"
										onClick={() => removeGroup(index)}
										disabled={medicineGroups.length === 1 || isPending}
									>
										<Trash2 className="w-4 h-4" />
									</Button>
								</CardHeader>
								<CardContent className="p-4 flex flex-col gap-3">
									<Popover
										open={openAntibioticComboForGroup === index}
										onOpenChange={(open) => setOpenAntibioticComboForGroup(open ? index : null)}
										modal={true}
									>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className="font-normal text-muted-foreground w-full md:w-1/2 bg-background border-input hover:bg-accent"
												disabled={isLoadingDropdowns || isPending}
											>
												<Plus className="w-4 h-4 mr-2" /> {tForm("addDrugToRegimen")}
											</Button>
										</PopoverTrigger>
										<PopoverContent
											className="w-[var(--radix-popover-trigger-width)] md:w-96 p-0 bg-popover border-border"
											align="start"
										>
											<Command className="bg-popover text-popover-foreground">
												<CommandInput placeholder={tForm("searchAntibioticPlaceholder")} className="border-none focus:ring-0" />
												<CommandEmpty>{tForm("emptyAntibiotic")}</CommandEmpty>
												<CommandList>
													<CommandGroup>
														{antibiotics.map((a) => (
															<CommandItem
																key={a.id}
																value={a.name}
																onSelect={() => toggleAntibioticInGroup(index, a.id)}
																className="aria-selected:bg-accent aria-selected:text-accent-foreground"
															>
																<Check
																	className={cn(
																		"mr-2 h-4 w-4 text-primary",
																		groupAntibiotics.includes(a.id) ? "opacity-100" : "opacity-0"
																	)}
																/>
																<div className="flex flex-col">
																	<span>{a.name}</span>
																	{a.classification && (
																		<span className="text-[10px] text-muted-foreground uppercase">
																			{a.classification}
																		</span>
																	)}
																</div>
															</CommandItem>
														))}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>

									<div className="flex flex-wrap gap-2">
										{groupAntibiotics.map((abId, i) => {
											const ab = antibiotics.find((x) => x.id === abId);
											if (!ab) return null;
											return (
												<div key={abId} className="flex items-center gap-1">
													<Badge
														variant="secondary"
														className="px-3 py-1.5 text-sm bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
													>
														{ab.name}
														<X
															className="w-4 h-4 ml-2 cursor-pointer opacity-70 hover:opacity-100"
															onClick={() => toggleAntibioticInGroup(index, abId)}
														/>
													</Badge>
													{i < groupAntibiotics.length - 1 && (
														<span className="text-muted-foreground font-bold text-lg mx-1">+</span>
													)}
												</div>
											);
										})}
									</div>
									{groupError && <p className="text-xs text-destructive font-medium">{groupError.message}</p>}
								</CardContent>
							</Card>
						);
					})}
				</div>
			</div>

			{/* Active Toggle (Edit Mode) */}
			{isEdit && (
				<div className="flex items-center gap-2 pt-2 border-t border-border">
					<Controller
						control={control}
						name="isApplied"
						render={({ field }) => (
							<Checkbox
								id="isApplied"
								checked={field.value}
								onCheckedChange={field.onChange}
								disabled={isPending}
							/>
						)}
					/>
					<Label htmlFor="isApplied" className="cursor-pointer font-medium text-foreground">
						{tForm("isAppliedLabel")}
					</Label>
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
					{isEdit ? tCommon("update") : tForm("saveProtocolButton")}
				</Button>
			</div>
		</form>
	);
}