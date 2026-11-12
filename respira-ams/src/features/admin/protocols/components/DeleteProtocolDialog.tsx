"use client";

import React, { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { ClinicalMetricItem } from "@/features/manager/clinical-metrics/types";

interface DeleteProtocolDialogProps {
	item: ClinicalMetricItem | null;
	isDeleting: boolean;
	onClose: () => void;
	onConfirm: (item: ClinicalMetricItem) => void;
}

export function DeleteProtocolDialog({ item, isDeleting, onClose, onConfirm }: DeleteProtocolDialogProps) {
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
				className="max-w-md rounded-[18px] bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800"
			>
				<AlertDialogHeader>
					<div className="flex items-center gap-3 mb-2">
						<div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
							<AlertTriangle className="w-5 h-5" />
						</div>
						<AlertDialogTitle className="text-base font-bold text-slate-900 dark:text-white">
							Xác nhận xóa mềm phác đồ
						</AlertDialogTitle>
					</div>

					<AlertDialogDescription asChild>
						<div className="text-xs text-slate-600 dark:text-slate-400 space-y-3">
							<p>
								Bạn có chắc chắn muốn xóa phác đồ{" "}
								<strong className="text-slate-900 dark:text-white">{item.name}</strong> (v{item.version})?
							</p>
							<div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg text-amber-800 dark:text-amber-300 font-medium text-[11px] leading-relaxed">
								Lưu ý: Hệ thống thực hiện <strong>xóa mềm (soft-delete)</strong>. Phác đồ và toàn bộ quy tắc (rules) liên kết sẽ bị ẩn khỏi danh sách sử dụng lâm sàng, nhưng toàn bộ lịch sử đánh giá bệnh nhân đã áp dụng trước đây vẫn được bảo toàn nguyên vẹn trong hệ thống.
							</div>

							<div className="pt-1 space-y-1.5">
								<label
									htmlFor="confirm-delete-protocol-input"
									className="text-xs font-semibold text-slate-700 dark:text-slate-300 block"
								>
									Để xác nhận, vui lòng nhập chữ{" "}
									<span className="font-bold text-red-600 bg-red-50 dark:bg-red-950/60 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800 tracking-wide">
										delete
									</span>{" "}
									vào ô bên dưới:
								</label>
								<Input
									id="confirm-delete-protocol-input"
									type="text"
									value={confirmText}
									onChange={(e) => setConfirmText(e.target.value)}
									placeholder="Nhập 'delete' để xác nhận"
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
						Hủy bỏ
					</AlertDialogCancel>
					<Button
						type="button"
						variant="destructive"
						disabled={!isMatch || isDeleting}
						onClick={() => {
							if (!isMatch || isDeleting) return;
							onConfirm(item);
						}}
						className={`text-white text-xs h-9 px-4 font-semibold rounded-lg transition-all ${
							isMatch
								? "bg-red-600 hover:bg-red-700 cursor-pointer shadow-sm"
								: "bg-red-300 dark:bg-red-900/40 cursor-not-allowed opacity-60"
						}`}
					>
						{isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
						{isDeleting ? "Đang xử lý..." : "Xác nhận xóa mềm"}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
