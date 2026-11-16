"use client";

import { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Check, ChevronsUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { AwareCategory, type AntibioticItem, type CreateAntibioticRequest, type UpdateAntibioticRequest } from "../types";
import { useAntibioticGroups } from "../queries";

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

    const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
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
                <Input 
                    {...register("name")} 
                    disabled={isPending} 
                    placeholder={t("form.namePlaceholder")} 
                    className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""} 
                />
                {errors.name && <p className="text-sm text-destructive font-medium">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                    {t("form.groupLabel")} <span className="text-destructive">*</span>
                </label>
                <Controller
                    control={control}
                    name="antibioticGroupId"
                    render={({ field }) => (
                        <Popover modal={true}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    disabled={isPending || isLoadingGroups}
                                    className={cn(
                                        "w-full justify-between font-normal",
                                        !field.value && "text-muted-foreground",
                                        errors.antibioticGroupId && "border-destructive focus-visible:ring-destructive"
                                    )}
                                >
                                    {field.value 
                                        ? antibioticGroups.find((g) => g.id === field.value)?.name 
                                        : t("form.selectGroupPlaceholder")}
                                    {isLoadingGroups ? (
                                        <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
                                    ) : (
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder={t("form.searchGroupPlaceholder") || "Search..."} />
                                    <CommandList>
                                        <CommandEmpty>{t("form.noGroupFound") || "No group found."}</CommandEmpty>
                                        <CommandGroup>
                                            {antibioticGroups.map((group) => (
                                                <CommandItem
                                                    key={group.id}
                                                    value={group.id}
                                                    onSelect={() => field.onChange(group.id)}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            group.id === field.value ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {group.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    )}
                />
                {errors.antibioticGroupId && <p className="text-sm text-destructive font-medium">{errors.antibioticGroupId.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                    {t("form.categoryLabel")} <span className="text-destructive">*</span>
                </label>
                <Controller
                    control={control}
                    name="classification"
                    render={({ field }) => (
                        <div 
                            className={cn(
                                "flex flex-wrap sm:flex-nowrap min-h-10 w-full items-center justify-center rounded-md bg-muted p-1 text-muted-foreground gap-1 sm:gap-0",
                                errors.classification && "ring-1 ring-destructive"
                            )}
                        >
                            {Object.values(AwareCategory).map((cat) => {
                                const isSelected = field.value === cat;
                                const label = cat === "AccessWatch" ? "Access-Watch" : cat;
                                
                                const selectedBgColor = cn(
                                    cat === "Access" && "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 shadow-sm",
                                    cat === "Watch" && "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 shadow-sm",
                                    cat === "Reserve" && "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 shadow-sm",
                                    cat === "AccessWatch" && "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 shadow-sm",
                                    cat === "Others" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 shadow-sm",
                                    !["Access", "Watch", "Reserve", "AccessWatch", "Others"].includes(cat) && "bg-background text-foreground"
                                );

                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        disabled={isPending}
                                        onClick={() => field.onChange(cat)}
                                        className={cn(
                                            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 w-full sm:w-auto",
                                            isSelected 
                                                ? cn("shadow-sm", selectedBgColor) 
                                                : "hover:bg-background/50 hover:text-foreground"
                                        )}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                />
                {errors.classification && <p className="text-sm text-destructive font-medium">{errors.classification.message}</p>}
            </div>

            {!isEdit && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">
                            {t("form.routeLabel")} <span className="text-destructive">*</span>
                        </label>
                        <Controller
                            control={control}
                            name="routeOfAdministration"
                            render={({ field }) => (
                                <div 
                                    className={cn(
                                        "flex h-10 w-full items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
                                        errors.routeOfAdministration && "ring-1 ring-destructive"
                                    )}
                                >
                                    {ROUTE_OPTIONS.map((opt) => {
                                        const isSelected = field.value === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                disabled={isPending}
                                                onClick={() => field.onChange(opt.value)}
                                                className={cn(
                                                    "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full",
                                                    isSelected ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-background/50 hover:text-foreground"
                                                )}
                                            >
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        />
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
                <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                    {tCommon("cancel")}
                </Button>
                <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isPending ? tCommon("saving") : isEdit ? tCommon("update") : tCommon("create")}
                </Button>
            </div>
        </form>
    );
}