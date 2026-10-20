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

import { useAntibioticGroupsDropdown } from "../queries";
import { type AntibioticGroupItem, type CreateAntibioticGroupRequest, type UpdateAntibioticGroupRequest } from "../types";

interface AntibioticGroupFormProps {
	initialData?: AntibioticGroupItem | null;
	onSubmit: (data: CreateAntibioticGroupRequest | UpdateAntibioticGroupRequest) => void;
	onCancel: () => void;
	isPending?: boolean;
}

export function AntibioticGroupForm({ initialData, onSubmit, onCancel, isPending }: AntibioticGroupFormProps) {
	const t = useTranslations("manager.antibioticGroups");
	const tVal = useTranslations("manager.antibioticGroups.validation");
	const tCommon = useTranslations("common");

	const isEdit = !!initialData;
	const { data: dropdownData, isLoading: isDropdownLoading } = useAntibioticGroupsDropdown();

	const availableParents = dropdownData?.antibioticGroups?.filter(g => g.id !== initialData?.id) || [];

	const groupSchema = useMemo(() => {
		return z.object({
			name: z.string().trim().min(1, tVal("nameRequired")),
			parentId: z.string().nullable().optional(),
			description: z.string().trim().min(1, tVal("descriptionRequired")),
		});
	}, [tVal]);

	type FormValues = z.infer<typeof groupSchema>;

	const defaultValues: FormValues = useMemo(() => {
		if (!initialData) return { name: "", parentId: "", description: "" };
		return {
			name: initialData.name,
			parentId: initialData.parentId || "",
			description: initialData.description || "",
		};
	}, [initialData]);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(groupSchema),
		defaultValues,
	});

	useEffect(() => {
		reset(defaultValues);
	}, [defaultValues, reset]);

	const handleValidSubmit = (data: FormValues) => {
		const payload = {
			name: data.name,
			parentId: data.parentId === "" ? null : data.parentId,
			description: data.description,
		};
		onSubmit(payload);
	};

	return (
		<form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-4 text-foreground">
			{/* Group Name */}
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

			{/* Parent Group */}
			<div className="space-y-2">
				<label className="text-sm font-medium text-foreground">{t("form.parentLabel")}</label>
				<select
					{...register("parentId")}
					disabled={isPending || isDropdownLoading}
					className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					<option value="">{t("form.noParentOption")}</option>
					{availableParents.map((group) => (
						<option key={group.id} value={group.id}>{group.name}</option>
					))}
				</select>
			</div>

			{/* Description */}
			<div className="space-y-2">
				<label className="text-sm font-medium text-foreground">{t("form.descriptionLabel")}</label>
				<Textarea
					{...register("description")}
					disabled={isPending}
					rows={4}
					placeholder={t("form.descriptionPlaceholder")}
					className="bg-background text-foreground border-input placeholder:text-muted-foreground resize-none"
				/>
				{errors.description && <p className="text-sm text-destructive font-medium">{errors.description.message}</p>}
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