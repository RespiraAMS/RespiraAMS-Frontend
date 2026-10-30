"use client";

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
	onConfirmDelete: (patientId: string) => void;
}

export function DeletePatientDialog({
	patient,
	open,
	onOpenChange,
	onConfirmDelete,
}: DeletePatientDialogProps) {
	if (!patient) return null;

	const handleConfirm = () => {
		onConfirmDelete(patient.id);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
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

				<DialogFooter className="pt-4 flex gap-2 justify-end">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="rounded-[10px] text-xs"
					>
						Hủy bỏ
					</Button>
					<Button
						type="button"
						variant="destructive"
						onClick={handleConfirm}
						className="rounded-[10px] text-xs font-semibold"
					>
						Xác nhận xóa
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
