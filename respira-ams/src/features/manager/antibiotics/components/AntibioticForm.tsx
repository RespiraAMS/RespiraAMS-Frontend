"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AwareCategory, type AntibioticItem, type CreateAntibioticRequest } from "../types";
import { useAntibioticGroups } from "../queries";

const selectCls = (hasError?: boolean) =>
    `flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors ${
        hasError
            ? "border-destructive focus-visible:ring-destructive"
            : "border-input focus-visible:ring-ring"
    }`;

interface AntibioticFormProps {
    initialData?: AntibioticItem | null;
    onSubmit: (data: CreateAntibioticRequest) => void;
    onCancel: () => void;
    isPending?: boolean;
}

export function AntibioticForm({ initialData, onSubmit, onCancel, isPending = false }: AntibioticFormProps) {
    const isEdit = !!initialData;
    const t = useTranslations("manager.antibiotics");
    const tVal = useTranslations("manager.antibiotics.validation");
    const tCommon = useTranslations("common");

    const { data: groupsData, isLoading: isLoadingGroups } = useAntibioticGroups();
    const antibioticGroups = groupsData?.antibioticGroups || [];

    const ROUTE_OPTIONS = [
        { label: t("form.routeIntravenous"), value: "intravenous" },
        { label: t("form.routeOral"), value: "oral" },
    ];

    const antibioticSchema = useMemo(
        () =>
            z.object({
                name: z.string().trim().min(1, tVal("nameRequired")),
                antibioticGroupId: z.string().min(1, tVal("spectrumRequired")),
                classification: z.string().min(1, tVal("categoryRequired")),
                routes: z.array(z.string()).min(1, tVal("routesRequired")),
                dosages: z.record(z.string(), z.array(z.string())),
            }).superRefine((data, ctx) => {
                data.routes.forEach((route) => {
                    const validDoses = (data.dosages[route] || []).filter((d) => d.trim() !== "");
                    if (validDoses.length === 0) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: tVal("dosagesRequired"),
                            path: ["dosages", route],
                        });
                    }
                });
            }),
        [tVal]
    );

    type FormValues = z.infer<typeof antibioticSchema>;

    const initialFormValues: FormValues = useMemo(() => {
        if (!initialData) {
            return {
                name: "",
                antibioticGroupId: "",
                classification: "",
                routes: [],
                dosages: {},
            };
        }
        return {
            name: initialData.name ?? "",
            antibioticGroupId: initialData.antibioticGroup?.id ?? "",
            classification: initialData.classification ?? "",
            routes: initialData.routeOfAdministrations ?? Object.keys(initialData.dosages ?? {}),
            dosages: initialData.dosages ?? {},
        };
    }, [initialData]);

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(antibioticSchema),
        values: initialFormValues,
    });

    const routes = watch("routes") || [];
    const dosages = watch("dosages") || {};

    const handleRouteChange = (routeValue: string, checked: boolean) => {
        if (checked) {
            setValue("routes", [...routes, routeValue], { shouldValidate: true });
            setValue("dosages", { ...dosages, [routeValue]: dosages[routeValue]?.length ? dosages[routeValue] : [""] }, { shouldValidate: true });
        } else {
            const nextDosages = { ...dosages };
            delete nextDosages[routeValue];
            setValue("routes", routes.filter((r) => r !== routeValue), { shouldValidate: true });
            setValue("dosages", nextDosages, { shouldValidate: true });
        }
    };

    const handleDosageChange = (route: string, index: number, value: string) => {
        const routeDosages = [...(dosages[route] || [])];
        routeDosages[index] = value;
        setValue(`dosages.${route}`, routeDosages, { shouldValidate: true });
    };

    const addDosage = (route: string) => {
        setValue(`dosages.${route}`, [...(dosages[route] || []), ""], { shouldValidate: true });
    };

    const removeDosage = (route: string, index: number) => {
        setValue(`dosages.${route}`, (dosages[route] || []).filter((_, i) => i !== index), { shouldValidate: true });
    };

    const onValidSubmit = (data: FormValues) => {
        const cleanDosages: Record<string, string[]> = {};
        for (const route of data.routes) {
            cleanDosages[route] = (data.dosages[route] || []).filter((d) => d.trim() !== "");
        }
        onSubmit({
            name: data.name,
            antibioticGroupId: data.antibioticGroupId,
            classification: data.classification,
            dosages: cleanDosages,
        });
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
                    {t("form.spectrumLabel")} <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                    <select {...register("antibioticGroupId")} disabled={isPending || isLoadingGroups} className={selectCls(!!errors.antibioticGroupId)}>
                        <option value="" disabled>{t("form.selectSpectrumPlaceholder")}</option>
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

            <div className="flex flex-col gap-4">
                <div>
                    <label className="text-sm font-medium">{t("form.routesDosagesLabel")} <span className="text-destructive">*</span></label>
                    {errors.routes && <p className="text-sm text-destructive font-medium mt-1">{errors.routes.message}</p>}
                </div>
                {ROUTE_OPTIONS.map((route) => {
                    const isChecked = routes.includes(route.value);
                    const currentDosages = dosages[route.value] || [];
                    const routeError = (errors.dosages as Record<string, { message?: string }> | undefined)?.[route.value]?.message;

                    return (
                        <div key={route.value} className={`rounded-xl border p-4 space-y-4 shadow-sm bg-muted/40 ${routeError ? "border-destructive" : "border-border"}`}>
                            <div className="flex items-center gap-3">
                                <Checkbox id={`route-${route.value}`} checked={isChecked} onCheckedChange={(val) => handleRouteChange(route.value, !!val)} disabled={isPending} />
                                <label htmlFor={`route-${route.value}`} className="font-semibold text-sm cursor-pointer text-foreground">{route.label}</label>
                            </div>
                            {isChecked && (
                                <div className="space-y-3 pl-7">
                                    {currentDosages.map((dosage, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input value={dosage} placeholder={t("form.dosagePlaceholder")} onChange={(e) => handleDosageChange(route.value, index, e.target.value)} disabled={isPending} className={routeError ? "border-destructive" : ""} />
                                            <Button type="button" size="icon" variant="destructive" disabled={isPending} onClick={() => removeDosage(route.value, index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    {routeError && <p className="text-sm text-destructive font-medium">{routeError}</p>}
                                    <Button type="button" variant="outline" size="sm" className="gap-2" disabled={isPending} onClick={() => addDosage(route.value)}>
                                        <Plus className="h-4 w-4" /> {t("form.addDosage")}
                                    </Button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

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