"use client";

import { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import {
	type CreateClinicalMetricRequest,
	type UpdateClinicalMetricRequest,
	type ClinicalMetricItem,
} from "../types";

interface ClinicalMetricFormProps {
	initialData?: ClinicalMetricItem | null;
	onSubmit: (data: CreateClinicalMetricRequest | UpdateClinicalMetricRequest) => void;
	onCancel: () => void;
	isPending?: boolean;
}

export function ClinicalMetricForm({
	initialData,
	onSubmit,
	onCancel,
	isPending,
}: ClinicalMetricFormProps) {
	const tForm = useTranslations("manager.clinicalMetrics.form");
	const tVal = useTranslations("manager.clinicalMetrics.validation");
	const tCommon = useTranslations("common");

	const isEdit = !!initialData;

	const formSchema = useMemo(() => {
		return z.object({
			name: z.string().trim().min(1, tVal("nameRequired")),
			code: z.string().optional(),
			description: z.string().trim().min(1, tVal("descriptionRequired")),
			version: z.string().trim().min(1, tVal("versionRequired")),
			publisher: z.string().trim().min(1, tVal("publisherRequired")),
			isApplied: z.boolean(),
		});
	}, [tVal]);

	type FormValues = z.infer<typeof formSchema>;

	const defaultValues: FormValues = useMemo(() => {
		if (!initialData)
			return {
				name: "",
				code: "",
				description: "",
				version: "",
				publisher: "",
				isApplied: true,
			};
		return {
			name: initialData.name,
			code: initialData.code,
			description: initialData.description,
			version: initialData.version,
			publisher: initialData.publisher,
			isApplied: initialData.isApplied,
		};
	}, [initialData]);

	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues,
	});

	const handleValidSubmit = (data: FormValues) => {
		if (isEdit) {
			onSubmit({
				name: data.name,
				description: data.description,
				version: data.version,
				publisher: data.publisher,
				isApplied: data.isApplied,
			} as UpdateClinicalMetricRequest);
		} else {
			if (!data.code || !data.code.trim()) {
				return;
			}
			onSubmit({
				name: data.name,
				code: data.code.trim(),
				description: data.description,
				version: data.version,
				publisher: data.publisher,
			} as CreateClinicalMetricRequest);
		}
	};

	return (
		<form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-4 text-foreground">
			{/* Name & Code */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label className="text-foreground">
						{tForm("nameLabel")} <span className="text-destructive">*</span>
					</Label>
					<Input
						{...register("name")}
						placeholder={tForm("namePlaceholder")}
						disabled={isPending}
						className="bg-background text-foreground border-input placeholder:text-muted-foreground"
					/>
					{errors.name && <p className="text-xs text-destructive font-medium">{errors.name.message}</p>}
				</div>

				<div className="space-y-2">
					<Label className="text-foreground">
						{tForm("codeLabel")} {!isEdit && <span className="text-destructive">*</span>}
					</Label>
					<Input
						{...register("code", { required: !isEdit })}
						placeholder={tForm("codePlaceholder")}
						disabled={isPending || isEdit}
						className={
							isEdit
								? "bg-muted cursor-not-allowed border-input text-muted-foreground font-mono"
								: "bg-background text-foreground border-input placeholder:text-muted-foreground font-mono"
						}
					/>
					{!isEdit && errors.code && (
						<p className="text-xs text-destructive font-medium">{tVal("codeRequired")}</p>
					)}
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
					disabled={isPending}
					className="bg-background text-foreground border-input placeholder:text-muted-foreground resize-none"
				/>
				{errors.description && (
					<p className="text-xs text-destructive font-medium">{errors.description.message}</p>
				)}
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
						className="bg-background text-foreground border-input placeholder:text-muted-foreground"
					/>
					{errors.version && <p className="text-xs text-destructive font-medium">{errors.version.message}</p>}
				</div>

				<div className="space-y-2">
					<Label className="text-foreground">
						{tForm("publisherLabel")} <span className="text-destructive">*</span>
					</Label>
					<Input
						{...register("publisher")}
						placeholder={tForm("publisherPlaceholder")}
						disabled={isPending}
						className="bg-background text-foreground border-input placeholder:text-muted-foreground"
					/>
					{errors.publisher && (
						<p className="text-xs text-destructive font-medium">{errors.publisher.message}</p>
					)}
				</div>
			</div>

			{/* Applied Checkbox on Edit */}
			{isEdit && (
				<div className="flex items-center gap-2 pt-2 border-t border-border mt-4">
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
					<Label htmlFor="isApplied" className="cursor-pointer font-medium text-foreground select-none">
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
					{isEdit ? tCommon("update") : tCommon("create")}
				</Button>
			</div>
		</form>
	);
}