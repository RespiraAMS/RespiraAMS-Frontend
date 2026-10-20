"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import { type PathogenItem, type CreatePathogenRequest, type UpdatePathogenRequest } from "../types";

interface PathogenFormProps {
	initialData?: PathogenItem | null;
	onSubmit: (data: CreatePathogenRequest | UpdatePathogenRequest) => void;
	onCancel: () => void;
	isPending?: boolean;
}

export function PathogenForm({ initialData, onSubmit, onCancel, isPending }: PathogenFormProps) {
	const t = useTranslations("manager.pathogens");
	const tVal = useTranslations("manager.pathogens.validation");
	const tCommon = useTranslations("common");

	const isEdit = !!initialData;

	const pathogenSchema = useMemo(() => {
		return z.object({
			name: z.string().trim().min(1, tVal("nameRequired")),
			description: z.string().trim().min(1, tVal("descriptionRequired")),
			isAtypical: z.boolean(),
		});
	}, [tVal]);

	type FormValues = z.infer<typeof pathogenSchema>;

	const defaultValues: FormValues = useMemo(() => {
		if (!initialData) return { name: "", description: "", isAtypical: false };
		return {
			name: initialData.name,
			description: initialData.description,
			isAtypical: initialData.isAtypical,
		};
	}, [initialData]);

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(pathogenSchema),
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
			{/* Pathogen Name */}
			<div className="space-y-2">
				<label className="text-sm font-medium text-foreground">
					{t("form.nameLabel")} <span className="text-destructive">*</span>
				</label>
				<Input
					{...register("name")}
					disabled={isPending}
					placeholder={t("form.namePlaceholder")}
					className="bg-background text-foreground border-input placeholder:text-muted-foreground"
				/>
				{errors.name && <p className="text-sm text-destructive font-medium">{errors.name.message}</p>}
			</div>

			{/* Description */}
			<div className="space-y-2">
				<label className="text-sm font-medium text-foreground">
					{t("form.descriptionLabel")} <span className="text-destructive">*</span>
				</label>
				<Textarea
					{...register("description")}
					disabled={isPending}
					rows={4}
					placeholder={t("form.descriptionPlaceholder")}
					className="bg-background text-foreground border-input placeholder:text-muted-foreground resize-none"
				/>
				{errors.description && <p className="text-sm text-destructive font-medium">{errors.description.message}</p>}
			</div>

			{/* Is Atypical Checkbox */}
			<div className="flex items-center gap-2 pt-2">
				<Checkbox
					id="isAtypical"
					checked={watch("isAtypical")}
					onCheckedChange={(checked) => setValue("isAtypical", !!checked)}
					disabled={isPending}
				/>
				<label htmlFor="isAtypical" className="text-sm font-medium text-foreground cursor-pointer select-none">
					{t("form.isAtypicalLabel")}
				</label>
			</div>

			{/* Actions */}
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
				<Button type="submit" disabled={isPending} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
					{isPending && <Loader2 className="h-4 w-4 animate-spin" />}
					{isEdit ? tCommon("update") : tCommon("create")}
				</Button>
			</div>
		</form>
	);
}