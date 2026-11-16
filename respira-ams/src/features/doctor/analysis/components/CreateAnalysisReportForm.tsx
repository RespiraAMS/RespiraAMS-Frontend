"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CalendarRange } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreateAnalysisReportRequest } from "../types";

interface FormValues {
	start: string;
	end: string;
}

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
	const t = useTranslations("doctor.analysis");
	const tCommon = useTranslations("common");

	const formSchema = useMemo(
		() =>
			z
				.object({
					start: z.string().min(1, t("createForm.validation.startRequired")),
					end: z.string().min(1, t("createForm.validation.endRequired")),
				})
				.refine(
					(data) => {
						const startTime = new Date(data.start).getTime();
						const endTime = new Date(data.end).getTime();
						return !isNaN(startTime) && !isNaN(endTime) && startTime <= endTime;
					},
					{
						message: t("createForm.validation.invalidRange"),
						path: ["end"],
					}
				),
		[t]
	);

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
		<form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-5 text-foreground">
			<div className="rounded-lg border border-border bg-muted/40 dark:bg-muted/20 p-3 text-xs text-muted-foreground flex items-start gap-2">
				<CalendarRange className="h-4 w-4 text-primary shrink-0 mt-0.5" />
				{doctorId ? (
					<span>
						{t.rich("createForm.doctorBanner", {
							name: doctorName || t("createForm.defaultDoctorName"),
							bold: (chunks) => (
								<strong className="text-foreground">{chunks}</strong>
							),
						})}
					</span>
				) : (
					<span>
						{t.rich("createForm.generalBanner", {
							bold: (chunks) => (
								<strong className="text-foreground">{chunks}</strong>
							),
						})}
					</span>
				)}
			</div>

			<div className="flex flex-wrap items-center gap-2">
				<span className="text-xs text-muted-foreground">
					{t("createForm.quickSelect")}
				</span>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="h-7 text-xs border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
					onClick={() => applyPresetDays(0)}
					disabled={isPending}
				>
					{t("createForm.presets.today")}
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="h-7 text-xs border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
					onClick={() => applyPresetDays(7)}
					disabled={isPending}
				>
					{t("createForm.presets.last7Days")}
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="h-7 text-xs border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
					onClick={() => applyPresetDays(30)}
					disabled={isPending}
				>
					{t("createForm.presets.last30Days")}
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="h-7 text-xs border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
					onClick={() => applyPresetDays(90)}
					disabled={isPending}
				>
					{t("createForm.presets.last90Days")}
				</Button>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="start" className="text-foreground">
						{t("createForm.startLabel")}{" "}
						<span className="text-destructive">*</span>
					</Label>
					<Input
						id="start"
						type="datetime-local"
						{...register("start")}
						disabled={isPending}
						className="bg-background text-foreground border-input dark:[color-scheme:dark]"
					/>
					{errors.start && (
						<p className="text-xs text-destructive font-medium">
							{errors.start.message}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="end" className="text-foreground">
						{t("createForm.endLabel")}{" "}
						<span className="text-destructive">*</span>
					</Label>
					<Input
						id="end"
						type="datetime-local"
						{...register("end")}
						disabled={isPending}
						className="bg-background text-foreground border-input dark:[color-scheme:dark]"
					/>
					{errors.end && (
						<p className="text-xs text-destructive font-medium">
							{errors.end.message}
						</p>
					)}
				</div>
			</div>

			<div className="flex justify-end gap-2 pt-4 border-t border-border">
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
					{t("createForm.submit")}
				</Button>
			</div>
		</form>
	);
}