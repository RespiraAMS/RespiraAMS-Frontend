"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
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
import { ClinicalMetricItem } from "@/features/manager/clinical-metrics/types";

interface DeleteProtocolDialogProps {
	item: ClinicalMetricItem | null;
	isDeleting: boolean;
	onClose: () => void;
	onConfirm: (item: ClinicalMetricItem) => void;
}

export function DeleteProtocolDialog({ item, isDeleting, onClose, onConfirm }: DeleteProtocolDialogProps) {
	return (
		<AlertDialog open={!!item} onOpenChange={(o) => !o && onClose()}>
			<AlertDialogContent
				style={{ borderRadius: "18px" }}
				className="max-w-md rounded-[18px] bg-white p-6 sm:p-8 shadow-2xl border-none"
			>
				<AlertDialogHeader>
					<div className="flex items-center gap-3 mb-2">
						<div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
							<AlertTriangle className="w-5 h-5" />
						</div>
						<AlertDialogTitle className="text-base font-bold text-slate-900">
							Xác nhận xóa phác đồ
						</AlertDialogTitle>
					</div>
					<AlertDialogDescription className="text-xs text-slate-600 space-y-2">
						<span className="block">
							Bạn có chắc chắn muốn xóa phác đồ{" "}
							<strong className="text-slate-900">{item?.name}</strong> (v{item?.version})?
						</span>
						<span className="block p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 font-semibold text-[11px]">
							Phác đồ sẽ bị xóa mềm cùng toàn bộ quy tắc (rules) thuộc phác đồ và không còn xuất hiện trong danh sách.
						</span>
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter className="mt-4 gap-2">
					<AlertDialogCancel disabled={isDeleting} className="h-11 px-6 text-sm">
						Hủy bỏ
					</AlertDialogCancel>
					<Button
						type="button"
						variant="destructive"
						disabled={isDeleting}
						onClick={() => item && onConfirm(item)}
						className="h-11 px-6 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
					>
						{isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
						Xác nhận xóa
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
