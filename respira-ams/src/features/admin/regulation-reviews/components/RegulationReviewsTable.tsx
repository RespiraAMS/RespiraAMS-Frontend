"use client";

import React from "react";
import {
	Edit,
	Trash2,
	Lock,
	Mail,
	Phone,
	CheckCircle,
	AlertCircle,
} from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RegulationReviewItem } from "../types";

interface RegulationReviewsTableProps {
	items: RegulationReviewItem[];
	isLoading: boolean;
	onEdit: (item: RegulationReviewItem) => void;
	onDelete: (item: RegulationReviewItem) => void;
	onToggleStatus?: (item: RegulationReviewItem) => void;
}

export function RegulationReviewsTable({
	items,
	isLoading,
	onEdit,
	onDelete,
	onToggleStatus,
}: RegulationReviewsTableProps) {
	if (isLoading && items.length === 0) {
		return (
			<div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
				<div className="inline-block w-8 h-8 border-2 border-slate-200 border-t-[#0EA5E9] rounded-full animate-spin mb-3" />
				<p className="text-sm font-medium text-slate-500">
					Đang tải danh sách thành viên Hội đồng thẩm định...
				</p>
			</div>
		);
	}

	if (items.length === 0 && !isLoading) {
		return (
			<div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
				<div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
					<AlertCircle className="w-6 h-6" />
				</div>
				<h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
					Không tìm thấy thành viên phù hợp
				</h3>
				<p className="text-xs text-slate-500 mt-1">
					Vui lòng thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc trạng thái.
				</p>
			</div>
		);
	}

	return (
		<div className="relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
			{/* Loading bar mảnh chạy ngầm khi tìm kiếm */}
			{isLoading && (
				<div className="absolute top-0 left-0 right-0 h-0.5 bg-sky-100 overflow-hidden z-10">
					<div className="w-full h-full bg-[#0EA5E9] animate-pulse" />
				</div>
			)}
			<Table className={`transition-opacity duration-150 ${isLoading ? "opacity-60" : "opacity-100"}`}>
				<TableHeader className="bg-slate-50/80 dark:bg-slate-950/60">
					<TableRow className="border-b border-slate-200 dark:border-slate-800 hover:bg-transparent">
						<TableHead className="w-[240px] font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 py-3.5">
							Thành viên Hội đồng
						</TableHead>
						<TableHead className="w-[220px] font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 py-3.5">
							Thông tin liên hệ
						</TableHead>
						<TableHead className="w-[180px] font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 py-3.5">
							Vai trò hệ thống
						</TableHead>
						<TableHead className="w-[150px] font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 py-3.5">
							Xác thực Email
						</TableHead>
						<TableHead className="w-[160px] font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 py-3.5">
							Trạng thái
						</TableHead>
						<TableHead className="w-[80px] text-right font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 py-3.5">
							Thao tác
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{items.map((item) => {
						const initials = (item.email ? item.email.slice(0, 2) : "HĐ").toUpperCase();

						return (
							<TableRow
								key={item.id}
								className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
							>
								{/* Name & Avatar */}
								<TableCell className="py-3">
									<div className="flex items-center gap-3">
										<Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700 shrink-0">
											<AvatarFallback className="bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold text-xs">
												{initials}
											</AvatarFallback>
										</Avatar>
										<div className="min-w-0">
											<p className="font-bold text-sm text-slate-900 dark:text-white truncate">
												{item.email}
											</p>
											<p className="text-[11px] text-slate-400 font-mono truncate">
												ID: {item.id.slice(0, 14)}...
											</p>
										</div>
									</div>
								</TableCell>

								{/* Contact */}
								<TableCell className="py-3">
									<div className="space-y-0.5">
										<div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
											<Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
											<span className="truncate max-w-[190px]">{item.email}</span>
										</div>
										<div className="flex items-center gap-1.5 text-[11px] text-slate-500">
											<Phone className="w-3 h-3 text-slate-400 shrink-0" />
											<span>{item.phone || "Chưa cập nhật"}</span>
										</div>
									</div>
								</TableCell>

								{/* Role Badge */}
								<TableCell className="py-3">
									<Badge
										variant="outline"
										className="bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900 font-bold text-xs"
									>
										Hội đồng thẩm định
									</Badge>
								</TableCell>

								{/* Email Confirmed */}
								<TableCell className="py-3">
									{item.isEmailConfirmed ? (
										<span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
											<CheckCircle className="w-4 h-4 shrink-0" />
											<span>Đã xác thực</span>
										</span>
									) : (
										<span className="inline-flex items-center gap-1.5 text-slate-400 text-xs">
											<AlertCircle className="w-4 h-4 shrink-0" />
											<span>Chưa xác thực</span>
										</span>
									)}
								</TableCell>

								{/* Status with interactive switch toggle */}
								<TableCell className="py-3">
									<div className="flex items-center gap-2.5">
										{onToggleStatus && (
											<button
												type="button"
												role="switch"
												aria-checked={item.status === "Active"}
												onClick={(e) => {
													e.stopPropagation();
													onToggleStatus(item);
												}}
												title={
													item.status === "Active"
														? "Tài khoản đang hoạt động. Nhấn để khóa tài khoản"
														: "Tài khoản đang bị khóa. Nhấn để mở khóa tài khoản"
												}
												className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${
													item.status === "Active"
														? "bg-emerald-500 hover:bg-emerald-600"
														: "bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
												}`}
											>
												<span
													className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
														item.status === "Active" ? "translate-x-4.5" : "translate-x-0.5"
													}`}
												/>
											</button>
										)}

										{item.status === "Active" ? (
											<Badge
												variant="success"
												className="font-bold flex items-center gap-1 text-[11px] py-0.5 px-2 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
											>
												<CheckCircle className="w-3 h-3" />
												<span>Hoạt động</span>
											</Badge>
										) : (
											<Badge
												variant="destructive"
												className="font-bold flex items-center gap-1 text-[11px] py-0.5 px-2 bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300"
											>
												<Lock className="w-3 h-3" />
												<span>Đã khóa</span>
											</Badge>
										)}
									</div>
								</TableCell>

								{/* Action Buttons: Edit and Direct Delete (Thùng rác) */}
								<TableCell className="py-3 text-right">
									<div className="flex items-center justify-end gap-1">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onEdit(item)}
											title="Chỉnh sửa toàn bộ thông tin"
											className="h-8 w-8 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40"
										>
											<Edit className="w-3.5 h-3.5" />
										</Button>

										<Button
											variant="ghost"
											size="icon"
											onClick={() => onDelete(item)}
											title="Xóa tài khoản"
											className="h-8 w-8 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
										>
											<Trash2 className="w-3.5 h-3.5" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
