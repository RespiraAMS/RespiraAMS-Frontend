"use client";

import React from "react";
import {
	MoreVertical,
	Eye,
	Edit,
	Trash2,
	Lock,
	Unlock,
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserItem } from "../types";
import {
	POSITION_LABELS,
	ROLE_LABELS,
	formatDate,
	formatFullNameWithTitle,
} from "../utils";

interface UsersTableProps {
	users: UserItem[];
	isLoading?: boolean;
	onViewUser: (user: UserItem) => void;
	onEditUser: (user: UserItem) => void;
	onDeleteUser: (user: UserItem) => void;
	onToggleStatus: (user: UserItem) => void;
}

export function UsersTable({
	users,
	isLoading = false,
	onViewUser,
	onEditUser,
	onDeleteUser,
	onToggleStatus,
}: UsersTableProps) {
	// Chỉ hiện spinner toàn màn hình khi chưa có dữ liệu nào
	if (isLoading && users.length === 0) {
		return (
			<div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
				<div className="inline-block w-8 h-8 border-2 border-slate-200 border-t-[#0EA5E9] rounded-full animate-spin mb-3" />
				<p className="text-sm font-medium text-slate-500">Đang tải danh sách người dùng...</p>
			</div>
		);
	}

	if (users.length === 0 && !isLoading) {
		return (
			<div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
				<div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
					<AlertCircle className="w-6 h-6" />
				</div>
				<h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
					Không tìm thấy người dùng phù hợp
				</h3>
				<p className="text-xs text-slate-500 mt-1">
					Vui lòng thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc vai trò, trạng thái.
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
						<TableHead className="w-[280px] font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 py-3.5">
							Họ và tên / Chuyên môn
						</TableHead>
						<TableHead className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 py-3.5">
							Liên hệ
						</TableHead>
						<TableHead className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 py-3.5">
							Vai trò
						</TableHead>
						<TableHead className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 py-3.5">
							Vị trí / Chức vụ
						</TableHead>
						<TableHead className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 py-3.5">
							Trạng thái
						</TableHead>
						<TableHead className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 py-3.5">
							Ngày tạo
						</TableHead>
						<TableHead className="w-[60px] text-right font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 py-3.5">
							Thao tác
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{users.map((user) => {
						const initials = `${user.lastName[0] || ""}${user.firstName[0] || ""}`.toUpperCase();
						const displayName = formatFullNameWithTitle(
							user.lastName,
							user.firstName,
							user.academicTitle,
							user.degrees
						);

						return (
							<TableRow
								key={user.id}
								className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
							>
								{/* Name & Avatar */}
								<TableCell className="py-3">
									<div className="flex items-center gap-3">
										<Avatar className="h-9 w-9 border border-slate-200 dark:border-slate-700">
											{user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={displayName} />}
											<AvatarFallback className="bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold text-xs">
												{initials || "U"}
											</AvatarFallback>
										</Avatar>
										<div className="min-w-0">
											<div className="font-bold text-sm text-slate-900 dark:text-white truncate">
												{displayName}
											</div>
											<div className="text-[11px] text-slate-400 truncate">
												{user.citizenIdentificationNumber ? `CCCD: ${user.citizenIdentificationNumber}` : "Hồ sơ y tế"}
											</div>
										</div>
									</div>
								</TableCell>

								{/* Contact */}
								<TableCell className="py-3">
									<div className="space-y-0.5">
										<div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
											<Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
											<span className="truncate">{user.email}</span>
										</div>
										{user.phone && (
											<div className="flex items-center gap-1.5 text-[11px] text-slate-500">
												<Phone className="w-3 h-3 text-slate-400 shrink-0" />
												<span>{user.phone}</span>
											</div>
										)}
									</div>
								</TableCell>

								{/* Role Badge */}
								<TableCell className="py-3">
									{user.role === "Admin" && (
										<Badge
											variant="outline"
											className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900 font-bold"
										>
											{ROLE_LABELS[user.role]}
										</Badge>
									)}
									{user.role === "Manager" && (
										<Badge
											variant="outline"
											className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900 font-bold"
										>
											{ROLE_LABELS[user.role]}
										</Badge>
									)}
									{user.role === "Doctor" && (
										<Badge
											variant="outline"
											className="bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900 font-bold"
										>
											{ROLE_LABELS[user.role]}
										</Badge>
									)}
								</TableCell>

								{/* Position */}
								<TableCell className="py-3">
									<span className="text-xs font-medium text-slate-700 dark:text-slate-300">
										{POSITION_LABELS[user.position] || user.position || "—"}
									</span>
								</TableCell>

								{/* Status */}
								<TableCell className="py-3">
									<div className="flex items-center gap-1.5">
										{user.status === "Active" ? (
											<Badge
												variant="success"
												className="font-bold flex items-center gap-1 text-[11px]"
											>
												<CheckCircle className="w-3 h-3" />
												<span>Hoạt động</span>
											</Badge>
										) : (
											<Badge
												variant="destructive"
												className="font-bold flex items-center gap-1 text-[11px]"
											>
												<Lock className="w-3 h-3" />
												<span>Đã khóa</span>
											</Badge>
										)}
									</div>
								</TableCell>

								{/* Created At */}
								<TableCell className="py-3">
									<span className="text-xs text-slate-500 whitespace-nowrap">
										{formatDate(user.createdAt)}
									</span>
								</TableCell>

								{/* Action Menu */}
								<TableCell className="py-3 text-right">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
											>
												<MoreVertical className="w-4 h-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end" className="w-48">
											<DropdownMenuItem
												onClick={() => onViewUser(user)}
												className="cursor-pointer text-xs font-semibold gap-2 py-2"
											>
												<Eye className="w-3.5 h-3.5 text-slate-500" />
												<span>Xem chi tiết</span>
											</DropdownMenuItem>

											<DropdownMenuItem
												onClick={() => onEditUser(user)}
												className="cursor-pointer text-xs font-semibold gap-2 py-2"
											>
												<Edit className="w-3.5 h-3.5 text-sky-600" />
												<span>Chỉnh sửa hồ sơ</span>
											</DropdownMenuItem>

											<DropdownMenuItem
												onClick={() => onToggleStatus(user)}
												className="cursor-pointer text-xs font-semibold gap-2 py-2"
											>
												{user.status === "Active" ? (
													<>
														<Lock className="w-3.5 h-3.5 text-amber-600" />
														<span>Khóa tài khoản</span>
													</>
												) : (
													<>
														<Unlock className="w-3.5 h-3.5 text-emerald-600" />
														<span>Mở khóa tài khoản</span>
													</>
												)}
											</DropdownMenuItem>

											<DropdownMenuSeparator />

											<DropdownMenuItem
												onClick={() => onDeleteUser(user)}
												className="cursor-pointer text-xs font-semibold gap-2 py-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40"
											>
												<Trash2 className="w-3.5 h-3.5 text-red-600" />
												<span>Xóa người dùng</span>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}

