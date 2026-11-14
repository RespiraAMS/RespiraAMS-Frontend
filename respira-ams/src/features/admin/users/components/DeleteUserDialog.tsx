"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { UserItem } from "../types";

interface DeleteUserDialogProps {
	user: UserItem | null;
	isOpen: boolean;
	onClose: () => void;
	onConfirmDelete: (user: UserItem) => Promise<void>;
	isDeleting?: boolean;
}

export function DeleteUserDialog({
	user,
	isOpen,
	onClose,
	onConfirmDelete,
	isDeleting = false,
}: DeleteUserDialogProps) {
	const t = useTranslations("admin.users");
	const [confirmText, setConfirmText] = useState("");

	useEffect(() => {
		if (isOpen) {
			setConfirmText("");
		}
	}, [isOpen]);

	if (!user) return null;

	const displayName = `${user.lastName} ${user.firstName}`.trim();
	const isMatch = confirmText.trim().toLowerCase() === "delete";

	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent style={{ borderRadius: "18px" }} className="max-w-md rounded-[18px] bg-surface dark:bg-surface p-6 sm:p-8 shadow-2xl border border-border-default dark:border-border-default">
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
								<strong className="text-text-primary dark:text-primary-foreground">{displayName}</strong> (
								{user.email})
							</p>
							<div className="p-3 bg-warning/10 dark:bg-warning/10 border border-warning/30 dark:border-warning/30 rounded-lg text-warning dark:text-warning font-medium text-[11px] leading-relaxed">
								{t("deleteWarning")}
							</div>

							<div className="pt-1 space-y-1.5">
								<label
									htmlFor="confirm-delete-input"
									className="text-xs font-semibold text-text-primary dark:text-text-tertiary block"
								>
									{t("deletePrompt")}{" "}
									<span className="font-bold text-error bg-error/10 dark:bg-error/10 px-1.5 py-0.5 rounded border border-error/30 dark:border-error/40 tracking-wide">
										delete
									</span>
								</label>
								<Input
									id="confirm-delete-input"
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
					<AlertDialogAction
						onClick={(e) => {
							e.preventDefault();
							if (!isMatch || isDeleting) return;
							onConfirmDelete(user);
						}}
						disabled={!isMatch || isDeleting}
						className={`text-primary-foreground text-xs h-9 px-4 font-semibold rounded-lg transition-all ${
							isMatch
								? "bg-error hover:bg-error/90 cursor-pointer shadow-sm"
								: "bg-error/30 dark:bg-error/20 cursor-not-allowed opacity-60"
						}`}
					>
						{isDeleting ? t("deleting") : t("deleteConfirm")}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
