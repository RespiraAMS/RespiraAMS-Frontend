"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	if (!patient) return null;

	const handleConfirm = async () => {
		setIsDeleting(true);
		setError(null);
		try {
			await onConfirmDelete(patient.id);
			onOpenChange(false);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Không thể xóa bệnh nhân."
			);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) setError(null);
				onOpenChange(next);
			}}
		>
			<DialogContent className="sm:max-w-sm rounded-[16px] bg-white p-6">
				<DialogHeader>
					<DialogTitle className="text-base font-bold text-slate-900">
						Xác nhận xóa hồ sơ bệnh nhân
					</DialogTitle>
					<DialogDescription className="text-xs text-slate-500 mt-2">
						Bạn có chắc chắn muốn xóa bệnh nhân{" "}
						<strong className="text-slate-800">{patient.name}</strong> ({patient.code}) khỏi
						danh sách không? Hành động này không thể hoàn tác.
					</DialogDescription>
				</DialogHeader>

				{error && (
					<p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-[10px] px-3.5 py-2.5">
						{error}
					</p>
				)}

				<DialogFooter className="pt-4 flex gap-2 justify-end">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isDeleting}
						className="rounded-[10px] text-xs"
					>
						Hủy bỏ
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={handleConfirm}
						disabled={isDeleting}
						className="rounded-[10px] text-xs font-semibold"
					>
						{isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
