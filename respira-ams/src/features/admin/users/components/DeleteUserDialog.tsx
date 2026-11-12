"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
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
			<AlertDialogContent style={{ borderRadius: "18px" }} className="max-w-md rounded-[18px] bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
				<AlertDialogHeader>
					<div className="flex items-center gap-3 mb-2">
						<div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
							<AlertTriangle className="w-5 h-5" />
						</div>
						<AlertDialogTitle className="text-base font-bold text-slate-900 dark:text-white">
							Xác nhận xóa mềm người dùng
						</AlertDialogTitle>
					</div>

					<AlertDialogDescription asChild>
						<div className="text-xs text-slate-600 dark:text-slate-400 space-y-3">
							<p>
								Bạn có chắc chắn muốn xóa tài khoản và hồ sơ bác sĩ{" "}
								<strong className="text-slate-900 dark:text-white">{displayName}</strong> (
								{user.email})?
							</p>
							<div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg text-amber-800 dark:text-amber-300 font-medium text-[11px] leading-relaxed">
								Lưu ý: Hệ thống chỉ thực hiện <strong>xóa mềm (soft-delete)</strong>: Tài khoản và hồ sơ sẽ bị ẩn khỏi danh sách sử dụng và thu hồi quyền đăng nhập. Toàn bộ lịch sử chẩn đoán, dữ liệu khám bệnh và phác đồ vẫn được bảo toàn nguyên vẹn trong cơ sở dữ liệu.
							</div>

							<div className="pt-1 space-y-1.5">
								<label
									htmlFor="confirm-delete-input"
									className="text-xs font-semibold text-slate-700 dark:text-slate-300 block"
								>
									Để xác nhận, vui lòng nhập chữ{" "}
									<span className="font-bold text-red-600 bg-red-50 dark:bg-red-950/60 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800 tracking-wide">
										delete
									</span>{" "}
									vào ô bên dưới:
								</label>
								<Input
									id="confirm-delete-input"
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
					<AlertDialogAction
						onClick={(e) => {
							e.preventDefault();
							if (!isMatch || isDeleting) return;
							onConfirmDelete(user);
						}}
						disabled={!isMatch || isDeleting}
						className={`text-white text-xs h-9 px-4 font-semibold rounded-lg transition-all ${
							isMatch
								? "bg-red-600 hover:bg-red-700 cursor-pointer shadow-sm"
								: "bg-red-300 dark:bg-red-900/40 cursor-not-allowed opacity-60"
						}`}
					>
						{isDeleting ? "Đang xử lý..." : "Xác nhận xóa"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

