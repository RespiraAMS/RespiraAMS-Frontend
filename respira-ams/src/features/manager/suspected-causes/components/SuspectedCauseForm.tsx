"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Loader2, Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

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

const severityStyles: Record<Severity, string> = {
    Mild: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 shadow-sm",
    Moderate: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 shadow-sm",
    Severe: "bg-destructive/15 text-destructive dark:bg-destructive/20 shadow-sm",
};

const treatmentSiteStyles: Record<TreatmentSite, string> = {
    Outpatient: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 shadow-sm",
    Inpatient: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 shadow-sm",
    IntensiveCareUnit: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 shadow-sm",
};

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

    const [openCombobox, setOpenCombobox] = useState(false);

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
        watch,
        setValue,
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

    const currentSeverity = watch("severity");
    const currentSite = watch("treatmentSite");

    return (
        <form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-5 text-foreground">
            <div className="space-y-2 flex flex-col">
                <label className="text-sm font-medium text-foreground">
                    {t("form.pathogenLabel")} <span className="text-destructive">*</span>
                </label>
                <Controller
                    control={control}
                    name="pathogenId"
                    render={({ field }) => (
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox} modal={true}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCombobox}
                                    disabled={isPending || isPathogensLoading}
                                    className={`w-full justify-between bg-background text-foreground border-input font-normal ${
                                        !field.value ? "text-muted-foreground" : ""
                                    } ${errors.pathogenId ? "border-destructive" : ""}`}
                                >
                                    {field.value
                                        ? pathogensList.find((p) => p.id === field.value)?.name
                                        : t("form.pathogenPlaceholder")}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-popover text-popover-foreground border-border" align="start">
                                <Command>
                                    <CommandInput placeholder={t("form.searchPathogenPlaceholder") || "Search pathogen..."} />
                                    <CommandList>
                                        <CommandEmpty>{t("form.noPathogenFound") || "No pathogen found."}</CommandEmpty>
                                        <CommandGroup>
                                            {pathogensList.map((item) => (
                                                <CommandItem
                                                    key={item.id}
                                                    value={item.name}
                                                    onSelect={() => {
                                                        field.onChange(item.id);
                                                        setOpenCombobox(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${
                                                            item.id === field.value ? "opacity-100" : "opacity-0"
                                                        }`}
                                                    />
                                                    {item.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    )}
                />
                {errors.pathogenId && (
                    <p className="text-sm text-destructive font-medium">{errors.pathogenId.message}</p>
                )}
            </div>

            <div className="space-y-2 flex flex-col">
                <label className="text-sm font-medium text-foreground">
                    {t("form.severityLabel")} <span className="text-destructive">*</span>
                </label>
                <div className="flex p-1 bg-muted rounded-md gap-1 w-full">
                    {severityEnum.map((sev) => (
                        <button
                            key={sev}
                            type="button"
                            disabled={isPending}
                            onClick={() => setValue("severity", sev, { shouldValidate: true })}
                            className={`flex-1 py-2 text-sm font-medium rounded-sm transition-all duration-200 ${
                                currentSeverity === sev
                                    ? severityStyles[sev]
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                            }`}
                        >
                            {t(`form.severity${sev}`)}
                        </button>
                    ))}
                </div>
                {errors.severity && (
                    <p className="text-sm text-destructive font-medium">{errors.severity.message}</p>
                )}
            </div>

            <div className="space-y-2 flex flex-col">
                <label className="text-sm font-medium text-foreground">
                    {t("form.treatmentSiteLabel")} <span className="text-destructive">*</span>
                </label>
                <div className="flex p-1 bg-muted rounded-md gap-1 w-full">
                    {[
                        { value: "Outpatient", label: t("form.siteOutpatient") },
                        { value: "Inpatient", label: t("form.siteInpatient") },
                        { value: "IntensiveCareUnit", label: t("form.siteICU") },
                    ].map((site) => (
                        <button
                            key={site.value}
                            type="button"
                            disabled={isPending}
                            onClick={() => setValue("treatmentSite", site.value as TreatmentSite, { shouldValidate: true })}
                            className={`flex-1 py-2 text-sm font-medium rounded-sm transition-all duration-200 ${
                                currentSite === site.value
                                    ? treatmentSiteStyles[site.value as TreatmentSite]
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                            }`}
                        >
                            {site.label}
                        </button>
                    ))}
                </div>
                {errors.treatmentSite && (
                    <p className="text-sm text-destructive font-medium">{errors.treatmentSite.message}</p>
                )}
            </div>

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