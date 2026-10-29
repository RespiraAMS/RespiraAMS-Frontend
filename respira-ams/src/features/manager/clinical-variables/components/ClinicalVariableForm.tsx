"use client";

import { useMemo } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import {
	type CreateClinicalVariableRequest,
	type ClinicalVariableDetail,
	type RangeRule,
} from "../types";
import { PrerequisiteBuilder } from "../../components/PrerequisiteBuilder";
import { useClinicalVariablesDropdown } from "../queries";

const DECIMAL_MAX_STR = "79228162514264337593543950335";
const DECIMAL_MIN_STR = "-79228162514264337593543950335";

interface RangeFormValues {
	min?: string | number;
	isMinExclusive: boolean;
	max?: string | number;
	isMaxExclusive: boolean;
}

interface ClinicalVariableFormProps {
	initialData?: ClinicalVariableDetail | null;
	onSubmit: (data: CreateClinicalVariableRequest) => void;
	onCancel: () => void;
	isPending?: boolean;
}

export function ClinicalVariableForm({
	initialData,
	onSubmit,
	onCancel,
	isPending,
}: ClinicalVariableFormProps) {
	const t = useTranslations("manager.clinicalVariables");
	const tForm = useTranslations("manager.clinicalVariables.form");
	const tVal = useTranslations("manager.clinicalVariables.validation");
	const tCommon = useTranslations("common");

	const isEdit = !!initialData;

	const { data: dropdownData } = useClinicalVariablesDropdown();
	const variablesList = dropdownData?.clinicalVariables || [];

	const formSchema = useMemo(() => {
		return z
			.object({
				name: z.string().trim().min(1, tVal("nameRequired")),
				code: z.string().trim().min(1, tVal("codeRequired")),
				description: z.string().trim().min(1, tVal("descriptionRequired")),
				isRequired: z.boolean(),
				category: z.enum(["PersonalInformation", "Paraclinical", "Clinical"]),
				valueType: z.enum(["Numeric", "Boolean", "Categorical"]),
				canonicalUnit: z.string().optional(),

				acceptedRange: z
					.object({
						min: z.string().optional(),
						isMinExclusive: z.boolean(),
						max: z.string().optional(),
						isMaxExclusive: z.boolean(),
					})
					.optional(),

				normalRange: z
					.object({
						min: z.string().optional(),
						isMinExclusive: z.boolean(),
						max: z.string().optional(),
						isMaxExclusive: z.boolean(),
					})
					.optional(),

				acceptedValuesList: z.array(z.object({ value: z.string() })).optional(),

				prerequisiteFormula: z.any().optional(),
			})
			.superRefine((data, ctx) => {
				if (data.valueType === "Categorical") {
					if (!data.acceptedValuesList || data.acceptedValuesList.length === 0) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: tVal("atLeastOneOption"),
							path: ["acceptedValuesList"],
						});
					} else {
						data.acceptedValuesList.forEach((item, index) => {
							if (!item.value.trim()) {
								ctx.addIssue({
									code: z.ZodIssueCode.custom,
									message: tVal("optionNotEmpty"),
									path: ["acceptedValuesList", index, "value"],
								});
							}
						});
					}
				}

				if (data.valueType === "Numeric") {
					const accMinStr = data.acceptedRange?.min;
					const accMaxStr = data.acceptedRange?.max;
					const normMinStr = data.normalRange?.min;
					const normMaxStr = data.normalRange?.max;

					if (accMinStr && accMaxStr && Number(accMinStr) > Number(accMaxStr)) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: tVal("minNotGreaterThanMax"),
							path: ["acceptedRange", "max"],
						});
					}

					if (normMinStr && normMaxStr && Number(normMinStr) > Number(normMaxStr)) {
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: tVal("minNotGreaterThanMax"),
							path: ["normalRange", "max"],
						});
					}

					const accMin = accMinStr ? Number(accMinStr) : -Infinity;
					const accMax = accMaxStr ? Number(accMaxStr) : Infinity;

					if (normMinStr) {
						if (Number(normMinStr) < accMin) {
							ctx.addIssue({
								code: z.ZodIssueCode.custom,
								message: tVal("normalMinLessThanAccepted"),
								path: ["normalRange", "min"],
							});
						}
					}
					if (normMaxStr) {
						if (Number(normMaxStr) > accMax) {
							ctx.addIssue({
								code: z.ZodIssueCode.custom,
								message: tVal("normalMaxGreaterThanAccepted"),
								path: ["normalRange", "max"],
							});
						}
					}
				}
			});
	}, [tVal]);

	type FormValues = z.infer<typeof formSchema>;

	const defaultValues: FormValues = useMemo(() => {
		const mapRange = (range: RangeFormValues | undefined | null) => {
			if (!range) return { min: "", isMinExclusive: false, max: "", isMaxExclusive: false };

			const isMinExtreme =
				range.min?.toString() === DECIMAL_MIN_STR ||
				range.min?.toString() === "-7.922816251426434e+28";
			const isMaxExtreme =
				range.max?.toString() === DECIMAL_MAX_STR ||
				range.max?.toString() === "7.922816251426434e+28";

			return {
				isMinExclusive: range.isMinExclusive,
				isMaxExclusive: range.isMaxExclusive,
				min: range.min === undefined || range.min === null || isMinExtreme ? "" : range.min.toString(),
				max: range.max === undefined || range.max === null || isMaxExtreme ? "" : range.max.toString(),
			};
		};

		if (!initialData) {
			return {
				name: "",
				code: "",
				description: "",
				isRequired: false,
				valueType: "Numeric",
				category: "Clinical",
				canonicalUnit: undefined,
				acceptedRange: mapRange(undefined),
				normalRange: mapRange(undefined),
				acceptedValuesList: [{ value: "" }],
				prerequisiteFormula: undefined,
			};
		}

		const mappedAcceptedValues =
			initialData.acceptedValues && initialData.acceptedValues.length > 0
				? initialData.acceptedValues.map((v) => ({ value: v }))
				: [{ value: "" }];

		return {
			name: initialData.name,
			code: initialData.code,
			description: initialData.description || "",
			isRequired: initialData.isRequired,
			valueType: initialData.valueType,
			category: initialData.category,
			canonicalUnit: initialData.canonicalUnit || undefined,
			acceptedRange: mapRange(initialData.acceptedRange as RangeFormValues),
			normalRange: mapRange(initialData.normalRange as RangeFormValues),
			acceptedValuesList: mappedAcceptedValues,
			prerequisiteFormula: initialData.prerequisiteFormula || undefined,
		};
	}, [initialData]);

	const {
		register,
		control,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues,
	});

	const watchValueType = watch("valueType");
	const watchCanonicalUnit = watch("canonicalUnit");

	const {
		fields: categoricalFields,
		append: appendCategorical,
		remove: removeCategorical,
	} = useFieldArray({
		control,
		name: "acceptedValuesList",
	});

	const handleValidSubmit = (data: FormValues) => {
		const payload: CreateClinicalVariableRequest = {
			name: data.name,
			code: data.code,
			description: data.description || "",
			isRequired: data.isRequired,
			category: data.category,
			valueType: data.valueType,
			canonicalUnit: data.canonicalUnit || undefined,
			prerequisite: data.prerequisiteFormula,
		};

		const parseAcceptedRange = (range: FormValues["acceptedRange"], unit: string | undefined): RangeRule => {
			return {
				min:
					range?.min === "" || range?.min === undefined
						? (DECIMAL_MIN_STR as unknown as RangeRule["min"])
						: Number(range?.min),
				isMinExclusive: range?.isMinExclusive || false,
				max:
					range?.max === "" || range?.max === undefined
						? (DECIMAL_MAX_STR as unknown as RangeRule["max"])
						: Number(range?.max),
				isMaxExclusive: range?.isMaxExclusive || false,
				unit: unit || null,
			};
		};

		const parseNormalRange = (
			range: FormValues["normalRange"],
			unit: string | undefined
		): RangeRule | undefined => {
			if (!range || (range.min === "" && range.max === "")) {
				return undefined;
			}
			return {
				min:
					range.min === "" || range.min === undefined
						? (DECIMAL_MIN_STR as unknown as RangeRule["min"])
						: Number(range.min),
				isMinExclusive: range.isMinExclusive || false,
				max:
					range.max === "" || range.max === undefined
						? (DECIMAL_MAX_STR as unknown as RangeRule["max"])
						: Number(range.max),
				isMaxExclusive: range.isMaxExclusive || false,
				unit: unit || null,
			};
		};

		if (watchValueType === "Numeric") {
			payload.acceptedRange = parseAcceptedRange(data.acceptedRange, data.canonicalUnit);
			payload.normalRange = parseNormalRange(data.normalRange, data.canonicalUnit);
			payload.acceptedValues = undefined;
		} else if (watchValueType === "Categorical") {
			payload.acceptedValues =
				data.acceptedValuesList?.map((item) => item.value.trim()).filter(Boolean) || [];
			payload.acceptedRange = undefined;
			payload.normalRange = undefined;
		} else {
			payload.acceptedRange = undefined;
			payload.normalRange = undefined;
			payload.acceptedValues = undefined;
		}

		onSubmit(payload);
	};

	return (
		<form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 text-foreground">
			{/* Name & Code */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label className="text-foreground">
						{tForm("nameLabel")} <span className="text-destructive">*</span>
					</Label>
					<Input
						{...register("name")}
						placeholder={tForm("namePlaceholder")}
						className="bg-background text-foreground border-input placeholder:text-muted-foreground"
					/>
					{errors.name && <p className="text-xs text-destructive font-medium">{errors.name.message}</p>}
				</div>
				<div className="space-y-2">
					<Label className="text-foreground">
						{tForm("codeLabel")} <span className="text-destructive">*</span>
					</Label>
					<Input 
						{...register("code")}
						placeholder={tForm("codePlaceholder")}
						disabled={isPending || isEdit}
						className={
							isEdit
								? "bg-muted cursor-not-allowed border-input text-muted-foreground font-mono"
								: "bg-background text-foreground border-input placeholder:text-muted-foreground font-mono"
						}
					/>
					{errors.code && <p className="text-xs text-destructive font-medium">{errors.code.message}</p>}
					{isEdit && <p className="text-xs text-muted-foreground">{tForm("codeImmutableNotice")}</p>}
				</div>
			</div>

			{/* Description */}
			<div className="space-y-2">
				<Label className="text-foreground">
					{tForm("descriptionLabel")} <span className="text-destructive">*</span>
				</Label>
				<Textarea
					{...register("description")}
					rows={2}
					className="bg-background text-foreground border-input placeholder:text-muted-foreground resize-none"
				/>
				{errors.description && (
					<p className="text-xs text-destructive font-medium">{errors.description.message}</p>
				)}
			</div>

			{/* Category & ValueType */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label className="text-foreground">{tForm("categoryLabel")}</Label>
					<Controller
						control={control}
						name="category"
						render={({ field }) => (
							<Select onValueChange={field.onChange} value={field.value}>
								<SelectTrigger className="bg-background text-foreground border-input">
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="bg-popover text-popover-foreground border-border">
									<SelectItem value="PersonalInformation">{t("categories.personal")}</SelectItem>
									<SelectItem value="Clinical">{t("categories.clinical")}</SelectItem>
									<SelectItem value="Paraclinical">{t("categories.paraclinical")}</SelectItem>
								</SelectContent>
							</Select>
						)}
					/>
				</div>
				<div className="space-y-2">
					<Label className="text-foreground">{tForm("valueTypeLabel")}</Label>
					<Controller
						control={control}
						name="valueType"
						render={({ field }) => (
							<Select onValueChange={field.onChange} value={field.value} disabled={isEdit}>
								<SelectTrigger className={isEdit ? "bg-muted cursor-not-allowed border-input" : "bg-background text-foreground border-input"}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="bg-popover text-popover-foreground border-border">
									<SelectItem value="Numeric">{t("valueTypes.numeric")}</SelectItem>
									<SelectItem value="Boolean">{t("valueTypes.boolean")}</SelectItem>
									<SelectItem value="Categorical">{t("valueTypes.categorical")}</SelectItem>
								</SelectContent>
							</Select>
						)}
					/>
					{isEdit && <p className="text-xs text-muted-foreground">{tForm("valueTypeImmutableNotice")}</p>}
				</div>
			</div>

			{/* Checkbox Required */}
			<div className="flex items-center gap-2 pt-2 border-b border-border pb-4">
				<Controller
					control={control}
					name="isRequired"
					render={({ field }) => (
						<Checkbox
							id="isRequired"
							checked={field.value}
							onCheckedChange={field.onChange}
						/>
					)}
				/>
				<Label htmlFor="isRequired" className="cursor-pointer text-foreground font-medium select-none">
					{tForm("isRequiredLabel")}
				</Label>
			</div>

			{/* Numeric Range Settings */}
			{watchValueType === "Numeric" && (
				<div className="space-y-4 bg-muted/40 p-4 rounded-lg border border-border">
					<h4 className="font-semibold text-sm text-foreground">{tForm("rangeConfigTitle")}</h4>

					<div className="space-y-2">
						<Label className="text-foreground">{tForm("unitLabel")}</Label>
						<Input
							{...register("canonicalUnit")}
							placeholder={tForm("unitPlaceholder")}
							className="w-full sm:w-1/3 bg-background text-foreground border-input"
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Accepted Range */}
						<div className="space-y-3 p-3 bg-card border border-border rounded-md">
							<Label className="text-blue-600 dark:text-blue-400 font-bold block">
								{tForm("acceptedRangeLabel")}
							</Label>

							{errors.acceptedRange?.max?.message && (
								<p className="text-xs text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
									{errors.acceptedRange.max.message}
								</p>
							)}

							<div className="flex items-center gap-2">
								<Controller
									control={control}
									name="acceptedRange.isMinExclusive"
									render={({ field }) => (
										<Button
											type="button"
											variant="outline"
											size="sm"
											className="w-12 px-0 font-bold border-border text-foreground hover:bg-accent"
											onClick={() => field.onChange(!field.value)}
										>
											{field.value ? ">" : "≥"}
										</Button>
									)}
								/>
								<div className="relative flex-1">
									<Input
										{...register("acceptedRange.min")}
										type="number"
										step="any"
										className="bg-background text-foreground border-input"
									/>
								</div>
								{watchCanonicalUnit && <span className="text-xs text-muted-foreground">{watchCanonicalUnit}</span>}
							</div>

							<div className="flex items-center gap-2">
								<Controller
									control={control}
									name="acceptedRange.isMaxExclusive"
									render={({ field }) => (
										<Button
											type="button"
											variant="outline"
											size="sm"
											className="w-12 px-0 font-bold border-border text-foreground hover:bg-accent"
											onClick={() => field.onChange(!field.value)}
										>
											{field.value ? "<" : "≤"}
										</Button>
									)}
								/>
								<div className="relative flex-1">
									<Input
										{...register("acceptedRange.max")}
										type="number"
										step="any"
										className="bg-background text-foreground border-input"
									/>
								</div>
								{watchCanonicalUnit && <span className="text-xs text-muted-foreground">{watchCanonicalUnit}</span>}
							</div>
						</div>

						{/* Normal Range */}
						<div className="space-y-3 p-3 bg-card border border-border rounded-md">
							<Label className="text-emerald-600 dark:text-emerald-400 font-bold flex gap-2 items-center">
								{tForm("normalRangeLabel")}
								<span className="text-[10px] font-normal text-muted-foreground border border-border rounded px-1">
									{tForm("optionalBadge")}
								</span>
							</Label>

							{errors.normalRange?.min?.message && (
								<p className="text-xs text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
									{errors.normalRange.min.message}
								</p>
							)}
							{errors.normalRange?.max?.message && (
								<p className="text-xs text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
									{errors.normalRange.max.message}
								</p>
							)}

							<div className="flex items-center gap-2">
								<Controller
									control={control}
									name="normalRange.isMinExclusive"
									render={({ field }) => (
										<Button
											type="button"
											variant="outline"
											size="sm"
											className="w-12 px-0 font-bold border-border text-foreground hover:bg-accent"
											onClick={() => field.onChange(!field.value)}
										>
											{field.value ? ">" : "≥"}
										</Button>
									)}
								/>
								<div className="relative flex-1">
									<Input
										{...register("normalRange.min")}
										type="number"
										step="any"
										className="bg-background text-foreground border-input"
									/>
								</div>
								{watchCanonicalUnit && <span className="text-xs text-muted-foreground">{watchCanonicalUnit}</span>}
							</div>

							<div className="flex items-center gap-2">
								<Controller
									control={control}
									name="normalRange.isMaxExclusive"
									render={({ field }) => (
										<Button
											type="button"
											variant="outline"
											size="sm"
											className="w-12 px-0 font-bold border-border text-foreground hover:bg-accent"
											onClick={() => field.onChange(!field.value)}
										>
											{field.value ? "<" : "≤"}
										</Button>
									)}
								/>
								<div className="relative flex-1">
									<Input
										{...register("normalRange.max")}
										type="number"
										step="any"
										className="bg-background text-foreground border-input"
									/>
								</div>
								{watchCanonicalUnit && <span className="text-xs text-muted-foreground">{watchCanonicalUnit}</span>}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Categorical Value Settings */}
			{watchValueType === "Categorical" && (
				<div className="space-y-3 bg-muted/40 p-4 rounded-lg border border-border">
					<Label className="block mb-2 text-foreground font-semibold">
						{tForm("categoricalConfigTitle")} <span className="text-destructive">*</span>
					</Label>

					{errors.acceptedValuesList?.message && (
						<p className="text-xs text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
							{errors.acceptedValuesList.message}
						</p>
					)}

					<div className="space-y-2">
						{categoricalFields.map((field, index) => (
							<div key={field.id} className="flex flex-col gap-1">
								<div className="flex items-center gap-2">
									<div className="flex-1">
										<Input
											{...register(`acceptedValuesList.${index}.value`)}
											placeholder={tForm("optionPlaceholder", { index: index + 1 })}
											className="bg-background text-foreground border-input"
										/>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="text-destructive hover:bg-destructive/10"
										onClick={() => removeCategorical(index)}
										disabled={categoricalFields.length === 1}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
								{errors.acceptedValuesList?.[index]?.value?.message && (
									<p className="text-xs text-destructive font-medium">
										{errors.acceptedValuesList[index]?.value?.message}
									</p>
								)}
							</div>
						))}
					</div>

					<Button
						type="button"
						variant="secondary"
						size="sm"
						className="mt-2 border border-border text-foreground hover:bg-accent"
						onClick={() => appendCategorical({ value: "" })}
					>
						<Plus className="h-4 w-4 mr-1" /> {tForm("addOption")}
					</Button>
				</div>
			)}

			{/* Prerequisite Builder */}
			<Controller
				control={control}
				name="prerequisiteFormula"
				render={({ field }) => (
					<PrerequisiteBuilder
						title={tForm("prerequisiteTitle")}
						value={field.value || null}
						onChange={field.onChange}
						variables={variablesList}
					/>
				)}
			/>

			{/* Sticky Footer Actions */}
			<div className="flex justify-end gap-2 border-t border-border sticky bottom-0 py-4 -mx-2 px-2 bg-popover text-popover-foreground">
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