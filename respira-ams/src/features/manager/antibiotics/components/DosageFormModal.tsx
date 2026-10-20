"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { type DosageItem, type DosageRequest } from "../types";

const MAX_DECIMAL = 7.922816251426434e+28;

const isMaxDecimalValue = (val?: number | null) => val != null && val >= 7.92281625e28;

interface DosageFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: DosageRequest) => void;
	initialData?: DosageItem | null;
	existingDosages: DosageItem[];
	isPending?: boolean;
}

function areRangesOverlapping(
	r1: { min: number; isMinExclusive: boolean; max: number; isMaxExclusive: boolean },
	r2: { min: number; isMinExclusive: boolean; max: number; isMaxExclusive: boolean }
): boolean {
	if (r1.min > r2.max || r2.min > r1.max) return false;
	if (r1.max < r2.min || r2.max < r1.min) return false;

	if (r1.max === r2.min) {
		return !r1.isMaxExclusive && !r2.isMinExclusive;
	}
	if (r2.max === r1.min) {
		return !r2.isMaxExclusive && !r1.isMinExclusive;
	}

	return true;
}

const parseOptionalNumber = (val: unknown) => {
	if (val === "" || val === null || val === undefined) return undefined;
	const num = Number(val);
	return Number.isNaN(num) ? undefined : num;
};

export function DosageFormModal({
	isOpen,
	onClose,
	onSubmit,
	initialData,
	existingDosages,
	isPending = false,
}: DosageFormModalProps) {
	const t = useTranslations("manager.antibiotics");
	const tVal = useTranslations("manager.antibiotics.validation");
	const tCommon = useTranslations("common");

	const isEdit = !!initialData;

	const dosageSchema = useMemo(() => {
		return z.object({
			routeOfAdministration: z.string().min(1, tVal("routeRequired")),
			dose: z.string().trim().min(1, tVal("doseRequired")),
			isStandardDose: z.boolean(),
			min: z.preprocess(
				parseOptionalNumber,
				z.number({ error: tVal("minNumber") }).min(0, tVal("minNonNegative")).optional()
			),
			isMinExclusive: z.boolean(),
			max: z.preprocess(
				parseOptionalNumber,
				z.number({ error: tVal("maxNumber") }).min(0, tVal("maxNonNegative")).optional()
			),
			isMaxExclusive: z.boolean(),
		});
	}, [tVal]);

	type FormInput = z.input<typeof dosageSchema>;
	type FormOutput = z.output<typeof dosageSchema>;

	const defaultValues: FormInput = useMemo(() => {
		if (!initialData) {
			return {
				routeOfAdministration: "Oral",
				dose: "",
				isStandardDose: true,
				min: 0,
				isMinExclusive: false,
				max: undefined,
				isMaxExclusive: false,
			};
		}
		const isStandard = !initialData.crcl;
		const rawMax = initialData.crcl?.max;

		return {
			routeOfAdministration: initialData.routeOfAdministration,
			dose: initialData.dose,
			isStandardDose: isStandard,
			min: initialData.crcl?.min ?? 0,
			isMinExclusive: initialData.crcl?.isMinExclusive ?? false,
			max: isMaxDecimalValue(rawMax) ? undefined : (rawMax ?? undefined),
			isMaxExclusive: initialData.crcl?.isMaxExclusive ?? false,
		};
	}, [initialData]);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		setError,
		clearErrors,
		reset,
		formState: { errors },
	} = useForm<FormInput, unknown, FormOutput>({
		resolver: zodResolver(dosageSchema),
		defaultValues,
	});

	useEffect(() => {
		if (isOpen) {
			reset(defaultValues);
		}
	}, [isOpen, defaultValues, reset]);

	const isStandardDose = watch("isStandardDose");

	const onValidSubmit = (data: FormOutput) => {
		clearErrors();
		const otherDosages = existingDosages.filter(
			(d) => d.routeOfAdministration.toLowerCase() === data.routeOfAdministration.toLowerCase() && d.id !== initialData?.id
		);

		if (data.isStandardDose) {
			const hasStandard = otherDosages.some((d) => !d.crcl);
			if (hasStandard) {
				setError("isStandardDose", {
					message: tVal("hasStandardDose", { route: data.routeOfAdministration }),
				});
				return;
			}

			onSubmit({
				routeOfAdministration: data.routeOfAdministration,
				dose: data.dose,
				crcl: null,
			});
		} else {
			const minVal = data.min ?? 0;
			const maxVal = data.max ?? MAX_DECIMAL;

			if (minVal >= maxVal) {
				setError("min", { message: tVal("minLessThanMax") });
				return;
			}

			const newRange = {
				min: minVal,
				isMinExclusive: data.isMinExclusive,
				max: maxVal,
				isMaxExclusive: data.isMaxExclusive,
			};

			const hasOverlap = otherDosages.some((d) => {
				if (!d.crcl) return false;
				return areRangesOverlapping(newRange, d.crcl);
			});

			if (hasOverlap) {
				const maxDisplay = maxVal === MAX_DECIMAL ? "∞" : maxVal;
				setError("min", {
					message: tVal("crclOverlap", {
						min: minVal,
						max: maxDisplay,
						route: data.routeOfAdministration,
					}),
				});
				return;
			}

			onSubmit({
				routeOfAdministration: data.routeOfAdministration,
				dose: data.dose,
				crcl: {
					min: minVal,
					isMinExclusive: data.isMinExclusive,
					max: maxVal,
					isMaxExclusive: data.isMaxExclusive,
					unit: null,
				},
			});
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[500px] border-border bg-card text-card-foreground">
				<DialogHeader>
					<DialogTitle className="text-xl font-bold text-foreground">
						{isEdit ? t("dosageModal.updateTitle") : t("dosageModal.createTitle")}
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit(onValidSubmit)} className="space-y-4 pt-2">
					{/* Route selection */}
					<div className="flex flex-col gap-2">
						<label className="text-sm font-medium text-foreground">
							{t("form.routeLabel")} <span className="text-destructive">*</span>
						</label>
						<select
							{...register("routeOfAdministration")}
							disabled={isPending}
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						>
							<option value="Oral">Oral ({t("form.routeOral")})</option>
							<option value="Intravenous">Intravenous ({t("form.routeIntravenous")})</option>
						</select>
						{errors.routeOfAdministration && (
							<p className="text-sm text-destructive font-medium">
								{errors.routeOfAdministration.message}
							</p>
						)}
					</div>

					{/* Dose Input */}
					<div className="flex flex-col gap-2">
						<label className="text-sm font-medium text-foreground">
							{t("form.doseLabel")} <span className="text-destructive">*</span>
						</label>
						<Input
							{...register("dose")}
							disabled={isPending}
							placeholder={t("form.dosagePlaceholder")}
							className="bg-background text-foreground border-input placeholder:text-muted-foreground"
						/>
						{errors.dose && (
							<p className="text-sm text-destructive font-medium">{errors.dose.message}</p>
						)}
					</div>

					{/* Standard Dose Checkbox */}
					<div className="flex items-center gap-2 pt-2">
						<Checkbox
							id="isStandardDose"
							checked={isStandardDose}
							onCheckedChange={(checked) => setValue("isStandardDose", !!checked)}
							disabled={isPending}
						/>
						<label htmlFor="isStandardDose" className="text-sm font-medium cursor-pointer text-foreground">
							{t("form.isStandardDoseLabel")}
						</label>
					</div>
					{errors.isStandardDose && (
						<p className="text-sm text-destructive font-medium">{errors.isStandardDose.message}</p>
					)}

					{/* CrCl Range Panel */}
					{!isStandardDose && (
						<div className="rounded-lg border border-border p-4 space-y-4 bg-muted/30">
							<h4 className="text-sm font-semibold text-foreground">{t("form.crclRangeLabel")}</h4>

							<div className="grid grid-cols-2 gap-4">
								{/* Min */}
								<div className="space-y-2">
									<label className="text-xs font-medium text-foreground">{t("form.minLabel")}</label>
									<Input
										type="number"
										step="any"
										{...register("min")}
										disabled={isPending}
										placeholder="0"
										className="bg-background text-foreground border-input"
									/>
									<div className="flex items-center gap-2">
										<Checkbox
											id="isMinExclusive"
											checked={watch("isMinExclusive")}
											onCheckedChange={(val) => setValue("isMinExclusive", !!val)}
										/>
										<label htmlFor="isMinExclusive" className="text-xs text-muted-foreground cursor-pointer">
											{t("form.isMinExclusiveLabel")}
										</label>
									</div>
									{errors.min && <p className="text-sm text-destructive font-medium">{errors.min.message}</p>}
								</div>

								{/* Max */}
								<div className="space-y-2">
									<label className="text-xs font-medium text-foreground">{t("form.maxLabel")}</label>
									<Input
										type="number"
										step="any"
										{...register("max")}
										disabled={isPending}
										placeholder={t("form.unlimitedPlaceholder")}
										className="bg-background text-foreground border-input placeholder:text-muted-foreground"
									/>
									<div className="flex items-center gap-2">
										<Checkbox
											id="isMaxExclusive"
											checked={watch("isMaxExclusive")}
											onCheckedChange={(val) => setValue("isMaxExclusive", !!val)}
										/>
										<label htmlFor="isMaxExclusive" className="text-xs text-muted-foreground cursor-pointer">
											{t("form.isMaxExclusiveLabel")}
										</label>
									</div>
									{errors.max && <p className="text-sm text-destructive font-medium">{errors.max.message}</p>}
								</div>
							</div>
						</div>
					)}

					{/* Form Actions */}
					<div className="flex gap-2 justify-end pt-4 border-t border-border">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isPending}
							className="border-border text-foreground hover:bg-accent"
						>
							{tCommon("cancel")}
						</Button>
						<Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
							{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{isEdit ? tCommon("update") : tCommon("create")}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}