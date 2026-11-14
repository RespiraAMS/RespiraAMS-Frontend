"use client";

import React from "react";
import {
	MoreVertical,
	Eye,
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
import { useTranslations } from "next-intl";
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
	const t = useTranslations("admin.users");
	// Chỉ hiện spinner toàn màn hình khi chưa có dữ liệu nào
	if (isLoading && users.length === 0) {
		return (
			<div className="bg-surface dark:bg-surface rounded-xl border border-border-default dark:border-border-default p-12 text-center">
				<div className="inline-block w-8 h-8 border-2 border-border-default border-t-primary rounded-full animate-spin mb-3" />
				<p className="text-sm font-medium text-text-secondary">Đang tải danh sách người dùng...</p>
			</div>
		);
	}

	if (users.length === 0 && !isLoading) {
		return (
			<div className="bg-surface dark:bg-surface rounded-xl border border-border-default dark:border-border-default p-12 text-center">
				<div className="w-12 h-12 rounded-full bg-surface-secondary dark:bg-surface text-text-tertiary flex items-center justify-center mx-auto mb-3">
					<AlertCircle className="w-6 h-6" />
				</div>
				<h3 className="text-sm font-bold text-text-primary dark:text-text-tertiary">
					Không tìm thấy người dùng phù hợp
				</h3>
				<p className="text-xs text-text-secondary mt-1">
					Vui lòng thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc vai trò, trạng thái.
				</p>
			</div>
		);
	}

	return (
		<div className="relative bg-surface dark:bg-surface rounded-xl border border-border-default dark:border-border-default shadow-xs overflow-hidden">
			{/* Loading bar mảnh chạy ngầm khi tìm kiếm */}
			{isLoading && (
				<div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/10 overflow-hidden z-10">
					<div className="w-full h-full bg-primary animate-pulse" />
				</div>
			)}
			<Table className={`transition-opacity duration-150 ${isLoading ? "opacity-60" : "opacity-100"}`}>
				<TableHeader className="bg-surface-secondary/80 dark:bg-background/60">
					<TableRow className="border-b border-border-default dark:border-border-default hover:bg-transparent">
						<TableHead className="w-[240px] font-bold text-xs uppercase tracking-wider text-text-secondary dark:text-text-tertiary py-3.5">
							{t("colUser")}
						</TableHead>
						<TableHead className="w-[200px] font-bold text-xs uppercase tracking-wider text-text-secondary dark:text-text-tertiary py-3.5">
							{t("colContact")}
						</TableHead>
						<TableHead className="w-[130px] font-bold text-xs uppercase tracking-wider text-text-secondary dark:text-text-tertiary py-3.5">
							{t("colRole")}
						</TableHead>
						<TableHead className="w-[140px] font-bold text-xs uppercase tracking-wider text-text-secondary dark:text-text-tertiary py-3.5">
							{t("colPosition")}
						</TableHead>
						<TableHead className="w-[160px] font-bold text-xs uppercase tracking-wider text-text-secondary dark:text-text-tertiary py-3.5">
							{t("colStatus")}
						</TableHead>
						<TableHead className="w-[110px] font-bold text-xs uppercase tracking-wider text-text-secondary dark:text-text-tertiary py-3.5">
							{t("colCreatedAt")}
						</TableHead>
						<TableHead className="w-[80px] text-right font-bold text-xs uppercase tracking-wider text-text-secondary dark:text-text-tertiary py-3.5">
							{t("colActions")}
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
								className="border-b border-border-subtle dark:border-border-default/60 hover:bg-surface-secondary/60 dark:hover:bg-surface/40 transition-colors"
							>
								{/* Name & Avatar */}
								<TableCell className="py-3">
									<div className="flex items-center gap-3">
										<Avatar className="h-9 w-9 border border-border-default dark:border-border-default">
											{user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={displayName} />}
											<AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary font-bold text-xs">
												{initials || "U"}
											</AvatarFallback>
										</Avatar>
										<div className="min-w-0">
											<div className="font-bold text-sm text-text-primary dark:text-primary-foreground truncate">
												{displayName}
											</div>
											<div className="text-[11px] text-text-tertiary truncate">
												{user.citizenIdentificationNumber ? `CCCD: ${user.citizenIdentificationNumber}` : "Hồ sơ y tế"}
											</div>
										</div>
									</div>
								</TableCell>

								{/* Contact */}
								<TableCell className="py-3">
									<div className="space-y-0.5">
										<div className="flex items-center gap-1.5 text-xs text-text-primary dark:text-text-tertiary">
											<Mail className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
											<span className="truncate">{user.email}</span>
										</div>
										{user.phone && (
											<div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
												<Phone className="w-3 h-3 text-text-tertiary shrink-0" />
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
											className="bg-info/10 text-info border-info/30 dark:bg-info/10 dark:text-info dark:border-info/30 font-bold"
										>
											{ROLE_LABELS[user.role]}
										</Badge>
									)}
									{user.role === "Manager" && (
										<Badge
											variant="outline"
											className="bg-warning/10 text-warning border-warning/30 dark:bg-warning/10 dark:text-warning dark:border-warning/30 font-bold"
										>
											{ROLE_LABELS[user.role]}
										</Badge>
									)}
									{user.role === "HeadDepartmentDoctor" && (
										<Badge
											variant="outline"
											className="bg-success/10 text-success border-success/30 dark:bg-success/10 dark:text-success dark:border-success/30 font-bold"
										>
											{ROLE_LABELS[user.role]}
										</Badge>
									)}
									{user.role === "Doctor" && (
										<Badge
											variant="outline"
											className="bg-primary/10 text-primary border-primary/30 dark:bg-primary/10 dark:text-primary dark:border-primary/30 font-bold"
										>
											{ROLE_LABELS[user.role]}
										</Badge>
									)}
								</TableCell>

								{/* Position */}
								<TableCell className="py-3">
									<span className="text-xs font-medium text-text-primary dark:text-text-tertiary">
										{POSITION_LABELS[user.position] || user.position || "—"}
									</span>
								</TableCell>

								{/* Status with interactive switch toggle */}
								<TableCell className="py-3">
									<div className="flex items-center gap-2.5">
										{/* Nút bật/tắt khóa tài khoản riêng ở ngoài */}
										<button
											type="button"
											role="switch"
											aria-checked={user.status === "Active"}
											disabled={user.role === "Admin"}
											onClick={(e) => {
												e.stopPropagation();
												onToggleStatus(user);
											}}
											title={
												user.role === "Admin"
													? "Không thể khóa tài khoản Quản trị viên"
													: user.status === "Active"
													? "Tài khoản đang hoạt động. Nhấn để khóa tài khoản"
													: "Tài khoản đang bị khóa. Nhấn để mở khóa tài khoản"
											}
											className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
												user.role === "Admin"
													? "opacity-50 cursor-not-allowed bg-success/60"
													: user.status === "Active"
													? "bg-success hover:bg-success/90"
													: "bg-border-strong dark:bg-surface-secondary hover:bg-text-tertiary dark:hover:bg-surface-tertiary"
											}`}
										>
											<span
												className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-surface shadow-xs ring-0 transition duration-200 ease-in-out ${
													user.status === "Active" ? "translate-x-4.5" : "translate-x-0.5"
												}`}
											/>
										</button>

										{user.status === "Active" ? (
											<Badge
												variant="outline"
												className="font-bold flex items-center gap-1 text-[11px] py-0.5 px-2 bg-success/10 text-success border-success/30 dark:bg-success/10 dark:text-success"
											>
												<CheckCircle className="w-3 h-3" />
												<span>{t("active")}</span>
											</Badge>
										) : (
											<Badge
												variant="destructive"
												className="font-bold flex items-center gap-1 text-[11px] py-0.5 px-2 bg-error/10 text-error border-error/30 dark:bg-error/10 dark:text-error"
											>
												<Lock className="w-3 h-3" />
												<span>{t("locked")}</span>
											</Badge>
										)}
									</div>
								</TableCell>

								{/* Created At */}
								<TableCell className="py-3">
									<span className="text-xs text-text-secondary whitespace-nowrap">
										{formatDate(user.createdAt)}
									</span>
								</TableCell>

								{/* Action Menu */}
								<TableCell className="py-3 text-right">
									<div className="flex items-center justify-end gap-1">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onEditUser(user)}
											title="Chỉnh sửa toàn bộ thông tin"
											className="h-8 w-8 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/10"
										>
											<Edit className="w-3.5 h-3.5" />
										</Button>

										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 rounded-lg hover:bg-surface-secondary dark:hover:bg-surface text-text-secondary"
												>
													<MoreVertical className="w-4 h-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end" className="w-44">
												<DropdownMenuItem
													onClick={() => onViewUser(user)}
													className="cursor-pointer text-xs font-semibold gap-2 py-2"
												>
													<Eye className="w-3.5 h-3.5 text-text-secondary" />
													<span>Xem chi tiết</span>
												</DropdownMenuItem>

												<DropdownMenuSeparator />

												<DropdownMenuItem
													onClick={() => onDeleteUser(user)}
													disabled={user.role === "Admin"}
													className="cursor-pointer text-xs font-semibold gap-2 py-2 text-error focus:text-error focus:bg-error/10 dark:focus:bg-error/10"
												>
													<Trash2 className="w-3.5 h-3.5 text-error" />
													<span>Xóa người dùng</span>
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
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

