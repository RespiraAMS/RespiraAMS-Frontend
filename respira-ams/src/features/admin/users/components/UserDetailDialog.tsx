"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
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
	XCircle,
	AlertCircle,
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
import { fetchAccountConfirmation } from "../api";
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
	// Trạng thái xác nhận tài khoản thực tế từ /api/v1/auth/accounts (sử dụng in-memory cache phản hồi 0ms)
	const accountId = user?.accountId || user?.id;
	const accountEmail = user?.email;
	const { data: authAccount } = useQuery({
		queryKey: ["admin", "auth-account-confirmation", accountId, accountEmail],
		queryFn: () => fetchAccountConfirmation(accountId, accountEmail),
		enabled: isOpen && Boolean(accountId || accountEmail),
		staleTime: 60 * 1000,
		initialData: user ? { isEmailConfirmed: user.isEmailConfirmed, status: user.status } : undefined,
	});

	if (!user) return null;

	const isConfirmed =
		authAccount !== undefined && authAccount !== null
			? Boolean(authAccount.isEmailConfirmed)
			: user.isEmailConfirmed;

	const accountStatus = authAccount?.status
		? (authAccount.status === "Inactive" ? "Inactive" : "Active")
		: user.status;

	// Dữ liệu hồ sơ bác sĩ đã có đầy đủ 100% từ danh sách /api/v1/doctors (28ms)
	const currentDoctor: UserItem = {
		...user,
		status: accountStatus,
		isEmailConfirmed: isConfirmed,
	};

	const initials = `${currentDoctor.lastName[0] || ""}${currentDoctor.firstName[0] || ""}`.toUpperCase();
	const displayName = formatFullNameWithTitle(
		currentDoctor.lastName,
		currentDoctor.firstName,
		currentDoctor.academicTitle,
		currentDoctor.degrees
	);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<UserDialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
						Hồ sơ chi tiết người dùng
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6 pt-3">
					{/* Header banner */}
					<div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50/50 dark:from-slate-950 dark:to-slate-900 border border-sky-100 dark:border-slate-800">
						<Avatar className="h-16 w-16 border-2 border-white shadow-md">
							{currentDoctor.avatarUrl && <AvatarImage src={currentDoctor.avatarUrl} alt={displayName} />}
							<AvatarFallback className="bg-sky-500 text-white font-bold text-lg">
								{initials || "U"}
							</AvatarFallback>
						</Avatar>

						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2 flex-wrap">
								<h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
									{displayName}
								</h3>
								<Badge
									variant="outline"
									className="bg-white/80 dark:bg-slate-800 font-bold text-xs"
								>
									{ROLE_LABELS[currentDoctor.role]}
								</Badge>
							</div>
							<p className="text-xs text-slate-500 mt-0.5">
								{POSITION_LABELS[currentDoctor.position] || currentDoctor.position}
							</p>
							<div className="flex items-center gap-2 mt-2">
								{currentDoctor.status === "Active" ? (
									<span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
										<CheckCircle2 className="w-3 h-3" />
										Đang hoạt động
									</span>
								) : (
									<span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
										<Lock className="w-3 h-3" />
										Đã khóa
									</span>
								)}
								{currentDoctor.isEmailConfirmed ? (
									<span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
										<CheckCircle2 className="w-3 h-3" />
										Email đã xác thực
									</span>
								) : (
									<span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
										<AlertCircle className="w-3 h-3" />
										Tài khoản đang chờ xác nhận
									</span>
								)}
							</div>
						</div>
					</div>

					{/* Information Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
						<div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
							<div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
								<Mail className="w-3.5 h-3.5 text-slate-400" />
								<span>Email đăng nhập</span>
							</div>
							<p className="font-bold text-slate-900 dark:text-white text-sm break-all">
								{currentDoctor.email}
							</p>
						</div>

						<div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
							<div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
								<Phone className="w-3.5 h-3.5 text-slate-400" />
								<span>Số điện thoại</span>
							</div>
							<p className="font-bold text-slate-900 dark:text-white text-sm">
								{currentDoctor.phone || "—"}
							</p>
						</div>

						<div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
							<div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
								<CreditCard className="w-3.5 h-3.5 text-slate-400" />
								<span>Số CCCD / CMND</span>
							</div>
							<p className="font-bold text-slate-900 dark:text-white text-sm">
								{currentDoctor.citizenIdentificationNumber || "—"}
							</p>
						</div>

						<div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
							<div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
								<Calendar className="w-3.5 h-3.5 text-slate-400" />
								<span>Ngày sinh / Giới tính</span>
							</div>
							<p className="font-bold text-slate-900 dark:text-white text-sm">
								{formatDate(currentDoctor.dateOfBirth)} ({currentDoctor.gender === "Male" ? "Nam" : "Nữ"})
							</p>
						</div>

						<div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
							<div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
								<MapPin className="w-3.5 h-3.5 text-slate-400" />
								<span>Địa chỉ nơi cư trú / Khoa phòng</span>
							</div>
							<p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
								{currentDoctor.address || "—"}
							</p>
						</div>

						<div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
							<div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
								<Award className="w-3.5 h-3.5 text-slate-400" />
								<span>Học hàm</span>
							</div>
							<p className="font-bold text-slate-900 dark:text-white text-sm">
								{ACADEMIC_TITLE_LABELS[currentDoctor.academicTitle] || "Không"}
							</p>
						</div>

						<div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
							<div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
								<Award className="w-3.5 h-3.5 text-slate-400" />
								<span>Học vị y khoa</span>
							</div>
							<p className="font-bold text-slate-900 dark:text-white text-sm">
								{formatDegrees(currentDoctor.degrees)}
							</p>
						</div>

						<div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
							<div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
								<Mail className="w-3.5 h-3.5 text-slate-400" />
								<span>Trạng thái xác thực Email</span>
							</div>
							<div className="pt-0.5">
								{currentDoctor.isEmailConfirmed ? (
									<span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
										<CheckCircle2 className="w-3.5 h-3.5" /> Đã xác thực trong cơ sở dữ liệu
									</span>
								) : (
									<div className="space-y-1">
										<span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg">
											<XCircle className="w-3.5 h-3.5" /> Tài khoản đang chờ xác nhận
										</span>
										<p className="text-[11px] text-amber-700 dark:text-amber-300">
											Tài khoản này chưa hoàn tất xác thực qua email. Người dùng cần bấm vào liên kết trong email gửi tới <b>{currentDoctor.email}</b> để xác thực và kích hoạt.
										</p>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Metadata */}
					<div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
						<span>Account ID: {currentDoctor.id}</span>
						<span>Ngày tạo: {formatDate(currentDoctor.createdAt)}</span>
					</div>
				</div>
			</UserDialogContent>
		</Dialog>
	);
}

