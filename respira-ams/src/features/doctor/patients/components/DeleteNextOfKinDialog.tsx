"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
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
import { NextOfKin } from "../types";
import { deleteNextOfKin } from "@/features/doctor/patients/api";

interface DeleteNextOfKinDialogProps {
	kin: NextOfKin | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export function DeleteNextOfKinDialog({
	kin,
	open,
	onOpenChange,
	onSuccess,
}: DeleteNextOfKinDialogProps) {
	const t = useTranslations("doctor.patients");
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (open) {
			setError(null);
		}
	}, [open]);

	if (!kin) return null;

	const handleConfirm = async () => {
		setIsDeleting(true);
		setError(null);
		try {
			await deleteNextOfKin(kin.id);
			onOpenChange(false);
			onSuccess?.();
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "";
			let friendly = "Không thể xóa người thân.";
			if (msg.includes("not found")) {
				friendly = "Không tìm thấy thông tin người thân.";
			} else if (msg) {
				friendly = msg;
			}
			setError(friendly);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[420px] rounded-[18px] bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
				<DialogHeader>
					<div className="flex items-center gap-3 mb-2">
						<div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
							<AlertTriangle className="w-5 h-5" />
						</div>
						<DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
							{t("deleteKinTitle", { defaultMessage: "Xác nhận xóa người thân" })}
						</DialogTitle>
					</div>

					<DialogDescription asChild>
						<div className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
							<p>
								{t("deleteKinPrompt", {
									defaultMessage: "Bạn có chắc chắn muốn xóa thông tin người thân này không?",
								})}
							</p>
							<div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
								<p className="font-bold text-slate-800 dark:text-slate-200">
									{kin.fullName}{" "}
									<span className="font-normal text-slate-500">
										({kin.relationship})
									</span>
								</p>
								<p className="text-[11px] font-mono text-slate-500 mt-0.5">
									{kin.phoneNumber}
								</p>
							</div>
						</div>
					</DialogDescription>
				</DialogHeader>

				{error && (
					<div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg text-red-600 dark:text-red-400 text-xs mt-2">
						{error}
					</div>
				)}

				<DialogFooter className="pt-4 gap-2 border-t border-slate-100 dark:border-slate-800">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isDeleting}
						className="h-9 px-4 text-xs font-semibold"
					>
						{t("btnCancel", { defaultMessage: "Hủy" })}
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={handleConfirm}
						disabled={isDeleting}
						className="h-9 px-5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white"
					>
						{isDeleting ? (
							<>
								<Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
								{t("btnDeleting", { defaultMessage: "Đang xóa..." })}
							</>
						) : (
							t("btnDelete", { defaultMessage: "Xóa" })
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

