// src/features/manager/antibiotics/components/DosageForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { type DosageItem, type CreateDosageRequest } from "../types";

const MAX_DECIMAL = 79228162514264337593543950335;

interface DosageFormProps {
    initialData?: DosageItem | null;
    onSubmit: (data: CreateDosageRequest) => void;
    onCancel: () => void;
    isPending?: boolean;
}

export function DosageForm({ initialData, onSubmit, onCancel, isPending }: DosageFormProps) {
    const t = useTranslations("manager.antibiotics");
    const tCommon = useTranslations("common");
    const isEdit = !!initialData;

    const [isRenal, setIsRenal] = useState(!!initialData?.crcl);

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            routeOfAdministration: initialData?.routeOfAdministration || "",
            dose: initialData?.dose || "",
            min: initialData?.crcl?.min === MAX_DECIMAL ? "" : initialData?.crcl?.min ?? "",
            isMinExclusive: initialData?.crcl?.isMinExclusive ?? true,
            max: initialData?.crcl?.max === MAX_DECIMAL ? "" : initialData?.crcl?.max ?? "",
            isMaxExclusive: initialData?.crcl?.isMaxExclusive ?? false,
        }
    });

    const onValidSubmit = (data: any) => {
        const payload: CreateDosageRequest = {
            routeOfAdministration: data.routeOfAdministration,
            dose: data.dose,
            crcl: isRenal ? {
                min: data.min === "" ? 0 : Number(data.min),
                isMinExclusive: data.isMinExclusive,
                max: data.max === "" ? MAX_DECIMAL : Number(data.max),
                isMaxExclusive: data.isMaxExclusive,
                unit: null
            } : null
        };
        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit(onValidSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">{t("form.routeLabel")}</label>
                    <select {...register("routeOfAdministration", { required: true })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground">
                        <option value="" disabled>{t("form.selectRoutePlaceholder")}</option>
                        <option value="Oral">{t("form.routeOral")}</option>
                        <option value="Intravenous">{t("form.routeIntravenous")}</option>
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">{t("form.standardDoseLabel")}</label>
                    <Input {...register("dose", { required: true })} placeholder={t("form.dosagePlaceholder")} />
                </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
                <Checkbox id="isRenal" checked={isRenal} onCheckedChange={(val) => setIsRenal(!!val)} />
                <label htmlFor="isRenal" className="text-sm font-medium cursor-pointer">Liều điều chỉnh theo GFR (CrCl)</label>
            </div>

            {isRenal && (
                <div className="grid grid-cols-2 gap-4 p-4 border border-border rounded-md bg-muted/30">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">CrCl Min (ml/min)</label>
                        <Input type="number" {...register("min")} placeholder="Để trống nếu là vô cùng (0)" />
                        <div className="flex items-center gap-2 mt-1">
                            <Checkbox id="minEx" {...register("isMinExclusive")} />
                            <label htmlFor="minEx" className="text-xs">Không bao gồm giá trị Min (&gt;)</label>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">CrCl Max (ml/min)</label>
                        <Input type="number" {...register("max")} placeholder="Để trống nếu là vô cùng" />
                        <div className="flex items-center gap-2 mt-1">
                            <Checkbox id="maxEx" {...register("isMaxExclusive")} />
                            <label htmlFor="maxEx" className="text-xs">Không bao gồm giá trị Max (&lt;)</label>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-2 justify-end mt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>{tCommon("cancel")}</Button>
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEdit ? tCommon("update") : tCommon("create")}
                </Button>
            </div>
        </form>
    );
}