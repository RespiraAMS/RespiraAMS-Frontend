"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CalendarRange } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreateAnalysisReportRequest } from "../types";

const formSchema = z
    .object({
        start: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
        end: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
    })
    .refine((data) => new Date(data.start) <= new Date(data.end), {
        message: "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc",
        path: ["end"],
    });

type FormValues = z.infer<typeof formSchema>;

interface CreateAnalysisReportFormProps {
    onSubmit: (data: CreateAnalysisReportRequest) => void;
    onCancel: () => void;
    isPending?: boolean;
}

function toDateInputString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function CreateAnalysisReportForm({
    onSubmit,
    onCancel,
    isPending,
}: CreateAnalysisReportFormProps) {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            start: toDateInputString(thirtyDaysAgo),
            end: toDateInputString(today),
        },
    });

    const applyPresetDays = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);
        setValue("start", toDateInputString(start), { shouldValidate: true });
        setValue("end", toDateInputString(end), { shouldValidate: true });
    };

    const handleValidSubmit = (values: FormValues) => {
        const startIso = new Date(`${values.start}T00:00:00.000Z`).toISOString();
        const endIso = new Date(`${values.end}T23:59:59.999Z`).toISOString();

        onSubmit({
            doctorId: null,
            start: startIso,
            end: endIso,
        });
    };

    return (
        <form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-5">

            <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">Chọn nhanh:</span>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => applyPresetDays(7)}
                    disabled={isPending}
                >
                    7 ngày qua
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => applyPresetDays(30)}
                    disabled={isPending}
                >
                    30 ngày qua
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => applyPresetDays(90)}
                    disabled={isPending}
                >
                    90 ngày qua
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="start">
                        Từ ngày <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="start"
                        type="date"
                        {...register("start")}
                        disabled={isPending}
                        className="bg-background border-input"
                    />
                    {errors.start && (
                        <p className="text-xs text-destructive font-medium">{errors.start.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="end">
                        Đến ngày <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="end"
                        type="date"
                        {...register("end")}
                        disabled={isPending}
                        className="bg-background border-input"
                    />
                    {errors.end && (
                        <p className="text-xs text-destructive font-medium">{errors.end.message}</p>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                    Hủy
                </Button>
                <Button type="submit" disabled={isPending} className="gap-2 bg-primary">
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Tạo báo cáo
                </Button>
            </div>
        </form>
    );
}