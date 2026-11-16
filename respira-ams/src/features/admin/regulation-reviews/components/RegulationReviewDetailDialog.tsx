"use client";

import React from "react";
import {
	Phone,
	CheckCircle2,
	AlertCircle,
	Stethoscope,
	Check,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RegulationReviewItem } from "../types";

interface RegulationReviewDetailDialogProps {
	item: RegulationReviewItem | null;
	isOpen: boolean;
	onClose: () => void;
	onEdit?: (item: RegulationReviewItem) => void;
}

export function RegulationReviewDetailDialog({
	item,
	isOpen,
	onClose,
	onEdit,
}: RegulationReviewDetailDialogProps) {
	if (!item) return null;

	const initials = (item.email ? item.email.slice(0, 2) : "HĐ").toUpperCase();

	const permissions = [
		"Thẩm định và phê duyệt các phác đồ điều trị vi sinh",
		"Đánh giá tương tác thuốc và tiêu chuẩn kháng sinh",
		"Rà soát quy chuẩn chuyên môn y tế của hệ thống",
		"Truy cập kho dữ liệu vi sinh và kháng sinh đồ",
	];

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
						Hồ sơ thành viên Hội đồng thẩm định
					</DialogTitle>
					<DialogDescription className="text-xs text-slate-500">
						Chi tiết tài khoản Hội đồng thẩm định trong hệ thống Respira AMS
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 pt-2">
					{/* Profile Header */}
					<div className="flex items-center gap-4 p-4 rounded-xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-900/40">
						<Avatar className="h-14 w-14 border-2 border-white dark:border-slate-800 shadow-xs shrink-0">
							<AvatarFallback className="bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold text-base">
								{initials}
							</AvatarFallback>
						</Avatar>
						<div className="min-w-0 flex-1">
							<h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
								{item.email}
							</h3>
							<div className="flex items-center gap-2 mt-1">
								<Badge className="bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/60 dark:text-sky-200 text-[10.5px] font-bold">
									Hội đồng thẩm định
								</Badge>
								<Badge
									className={
										item.status === "Active"
											? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
											: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
									}
								>
									{item.status === "Active" ? "Hoạt động" : "Đã khóa"}
								</Badge>
							</div>
						</div>
					</div>

					{/* Information Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
						<div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
							<span className="text-slate-400 font-medium block mb-1">Mã định danh (Account ID)</span>
							<p className="font-mono font-bold text-slate-800 dark:text-slate-200 break-all text-[11px]">
								{item.id}
							</p>
						</div>

						<div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
							<span className="text-slate-400 font-medium block mb-1">Số điện thoại liên hệ</span>
							<p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
								<Phone className="w-3.5 h-3.5 text-slate-400" />
								<span>{item.phone || "Chưa cập nhật"}</span>
							</p>
						</div>

						<div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
							<span className="text-slate-400 font-medium block mb-1">Xác thực Email</span>
							{item.isEmailConfirmed ? (
								<span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
									<CheckCircle2 className="w-4 h-4" /> Đã xác thực
								</span>
							) : (
								<span className="inline-flex items-center gap-1 text-slate-400 font-medium text-xs">
									<AlertCircle className="w-4 h-4" /> Chưa xác thực
								</span>
							)}
						</div>

						<div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
							<span className="text-slate-400 font-medium block mb-1">Loại tài khoản</span>
							<span className="font-bold text-slate-800 dark:text-slate-200">
								Account-only Role
							</span>
						</div>
					</div>

					{/* System Permissions */}
					<div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
						<p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
							<Stethoscope className="w-4 h-4 text-[#0EA5E9]" />
							<span>Phạm vi quyền hạn hệ thống</span>
						</p>
						<ul className="space-y-1.5">
							{permissions.map((perm, idx) => (
								<li key={idx} className="flex items-start gap-2 text-[11.5px] text-slate-600 dark:text-slate-400">
									<Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
									<span>{perm}</span>
								</li>
							))}
						</ul>
					</div>
				</div>

				<DialogFooter className="pt-2">
					{onEdit && (
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								onClose();
								onEdit(item);
							}}
							className="text-xs font-semibold"
						>
							Chỉnh sửa thông tin
						</Button>
					)}
					<Button
						type="button"
						onClick={onClose}
						className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-semibold"
					>
						Đóng
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
