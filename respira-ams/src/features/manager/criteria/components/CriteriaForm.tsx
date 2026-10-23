"use client";

import { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { type CreateCriteriaRequest, type CriteriaDetail } from "../types";
import { useClinicalVariablesDropdown } from "@/features/manager/clinical-variables/queries";
import { PrerequisiteBuilder } from "../../components/PrerequisiteBuilder";

interface CriteriaFormProps {
	initialData?: CriteriaDetail | null;
	onSubmit: (data: CreateCriteriaRequest) => void;
	onCancel: () => void;
	isPending?: boolean;
}

export function CriteriaForm({ initialData, onSubmit, onCancel, isPending }: CriteriaFormProps) {
	const tForm = useTranslations("manager.criteria.form");
	const tVal = useTranslations("manager.criteria.validation");
	const tCommon = useTranslations("common");

	const isEdit = !!initialData;

	const { data: dropdownData } = useClinicalVariablesDropdown();
	const variablesList = dropdownData?.clinicalVariables || [];

	const formSchema = useMemo(() => {
		return z.object({
			name: z.string().trim().min(1, tVal("nameRequired")),
			formula: z.any().refine((val) => val != null && Object.keys(val).length > 0, {
				message: tVal("formulaRequired"),
			}),
		});
	}, [tVal]);

	type FormValues = z.infer<typeof formSchema>;

	const defaultValues: FormValues = useMemo(() => {
		if (!initialData)
			return {
				name: "",
				formula: undefined,
			};
		return {
			name: initialData.name,
			formula: initialData.formula,
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
		const payload: CreateCriteriaRequest = {
			name: data.name,
			formula: data.formula,
		};
		onSubmit(payload);
	};

	return (
		<form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 pb-2 text-foreground">
			{/* Name Field */}
			<div className="space-y-2">
				<Label className="text-foreground font-medium">
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

			{/* Formula Field */}
			<div className="space-y-2">
				<Label className="text-foreground font-medium">
					{tForm("formulaLabel")} <span className="text-destructive">*</span>
				</Label>
				{errors.formula && (
					<p className="text-xs text-destructive font-medium">{errors.formula?.message as string}</p>
				)}

				<Controller
					control={control}
					name="formula"
					render={({ field }) => (
						<PrerequisiteBuilder
							value={field.value || null}
							onChange={field.onChange}
							variables={variablesList}
						/>
					)}
				/>
			</div>

			{/* Sticky Footer */}
			<div className="flex justify-end gap-2 pt-4 border-t border-border sticky bottom-0 bg-popover/95 backdrop-blur py-4 -mx-2 px-2 z-10 text-popover-foreground">
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