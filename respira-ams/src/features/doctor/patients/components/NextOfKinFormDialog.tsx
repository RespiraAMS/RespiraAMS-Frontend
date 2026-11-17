"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { type NextOfKinItem, type NextOfKinRequest } from "../types";

const VN_PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

function normalizePhone(phone: string): string {
	const cleaned = phone.trim().replace(/\s+/g, "");
	if (cleaned.startsWith("+84")) {
		return "0" + cleaned.slice(3);
	}
	return cleaned;
}

interface NextOfKinFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialData?: NextOfKinItem | null;
	existingKins: NextOfKinItem[];
	onSubmit: (data: NextOfKinRequest) => void;
	isPending?: boolean;
}

export function NextOfKinFormDialog({
	open,
	onOpenChange,
	initialData,
	existingKins,
	onSubmit,
	isPending,
}: NextOfKinFormDialogProps) {
	const t = useTranslations("doctor.patients.nextOfKin");
	const tCommon = useTranslations("common");

	const isEdit = !!initialData;

	const schema = useMemo(() => {
		return z.object({
			fullName: z.string().trim().min(1, t("validation.fullNameRequired")),
			phoneNumber: z
				.string()
				.trim()
				.min(1, t("validation.phoneRequired"))
				.regex(VN_PHONE_REGEX, t("validation.phoneInvalid"))
				.refine(
					(val) => {
						const normalizedInput = normalizePhone(val);
						return !existingKins.some(
							(kin) =>
								kin.id !== initialData?.id &&
								normalizePhone(kin.phoneNumber) === normalizedInput
						);
					},
					{ message: t("validation.phoneDuplicate") }
				),
			relationship: z.string().trim().min(1, t("validation.relationshipRequired")),
		});
	}, [t, existingKins, initialData?.id]);

	type FormValues = z.infer<typeof schema>;

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			fullName: "",
			phoneNumber: "",
			relationship: "",
		},
	});

	useEffect(() => {
		if (open) {
			reset({
				fullName: initialData?.fullName ?? "",
				phoneNumber: initialData?.phoneNumber ?? "",
				relationship: initialData?.relationship ?? "",
			});
		}
	}, [open, initialData, reset]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md border-border bg-popover text-popover-foreground">
				<DialogHeader>
					<DialogTitle className="text-foreground">
						{isEdit ? t("updateTitle") : t("createTitle")}
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-foreground">
					<div className="space-y-1.5">
						<Label className="text-foreground">
							{t("fullNameLabel")} <span className="text-destructive">*</span>
						</Label>
						<Input
							{...register("fullName")}
							placeholder={t("fullNamePlaceholder")}
							disabled={isPending}
							className="bg-background text-foreground border-input"
						/>
						{errors.fullName && (
							<p className="text-xs text-destructive font-medium">
								{errors.fullName.message}
							</p>
						)}
					</div>

					<div className="space-y-1.5">
						<Label className="text-foreground">
							{t("phoneLabel")} <span className="text-destructive">*</span>
						</Label>
						<Input
							{...register("phoneNumber")}
							placeholder={t("phonePlaceholder")}
							disabled={isPending}
							className="bg-background text-foreground border-input"
						/>
						{errors.phoneNumber && (
							<p className="text-xs text-destructive font-medium">
								{errors.phoneNumber.message}
							</p>
						)}
					</div>

					<div className="space-y-1.5">
						<Label className="text-foreground">
							{t("relationshipLabel")} <span className="text-destructive">*</span>
						</Label>
						<Input
							{...register("relationship")}
							placeholder={t("relationshipPlaceholder")}
							disabled={isPending}
							className="bg-background text-foreground border-input"
						/>
						{errors.relationship && (
							<p className="text-xs text-destructive font-medium">
								{errors.relationship.message}
							</p>
						)}
					</div>

					<div className="flex justify-end gap-2 pt-3 border-t border-border">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isPending}
							className="border-border text-foreground hover:bg-accent"
						>
							{tCommon("cancel")}
						</Button>
						<Button
							type="submit"
							disabled={isPending}
							className="bg-primary text-primary-foreground hover:bg-primary/90"
						>
							{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{isEdit ? t("updateButton") : t("createButton")}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}