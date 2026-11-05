"use client";

import React from "react";
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
	if (!user) return null;

	const displayName = `${user.lastName} ${user.firstName}`.trim();

	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent style={{ borderRadius: "18px" }} className="max-w-md rounded-[18px] bg-white p-6 sm:p-8 shadow-2xl border-none">
				<AlertDialogHeader>
					<div className="flex items-center gap-3 mb-2">
						<div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
							<AlertTriangle className="w-5 h-5" />
						</div>
						<AlertDialogTitle className="text-base font-bold text-slate-900 dark:text-white">
							Xác nhận xóa người dùng
						</AlertDialogTitle>
					</div>

					<AlertDialogDescription className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
						<p>
							Bạn có chắc chắn muốn xóa tài khoản và hồ sơ bác sĩ{" "}
							<strong className="text-slate-900 dark:text-white">{displayName}</strong> (
							{user.email})?
						</p>
						<p className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-red-700 dark:text-red-300 font-semibold text-[11px]">
							Lưu ý: Thao tác này sẽ gửi lệnh đến Saga Orchestrator để đánh dấu xóa mềm (soft-delete) tài khoản, thu hồi mọi phiên đăng nhập và xóa tài nguyên avatar liên quan.
						</p>
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter className="mt-4 gap-2">
					<AlertDialogCancel disabled={isDeleting} className="text-xs">
						Hủy bỏ
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={(e) => {
							e.preventDefault();
							onConfirmDelete(user);
						}}
						disabled={isDeleting}
						className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
					>
						{isDeleting ? "Đang xử lý..." : "Xác nhận xóa"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

