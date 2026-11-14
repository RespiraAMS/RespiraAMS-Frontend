"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClinicalMetricItem } from "@/features/manager/clinical-metrics/types";

interface DeleteProtocolDialogProps {
	item: ClinicalMetricItem | null;
	isDeleting: boolean;
	onClose: () => void;
	onConfirm: (item: ClinicalMetricItem) => void;
}

export function DeleteProtocolDialog({ item, isDeleting, onClose, onConfirm }: DeleteProtocolDialogProps) {
	const t = useTranslations("admin.protocols");
	const [confirmText, setConfirmText] = useState("");

	useEffect(() => {
		if (item) {
			setConfirmText("");
		}
	}, [item]);

	if (!item) return null;

	const isMatch = confirmText.trim().toLowerCase() === "delete";

	return (
		<AlertDialog open={!!item} onOpenChange={(o) => !o && onClose()}>
			<AlertDialogContent
				style={{ borderRadius: "18px" }}
				className="max-w-md rounded-[18px] bg-surface dark:bg-surface p-6 sm:p-8 shadow-2xl border border-border-default dark:border-border-default"
			>
				<AlertDialogHeader>
					<div className="flex items-center gap-3 mb-2">
						<div className="w-10 h-10 rounded-full bg-error/10 dark:bg-error/10 text-error flex items-center justify-center shrink-0">
							<AlertTriangle className="w-5 h-5" />
						</div>
						<AlertDialogTitle className="text-base font-bold text-text-primary dark:text-primary-foreground">
							{t("deleteTitle")}
						</AlertDialogTitle>
					</div>

					<AlertDialogDescription asChild>
						<div className="text-xs text-text-secondary dark:text-text-tertiary space-y-3">
							<p>
								<strong className="text-text-primary dark:text-primary-foreground">{item.name}</strong> (v{item.version})
							</p>
							<div className="p-3 bg-warning/10 dark:bg-warning/10 border border-warning/30 dark:border-warning/30 rounded-lg text-warning dark:text-warning font-medium text-[11px] leading-relaxed">
								{t("deleteWarning")}
							</div>

							<div className="pt-1 space-y-1.5">
								<label
									htmlFor="confirm-delete-protocol-input"
									className="text-xs font-semibold text-text-primary dark:text-text-tertiary block"
								>
									{t("deletePrompt")}{" "}
									<span className="font-bold text-error bg-error/10 dark:bg-error/10 px-1.5 py-0.5 rounded border border-error/30 dark:border-error/40 tracking-wide">
										delete
									</span>
								</label>
								<Input
									id="confirm-delete-protocol-input"
									type="text"
									value={confirmText}
									onChange={(e) => setConfirmText(e.target.value)}
									placeholder={t("deletePlaceholder")}
									className="h-9 text-xs rounded-lg"
									autoFocus
								/>
							</div>
						</div>
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter className="mt-4 gap-2">
					<AlertDialogCancel
						disabled={isDeleting}
						onClick={() => setConfirmText("")}
						className="text-xs h-9 font-semibold"
					>
						{t("deleteCancel")}
					</AlertDialogCancel>
					<Button
						type="button"
						variant="destructive"
						disabled={!isMatch || isDeleting}
						onClick={() => {
							if (!isMatch || isDeleting) return;
							onConfirm(item);
						}}
						className={`text-primary-foreground text-xs h-9 px-4 font-semibold rounded-lg transition-all ${
							isMatch
								? "bg-error hover:bg-error/90 cursor-pointer shadow-sm"
								: "bg-error/30 dark:bg-error/20 cursor-not-allowed opacity-60"
						}`}
					>
						{isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
						{isDeleting ? t("deleting") : t("deleteConfirm")}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
