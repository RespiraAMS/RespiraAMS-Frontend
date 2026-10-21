"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { usePathogensDropdown } from "../queries";
import {
	type SuspectedCauseItem,
	type CreateSuspectedCauseRequest,
	type UpdateSuspectedCauseRequest,
	Severity,
	TreatmentSite,
} from "../types";

const severityEnum: [Severity, ...Severity[]] = ["Mild", "Moderate", "Severe"];
const treatmentSiteEnum: [TreatmentSite, ...TreatmentSite[]] = [
	"Outpatient",
	"Inpatient",
	"IntensiveCareUnit",
];

interface SuspectedCauseFormProps {
	initialData?: SuspectedCauseItem | null;
	onSubmit: (data: CreateSuspectedCauseRequest | UpdateSuspectedCauseRequest) => void;
	onCancel: () => void;
	isPending?: boolean;
}

export function SuspectedCauseForm({
	initialData,
	onSubmit,
	onCancel,
	isPending,
}: SuspectedCauseFormProps) {
	const t = useTranslations("manager.suspectedCauses");
	const tVal = useTranslations("manager.suspectedCauses.validation");
	const tCommon = useTranslations("common");

	const isEdit = !!initialData;
	const { data: pathogensData, isLoading: isPathogensLoading } = usePathogensDropdown();
	const pathogensList = pathogensData?.pathogens || [];

	const formSchema = useMemo(() => {
		return z.object({
			pathogenId: z.string().trim().min(1, tVal("pathogenRequired")),
			severity: z.enum(severityEnum, { message: tVal("severityRequired") }),
			treatmentSite: z.enum(treatmentSiteEnum, { message: tVal("treatmentSiteRequired") }),
		});
	}, [tVal]);

	type FormValues = z.infer<typeof formSchema>;

	const defaultValues: FormValues = useMemo(() => {
		if (!initialData) return { pathogenId: "", severity: "Mild", treatmentSite: "Outpatient" };
		return {
			pathogenId: initialData.pathogenId,
			severity: initialData.severity,
			treatmentSite: initialData.treatmentSite,
		};
	}, [initialData]);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues,
	});

	useEffect(() => {
		reset(defaultValues);
	}, [defaultValues, reset]);

	const handleValidSubmit = (data: FormValues) => {
		onSubmit(data);
	};

	return (
		<form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-4 text-foreground">
			{/* Pathogen Selection */}
			<div className="space-y-2">
				<label className="text-sm font-medium text-foreground">
					{t("form.pathogenLabel")} <span className="text-destructive">*</span>
				</label>
				<Controller
					control={control}
					name="pathogenId"
					render={({ field }) => (
						<Select
							onValueChange={field.onChange}
							value={field.value}
							disabled={isPending || isPathogensLoading}
						>
							<SelectTrigger
								className={`bg-background text-foreground border-input ${
									errors.pathogenId ? "border-destructive" : ""
								}`}
							>
								<SelectValue placeholder={t("form.pathogenPlaceholder")} />
							</SelectTrigger>
							<SelectContent className="max-h-60 bg-popover text-popover-foreground border-border">
								{pathogensList.map((item) => (
									<SelectItem key={item.id} value={item.id}>
										{item.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				/>
				{errors.pathogenId && (
					<p className="text-sm text-destructive font-medium">{errors.pathogenId.message}</p>
				)}
			</div>

			{/* Severity Selection */}
			<div className="space-y-2">
				<label className="text-sm font-medium text-foreground">
					{t("form.severityLabel")} <span className="text-destructive">*</span>
				</label>
				<Controller
					control={control}
					name="severity"
					render={({ field }) => (
						<Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
							<SelectTrigger className="bg-background text-foreground border-input">
								<SelectValue placeholder={t("form.severityPlaceholder")} />
							</SelectTrigger>
							<SelectContent className="bg-popover text-popover-foreground border-border">
								<SelectItem value="Mild">{t("form.severityMild")}</SelectItem>
								<SelectItem value="Moderate">{t("form.severityModerate")}</SelectItem>
								<SelectItem value="Severe">{t("form.severitySevere")}</SelectItem>
							</SelectContent>
						</Select>
					)}
				/>
				{errors.severity && (
					<p className="text-sm text-destructive font-medium">{errors.severity.message}</p>
				)}
			</div>

			{/* Treatment Site Selection */}
			<div className="space-y-2">
				<label className="text-sm font-medium text-foreground">
					{t("form.treatmentSiteLabel")} <span className="text-destructive">*</span>
				</label>
				<Controller
					control={control}
					name="treatmentSite"
					render={({ field }) => (
						<Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
							<SelectTrigger className="bg-background text-foreground border-input">
								<SelectValue placeholder={t("form.treatmentSitePlaceholder")} />
							</SelectTrigger>
							<SelectContent className="bg-popover text-popover-foreground border-border">
								<SelectItem value="Outpatient">{t("form.siteOutpatient")}</SelectItem>
								<SelectItem value="Inpatient">{t("form.siteInpatient")}</SelectItem>
								<SelectItem value="IntensiveCareUnit">{t("form.siteICU")}</SelectItem>
							</SelectContent>
						</Select>
					)}
				/>
				{errors.treatmentSite && (
					<p className="text-sm text-destructive font-medium">{errors.treatmentSite.message}</p>
				)}
			</div>

			{/* Form Actions */}
			<div className="flex justify-end gap-2 pt-4 border-t border-border mt-6">
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