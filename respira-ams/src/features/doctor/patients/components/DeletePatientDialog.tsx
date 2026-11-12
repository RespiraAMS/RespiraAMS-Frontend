"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Patient } from "../types";

interface DeletePatientDialogProps {
	patient: Patient | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Should throw (e.g. ApiError) when the backend rejects the request. */
	onConfirmDelete: (patientId: string) => Promise<void>;
}

export function DeletePatientDialog({
	patient,
	open,
	onOpenChange,
	onConfirmDelete,
}: DeletePatientDialogProps) {
	const [confirmText, setConfirmText] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (open) {
			setConfirmText("");
			setError(null);
		}
	}, [open]);

	if (!patient) return null;

	const isMatch = confirmText.trim().toLowerCase() === "delete";

	const handleConfirm = async () => {
		if (!isMatch || isDeleting) return;

		setIsDeleting(true);
		setError(null);
		try {
			await onConfirmDelete(patient.id);
			onOpenChange(false);
		} catch (err) {
			const rawMsg = err instanceof Error ? err.message : "";
			if (rawMsg.includes("already received treatments")) {
				setError(
					"Bệnh nhân này đã có phác đồ hoặc dữ liệu điều trị, hệ thống không cho phép xóa để bảo toàn hồ sơ bệnh án."
				);
			} else {
				setError(rawMsg || "Không thể xóa bệnh nhân.");
			}
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) {
					setError(null);
					setConfirmText("");
				}
				onOpenChange(next);
			}}
		>
			<DialogContent className="sm:max-w-md rounded-[18px] bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800">
				<DialogHeader>
					<div className="flex items-center gap-3 mb-2">
						<div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
							<AlertTriangle className="w-5 h-5" />
						</div>
						<DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
							Xác nhận xóa mềm hồ sơ bệnh nhân
						</DialogTitle>
					</div>

					<DialogDescription asChild>
						<div className="text-xs text-slate-600 dark:text-slate-400 space-y-3">
							<p>
								Bạn có chắc chắn muốn xóa bệnh nhân{" "}
								<strong className="text-slate-900 dark:text-white">{patient.name}</strong> (
								Mã BN: {patient.code}) khỏi danh sách theo dõi không?
							</p>

							<div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg text-amber-800 dark:text-amber-300 font-medium text-[11px] leading-relaxed">
								Lưu ý: Hệ thống chỉ thực hiện <strong>xóa mềm (soft-delete)</strong> đối với bệnh nhân chưa tiếp nhận phác đồ điều trị. Hồ sơ sẽ được ẩn khỏi danh sách theo dõi nhưng toàn bộ dữ liệu lịch sử vẫn được bảo toàn nguyên vẹn trong hệ thống.
							</div>

							<div className="pt-1 space-y-1.5">
								<label
									htmlFor="confirm-delete-patient-input"
									className="text-xs font-semibold text-slate-700 dark:text-slate-300 block"
								>
									Để xác nhận xóa mềm, vui lòng nhập chữ{" "}
									<span className="font-bold text-red-600 bg-red-50 dark:bg-red-950/60 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800 tracking-wide">
										delete
									</span>{" "}
									vào ô bên dưới:
								</label>
								<Input
									id="confirm-delete-patient-input"
									type="text"
									value={confirmText}
									onChange={(e) => setConfirmText(e.target.value)}
									placeholder="Nhập 'delete' để xác nhận"
									className="h-9 text-xs rounded-lg"
									autoFocus
								/>
							</div>
						</div>
					</DialogDescription>
				</DialogHeader>

				{error && (
					<p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2 leading-relaxed">
						{error}
					</p>
				)}

				<DialogFooter className="mt-4 gap-2 justify-end">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isDeleting}
						className="rounded-[10px] text-xs h-9 font-semibold"
					>
						Hủy bỏ
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={handleConfirm}
						disabled={!isMatch || isDeleting}
						className={`rounded-[10px] text-xs h-9 px-4 font-semibold transition-all ${
							isMatch
								? "bg-red-600 hover:bg-red-700 cursor-pointer shadow-sm"
								: "bg-red-300 dark:bg-red-900/40 cursor-not-allowed opacity-60"
						}`}
					>
						{isDeleting ? "Đang xử lý..." : "Xác nhận xóa mềm"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
