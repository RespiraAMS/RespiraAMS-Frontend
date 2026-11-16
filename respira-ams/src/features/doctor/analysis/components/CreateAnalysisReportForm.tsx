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
        start: z.string().min(1, "Vui lòng chọn thời điểm bắt đầu"),
        end: z.string().min(1, "Vui lòng chọn thời điểm kết thúc"),
    })
    .refine(
        (data) => {
            const startTime = new Date(data.start).getTime();
            const endTime = new Date(data.end).getTime();
            return !isNaN(startTime) && !isNaN(endTime) && startTime <= endTime;
        },
        {
            message: "Thời điểm bắt đầu phải nhỏ hơn hoặc bằng thời điểm kết thúc",
            path: ["end"],
        }
    );

type FormValues = z.infer<typeof formSchema>;

interface CreateAnalysisReportFormProps {
    doctorId?: string | null;
    doctorName?: string;
    onSubmit: (data: CreateAnalysisReportRequest) => void;
    onCancel: () => void;
    isPending?: boolean;
}

function toDateTimeLocalString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function CreateAnalysisReportForm({
    doctorId = null,
    doctorName,
    onSubmit,
    onCancel,
    isPending,
}: CreateAnalysisReportFormProps) {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            start: toDateTimeLocalString(thirtyDaysAgo),
            end: toDateTimeLocalString(now),
        },
    });

    const applyPresetDays = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);
        start.setHours(0, 0, 0, 0);
        setValue("start", toDateTimeLocalString(start), { shouldValidate: true });
        setValue("end", toDateTimeLocalString(end), { shouldValidate: true });
    };

    const handleValidSubmit = (values: FormValues) => {
        const startIso = new Date(values.start).toISOString();
        const endIso = new Date(values.end).toISOString();

        onSubmit({
            doctorId: doctorId ?? null,
            start: startIso,
            end: endIso,
        });
    };

    return (
        <form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-5">
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground flex items-start gap-2">
                <CalendarRange className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {doctorId ? (
                    <span>
                        Tạo báo cáo phân tích kê đơn kháng sinh và mức độ tuân thủ phác đồ cho{" "}
                        <strong className="text-foreground">{doctorName || "bác sĩ đã chọn"}</strong>.
                    </span>
                ) : (
                    <span>
                        Hệ thống sẽ tổng hợp dữ liệu kê đơn kháng sinh và mức độ tuân thủ phác đồ của{" "}
                        <strong className="text-foreground">toàn bộ bác sĩ</strong> trong khoảng thời gian đã chọn.
                    </span>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">Chọn nhanh:</span>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => applyPresetDays(0)}
                    disabled={isPending}
                >
                    Hôm nay
                </Button>
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
                        Từ thời điểm <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="start"
                        type="datetime-local"
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
                        Đến thời điểm <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="end"
                        type="datetime-local"
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