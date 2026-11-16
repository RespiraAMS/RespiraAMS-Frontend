"use client";

import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Check, ChevronsUpDown, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";
import {
	type CreateAntibiogramRequest,
	type UpdateAntibiogramRequest,
	type AntibiogramItem,
	type MicCategory,
} from "../types";
import { useAntibioticsDropdown, usePathogensDropdown } from "../queries";

interface AntibiogramFormProps {
	initialData?: AntibiogramItem | null;
	onSubmit: (data: CreateAntibiogramRequest | UpdateAntibiogramRequest) => void;
	onCancel: () => void;
	isPending?: boolean;
}

export function AntibiogramForm({ initialData, onSubmit, onCancel, isPending }: AntibiogramFormProps) {
	const tForm = useTranslations("manager.antibiograms.form");
	const tVal = useTranslations("manager.antibiograms.validation");
	const tCommon = useTranslations("common");

	const isEdit = !!initialData;
	const [openPathogenCombo, setOpenPathogenCombo] = useState(false);
	const [openAntibioticCombo, setOpenAntibioticCombo] = useState(false);

	const { data: pathogensData, isLoading: isLoadingPathogens } = usePathogensDropdown();
	const pathogens = pathogensData?.pathogens || [];

	const { data: antibioticsData, isLoading: isLoadingAntibiotics } = useAntibioticsDropdown();
	const antibiotics = antibioticsData?.antibiotics || [];

	const formSchema = useMemo(() => {
		return z.object({
			micCategory: z.enum(["Susceptible", "Intermediate", "Resistant"]),
			pathogenId: z.string().min(1, tVal("pathogenRequired")),
			antibioticIds: z.array(z.string()).min(1, tVal("antibioticRequired")),
		});
	}, [tVal]);

	type FormValues = z.infer<typeof formSchema>;

	const defaultValues: FormValues = useMemo(() => {
		if (!initialData) {
			return { micCategory: "Susceptible", pathogenId: "", antibioticIds: [] };
		}
		return {
			micCategory: initialData.micCategory,
			pathogenId: initialData.pathogen.id,
			antibioticIds: initialData.antibiotics.map((a) => a.id),
		};
	}, [initialData]);

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

	const selectedAntibioticIds = watch("antibioticIds");

	const toggleAntibiotic = (id: string) => {
		const currentIds = selectedAntibioticIds || [];
		if (currentIds.includes(id)) {
			setValue(
				"antibioticIds",
				currentIds.filter((cid) => cid !== id),
				{ shouldValidate: true }
			);
		} else {
			setValue("antibioticIds", [...currentIds, id], { shouldValidate: true });
		}
	};

	const handleValidSubmit = (data: FormValues) => {
		const payload = {
			micCategory: data.micCategory as MicCategory,
			pathogenId: data.pathogenId,
			antibioticIds: data.antibioticIds,
		};
		onSubmit(payload);
	};

	const getMicCategoryColor = (category: MicCategory) => {
		switch (category) {
			case "Susceptible":
				return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
			case "Intermediate":
				return "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30";
			case "Resistant":
				return "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30";
			default:
				return "text-foreground bg-muted border-border";
		}
	};

	return (
		<form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-6 text-foreground">
			{/* MIC Category */}
			<div className="space-y-2">
				<Label className="text-foreground">
					{tForm("micCategoryLabel")} <span className="text-destructive">*</span>
				</Label>
				<Controller
					control={control}
					name="micCategory"
					render={({ field }) => (
						<RadioGroup
							onValueChange={field.onChange}
							defaultValue={field.value}
							className="flex p-1 bg-muted/50 rounded-md border border-border"
							disabled={isPending}
						>
							{(["Susceptible", "Intermediate", "Resistant"] as MicCategory[]).map((category) => {
								const isSelected = field.value === category;
								return (
									<div key={category} className="flex-1 relative">
										<RadioGroupItem value={category} id={`mic-${category}`} className="peer sr-only hidden" />
										<Label
											htmlFor={`mic-${category}`}
											className={cn(
												"flex items-center justify-center py-2 px-3 text-sm font-medium rounded cursor-pointer transition-all border",
												isSelected
													? getMicCategoryColor(category) + " shadow-sm z-10"
													: "text-muted-foreground border-transparent hover:bg-background/50 hover:text-foreground"
											)}
										>
											{category === "Susceptible" && tForm("susceptible")}
											{category === "Intermediate" && tForm("intermediate")}
											{category === "Resistant" && tForm("resistant")}
										</Label>
									</div>
								);
							})}
						</RadioGroup>
					)}
				/>
			</div>

			{/* Pathogen Selection */}
			<div className="space-y-2 flex flex-col">
				<Label className="text-foreground">
					{tForm("pathogenLabel")} <span className="text-destructive">*</span>
				</Label>
				<Controller
					control={control}
					name="pathogenId"
					render={({ field }) => (
						<Popover open={openPathogenCombo} onOpenChange={setOpenPathogenCombo} modal={true}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={openPathogenCombo}
									className={cn(
										"justify-between font-normal w-full bg-background text-foreground border-input hover:bg-accent",
										!field.value && "text-muted-foreground",
										errors.pathogenId && "border-destructive"
									)}
									disabled={isPending || isLoadingPathogens}
								>
									<span className="truncate">
										{field.value
											? pathogens.find((p) => p.id === field.value)?.name
											: isLoadingPathogens
											? tForm("loading")
											: tForm("pathogenPlaceholder")}
									</span>
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover border-border">
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
				{errors.pathogenId && (
					<p className="text-xs text-destructive font-medium">{errors.pathogenId.message}</p>
				)}
			</div>

			{/* Antibiotics Selection */}
			<div className="space-y-2 flex flex-col">
				<Label className="text-foreground">
					{tForm("antibioticLabel")} <span className="text-destructive">*</span>
				</Label>

				<Popover open={openAntibioticCombo} onOpenChange={setOpenAntibioticCombo} modal={true}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							role="combobox"
							aria-expanded={openAntibioticCombo}
							className={cn(
								"justify-between font-normal w-full bg-background text-foreground border-input hover:bg-accent",
								errors.antibioticIds && "border-destructive"
							)}
							disabled={isPending || isLoadingAntibiotics}
						>
							<span className="text-muted-foreground">
								{isLoadingAntibiotics ? tForm("loading") : tForm("antibioticPlaceholder")}
							</span>
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover border-border">
						<Command className="bg-popover text-popover-foreground">
							<CommandInput placeholder={tForm("antibioticSearch")} className="border-none focus:ring-0" />
							<CommandEmpty>{tForm("antibioticEmpty")}</CommandEmpty>
							<CommandList>
								<CommandGroup>
									{antibiotics.map((a) => (
										<CommandItem
											key={a.id}
											value={a.name}
											onSelect={() => {
												toggleAntibiotic(a.id);
											}}
											className="aria-selected:bg-accent aria-selected:text-accent-foreground"
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4 text-primary",
													selectedAntibioticIds?.includes(a.id) ? "opacity-100" : "opacity-0"
												)}
											/>
											{a.name}
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>

				{/* Selected Badges */}
				{selectedAntibioticIds && selectedAntibioticIds.length > 0 && (
					<div className="flex flex-wrap gap-2 mt-2 p-3 border border-border rounded-md bg-muted/30">
						{selectedAntibioticIds.map((id) => {
							const ab = antibiotics.find((a) => a.id === id);
							if (!ab) return null;
							return (
								<Badge
									key={id}
									variant="secondary"
									className="flex items-center gap-1 font-medium bg-background text-foreground border border-border"
								>
									{ab.name}
									<button
										type="button"
										onClick={() => toggleAntibiotic(id)}
										className="text-muted-foreground hover:text-foreground ml-1 rounded-full p-0.5 hover:bg-muted"
										disabled={isPending}
									>
										<X className="w-3 h-3" />
									</button>
								</Badge>
							);
						})}
					</div>
				)}
				{errors.antibioticIds && (
					<p className="text-xs text-destructive font-medium">{errors.antibioticIds.message}</p>
				)}
			</div>

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
	);
}