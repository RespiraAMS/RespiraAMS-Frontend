"use client";

import React from "react";
import {
	Mail,
	Phone,
	Calendar,
	MapPin,
	CreditCard,
	Award,
	Briefcase,
	Shield,
	CheckCircle2,
	Lock,
} from "lucide-react";
import {
	Dialog,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { UserDialogContent } from "./UserDialogContent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserItem } from "../types";
import {
	ACADEMIC_TITLE_LABELS,
	POSITION_LABELS,
	ROLE_LABELS,
	formatDate,
	formatDegrees,
	formatFullNameWithTitle,
} from "../utils";

interface UserDetailDialogProps {
	user: UserItem | null;
	isOpen: boolean;
	onClose: () => void;
}

export function UserDetailDialog({ user, isOpen, onClose }: UserDetailDialogProps) {
	if (!user) return null;

	const initials = `${user.lastName[0] || ""}${user.firstName[0] || ""}`.toUpperCase();
	const displayName = formatFullNameWithTitle(
		user.lastName,
		user.firstName,
		user.academicTitle,
		user.degrees
	);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<UserDialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle className="text-base font-bold text-text-primary dark:text-primary-foreground">
						Hồ sơ chi tiết người dùng
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6 pt-3">
					{/* Header banner */}
					<div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-info/10 dark:from-background dark:to-surface border border-primary/30 dark:border-border-default">
						<Avatar className="h-16 w-16 border-2 border-surface shadow-md">
							{user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={displayName} />}
							<AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
								{initials || "U"}
							</AvatarFallback>
						</Avatar>

						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2 flex-wrap">
								<h3 className="text-base font-extrabold text-text-primary dark:text-primary-foreground truncate">
									{displayName}
								</h3>
								<Badge
									variant="outline"
									className="bg-surface/80 dark:bg-surface font-bold text-xs"
								>
									{ROLE_LABELS[user.role]}
								</Badge>
							</div>
							<p className="text-xs text-text-secondary mt-0.5">
								{POSITION_LABELS[user.position] || user.position}
							</p>
							<div className="flex items-center gap-2 mt-2">
								{user.status === "Active" ? (
									<span className="inline-flex items-center gap-1 text-[11px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
										<CheckCircle2 className="w-3 h-3" />
										Đang hoạt động
									</span>
								) : (
									<span className="inline-flex items-center gap-1 text-[11px] font-bold text-error bg-error/10 px-2 py-0.5 rounded-full">
										<Lock className="w-3 h-3" />
										Đã khóa
									</span>
								)}
								{user.isEmailConfirmed && (
									<span className="text-[11px] font-medium text-text-tertiary">
										• Email đã xác thực
									</span>
								)}
							</div>
						</div>
					</div>

					{/* Information Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
						<div className="p-3.5 rounded-xl bg-surface-secondary dark:bg-background/40 border border-border-default/80 dark:border-border-default space-y-1">
							<div className="flex items-center gap-1.5 text-text-tertiary font-semibold uppercase tracking-wider text-[10px]">
								<Mail className="w-3.5 h-3.5 text-text-tertiary" />
								<span>Email đăng nhập</span>
							</div>
							<p className="font-bold text-text-primary dark:text-primary-foreground text-sm break-all">
								{user.email}
							</p>
						</div>

						<div className="p-3.5 rounded-xl bg-surface-secondary dark:bg-background/40 border border-border-default/80 dark:border-border-default space-y-1">
							<div className="flex items-center gap-1.5 text-text-tertiary font-semibold uppercase tracking-wider text-[10px]">
								<Phone className="w-3.5 h-3.5 text-text-tertiary" />
								<span>Số điện thoại</span>
							</div>
							<p className="font-bold text-text-primary dark:text-primary-foreground text-sm">
								{user.phone || "—"}
							</p>
						</div>

						<div className="p-3.5 rounded-xl bg-surface-secondary dark:bg-background/40 border border-border-default/80 dark:border-border-default space-y-1">
							<div className="flex items-center gap-1.5 text-text-tertiary font-semibold uppercase tracking-wider text-[10px]">
								<CreditCard className="w-3.5 h-3.5 text-text-tertiary" />
								<span>Số CCCD / CMND</span>
							</div>
							<p className="font-bold text-text-primary dark:text-primary-foreground text-sm">
								{user.citizenIdentificationNumber || "—"}
							</p>
						</div>

						<div className="p-3.5 rounded-xl bg-surface-secondary dark:bg-background/40 border border-border-default/80 dark:border-border-default space-y-1">
							<div className="flex items-center gap-1.5 text-text-tertiary font-semibold uppercase tracking-wider text-[10px]">
								<Calendar className="w-3.5 h-3.5 text-text-tertiary" />
								<span>Ngày sinh / Giới tính</span>
							</div>
							<p className="font-bold text-text-primary dark:text-primary-foreground text-sm">
								{formatDate(user.dateOfBirth)} ({user.gender === "Male" ? "Nam" : "Nữ"})
							</p>
						</div>

						<div className="sm:col-span-2 p-3.5 rounded-xl bg-surface-secondary dark:bg-background/40 border border-border-default/80 dark:border-border-default space-y-1">
							<div className="flex items-center gap-1.5 text-text-tertiary font-semibold uppercase tracking-wider text-[10px]">
								<MapPin className="w-3.5 h-3.5 text-text-tertiary" />
								<span>Địa chỉ nơi cư trú / Khoa phòng</span>
							</div>
							<p className="font-semibold text-text-primary dark:text-text-tertiary text-xs">
								{user.address || "—"}
							</p>
						</div>

						<div className="p-3.5 rounded-xl bg-surface-secondary dark:bg-background/40 border border-border-default/80 dark:border-border-default space-y-1">
							<div className="flex items-center gap-1.5 text-text-tertiary font-semibold uppercase tracking-wider text-[10px]">
								<Award className="w-3.5 h-3.5 text-text-tertiary" />
								<span>Học hàm</span>
							</div>
							<p className="font-bold text-text-primary dark:text-primary-foreground text-sm">
								{ACADEMIC_TITLE_LABELS[user.academicTitle] || "Không"}
							</p>
						</div>

						<div className="p-3.5 rounded-xl bg-surface-secondary dark:bg-background/40 border border-border-default/80 dark:border-border-default space-y-1">
							<div className="flex items-center gap-1.5 text-text-tertiary font-semibold uppercase tracking-wider text-[10px]">
								<Award className="w-3.5 h-3.5 text-text-tertiary" />
								<span>Học vị y khoa</span>
							</div>
							<p className="font-bold text-text-primary dark:text-primary-foreground text-sm">
								{formatDegrees(user.degrees)}
							</p>
						</div>
					</div>

					{/* Metadata */}
					<div className="flex items-center justify-between pt-2 border-t border-border-subtle dark:border-border-default text-[11px] text-text-tertiary">
						<span>Account ID: {user.id}</span>
						<span>Ngày tạo: {formatDate(user.createdAt)}</span>
					</div>
				</div>
			</UserDialogContent>
		</Dialog>
	);
}

