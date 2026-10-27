"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AwareCategory, type AntibioticItem, type CreateAntibioticRequest, type UpdateAntibioticRequest } from "../types";
import { useAntibioticGroups } from "../queries";

const selectCls = (hasError?: boolean) =>
    `flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors ${
        hasError
            ? "border-destructive focus-visible:ring-destructive"
            : "border-input focus-visible:ring-ring"
    }`;

interface AntibioticFormProps {
    initialData?: AntibioticItem | null;
    onSubmit: (data: CreateAntibioticRequest | UpdateAntibioticRequest) => void;
    onCancel: () => void;
    isPending?: boolean;
}

interface FormValues {
    name: string;
    antibioticGroupId: string;
    classification: string;
    routeOfAdministration?: string;
    standardDose?: string;
}

export function AntibioticForm({ initialData, onSubmit, onCancel, isPending = false }: AntibioticFormProps) {
    const isEdit = !!initialData;
    const t = useTranslations("manager.antibiotics");
    const tVal = useTranslations("manager.antibiotics.validation");
    const tCommon = useTranslations("common");

    const { data: groupsData, isLoading: isLoadingGroups } = useAntibioticGroups();
    const antibioticGroups = groupsData?.antibioticGroups || [];

    const ROUTE_OPTIONS = [
        { label: t("form.routeIntravenous"), value: "Intravenous" }, 
        { label: t("form.routeOral"), value: "Oral" },
    ];

    const antibioticSchema = useMemo(() => {
        return z
            .object({
                name: z.string().trim().min(1, tVal("nameRequired")),
                antibioticGroupId: z.string().min(1, tVal("groupRequired")),
                classification: z.string().min(1, tVal("categoryRequired")),
                routeOfAdministration: z.string().optional(),
                standardDose: z.string().optional(),
            })
            .superRefine((data, ctx) => {
                if (!isEdit) {
                    if (!data.routeOfAdministration || data.routeOfAdministration.trim() === "") {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: tVal("routesRequired"),
                            path: ["routeOfAdministration"],
                        });
                    }
                    if (!data.standardDose || data.standardDose.trim() === "") {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: tVal("dosagesRequired"),
                            path: ["standardDose"],
                        });
                    }
                }
            });
    }, [isEdit, tVal]);

    const initialFormValues: FormValues = useMemo(() => {
        if (!initialData) {
            return {
                name: "",
                antibioticGroupId: "",
                classification: "",
                routeOfAdministration: "",
                standardDose: "",
            };
        }
        return {
            name: initialData.name ?? "",
            antibioticGroupId: initialData.antibioticGroup?.id ?? "",
            classification: initialData.classification ?? "",
            routeOfAdministration: "",
            standardDose: "",
        };
    }, [initialData]);

    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(antibioticSchema),
        values: initialFormValues,
    });

    const onValidSubmit = (data: FormValues) => {
        onSubmit(data as CreateAntibioticRequest | UpdateAntibioticRequest);
    };

    return (
        <form onSubmit={handleSubmit(onValidSubmit)} className="flex flex-col gap-5 text-foreground">
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                    {t("form.nameLabel")} <span className="text-destructive">*</span>
                </label>
                <Input {...register("name")} disabled={isPending} placeholder={t("form.namePlaceholder")} className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""} />
                {errors.name && <p className="text-sm text-destructive font-medium">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                    {t("form.groupLabel")} <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                    <select {...register("antibioticGroupId")} disabled={isPending || isLoadingGroups} className={selectCls(!!errors.antibioticGroupId)}>
                        <option value="" disabled>{t("form.selectGroupPlaceholder")}</option>
                        {antibioticGroups.map((group) => (
                            <option key={group.id} value={group.id}>{group.name}</option>
                        ))}
                    </select>
                    {isLoadingGroups && <Loader2 className="absolute right-8 top-3 h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
                {errors.antibioticGroupId && <p className="text-sm text-destructive font-medium">{errors.antibioticGroupId.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                    {t("form.categoryLabel")} <span className="text-destructive">*</span>
                </label>
                <select {...register("classification")} disabled={isPending} className={selectCls(!!errors.classification)}>
                    <option value="" disabled>{t("form.selectCategoryPlaceholder")}</option>
                    {Object.values(AwareCategory).map((cat) => (
                        <option key={cat} value={cat}>{cat === "AccessWatch" ? "Access-Watch" : cat}</option>
                    ))}
                </select>
                {errors.classification && <p className="text-sm text-destructive font-medium">{errors.classification.message}</p>}
            </div>

            {!isEdit && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">
                            {t("form.routeLabel")} <span className="text-destructive">*</span>
                        </label>
                        <select
                            {...register("routeOfAdministration")}
                            disabled={isPending}
                            className={selectCls(!!errors.routeOfAdministration)}
                        >
                            <option value="" disabled>{t("form.selectRoutePlaceholder")}</option>
                            {ROUTE_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        {errors.routeOfAdministration && <p className="text-sm text-destructive font-medium">{errors.routeOfAdministration.message}</p>}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">
                            {t("form.standardDoseLabel")} <span className="text-destructive">*</span>
                        </label>
                        <Input
                            {...register("standardDose")}
                            disabled={isPending}
                            placeholder={t("form.dosagePlaceholder")}
                            className={errors.standardDose ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {errors.standardDose && <p className="text-sm text-destructive font-medium">{errors.standardDose.message}</p>}
                    </div>
                </div>
            )}

            <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>{tCommon("cancel")}</Button>
                <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground">
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isPending ? tCommon("saving") : isEdit ? tCommon("update") : tCommon("create")}
                </Button>
            </div>
        </form>
    );
}