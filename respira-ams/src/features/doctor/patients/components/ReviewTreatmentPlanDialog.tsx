"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, XCircle, Loader2, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AdherenceState } from "../types";
import { reviewTreatmentPlan } from "@/features/doctor/patients/api";

interface ReviewTreatmentPlanDialogProps {
	planId: string | null;
	currentAdherence?: AdherenceState;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export function ReviewTreatmentPlanDialog({
	planId,
	currentAdherence,
	open,
	onOpenChange,
	onSuccess,
}: ReviewTreatmentPlanDialogProps) {
	const t = useTranslations("doctor.patients");
	const [selectedState, setSelectedState] = useState<AdherenceState>("Adhere");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (open) {
			if (currentAdherence && currentAdherence !== "NotAdhere") {
				setSelectedState(currentAdherence);
			} else {
				setSelectedState("Adhere");
			}
			setError(null);
		}
	}, [open, currentAdherence]);

	if (!planId) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsSubmitting(true);
		try {
			await reviewTreatmentPlan(planId, selectedState);
			onOpenChange(false);
			onSuccess?.();
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "";
			let friendly = "Không thể phê duyệt phác đồ điều trị.";
			if (msg.includes("Only NotAdhere")) {
				friendly = "Phác đồ này đã được duyệt trước đó (chỉ phác đồ ở trạng thái Chờ phê duyệt mới có thể duyệt).";
			} else if (msg.includes("not found")) {
				friendly = "Không tìm thấy thông tin phác đồ điều trị.";
			} else if (msg) {
				friendly = msg;
			}
			setError(friendly);
		} finally {
			setIsSubmitting(false);
		}
	};

	const options: Array<{
		value: AdherenceState;
		label: string;
		desc: string;
		icon: React.ComponentType<{ className?: string }>;
		colorClass: string;
	}> = [
		{
			value: "Adhere",
			label: t("adherenceAdhere", { defaultMessage: "Tuân thủ phác đồ" }),
			desc: t("adherenceAdhereDesc", {
				defaultMessage: "Kháng sinh và liều dùng hoàn toàn tuân thủ theo hướng dẫn điều trị chuẩn.",
			}),
			icon: CheckCircle2,
			colorClass: "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20",
		},
		{
			value: "NotAdhereValid",
			label: t("adherenceNotAdhereValid", { defaultMessage: "Không tuân thủ - Hợp lệ (Chấp nhận)" }),
			desc: t("adherenceNotAdhereValidDesc", {
				defaultMessage: "Khác biệt so với hướng dẫn chuẩn nhưng có căn cứ lâm sàng giải trình hợp lý.",
			}),
			icon: AlertCircle,
			colorClass: "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20",
		},
		{
			value: "NotAdhereInvalid",
			label: t("adherenceNotAdhereInvalid", { defaultMessage: "Không tuân thủ - Không hợp lệ (Từ chối)" }),
			desc: t("adherenceNotAdhereInvalidDesc", {
				defaultMessage: "Lựa chọn kháng sinh không phù hợp hoặc lý do giải trình không thỏa đáng.",
			}),
			icon: XCircle,
			colorClass: "text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20",
		},
	];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px] rounded-[18px] bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
				<DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center shrink-0">
							<ShieldCheck className="w-5 h-5" />
						</div>
						<div>
							<DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
								{t("reviewPlanTitle", { defaultMessage: "Đánh giá & Duyệt phác đồ" })}
							</DialogTitle>
							<DialogDescription className="text-xs text-slate-400 mt-0.5">
								{t("reviewPlanSubtitle", {
									defaultMessage: "Trưởng khoa hoặc người có thẩm quyền phê duyệt tính tuân thủ của phác đồ",
								})}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4 pt-2">
					{error && (
						<div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg text-red-600 dark:text-red-400 text-xs">
							{error}
						</div>
					)}

					<RadioGroup
						value={selectedState}
						onValueChange={(val) => setSelectedState(val as AdherenceState)}
						className="space-y-2.5"
					>
						{options.map((opt) => {
							const Icon = opt.icon;
							const isChecked = selectedState === opt.value;
							return (
								<label
									key={opt.value}
									htmlFor={`state-${opt.value}`}
									className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
										isChecked
											? `${opt.colorClass} ring-2 ring-indigo-500/30 font-medium`
											: "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850"
									}`}
								>
									<RadioGroupItem
										value={opt.value}
										id={`state-${opt.value}`}
										className="mt-0.5"
									/>
									<div className="flex-1 text-xs">
										<div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
											<Icon className="w-4 h-4 shrink-0" />
											<span>{opt.label}</span>
										</div>
										<p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
											{opt.desc}
										</p>
									</div>
								</label>
							);
						})}
					</RadioGroup>

					<DialogFooter className="pt-3 gap-2 border-t border-slate-100 dark:border-slate-800">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
							className="h-9 px-4 text-xs font-semibold"
						>
							{t("btnCancel", { defaultMessage: "Hủy" })}
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="h-9 px-5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
						>
							{isSubmitting ? (
								<>
									<Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
									{t("btnSubmitting", { defaultMessage: "Đang lưu..." })}
								</>
							) : (
								t("btnSaveReview", { defaultMessage: "Lưu kết quả duyệt" })
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

