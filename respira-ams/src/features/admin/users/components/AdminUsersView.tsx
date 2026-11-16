"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { UserStatsCards } from "./UserStatsCards";
import { UserSearchBar } from "./UserSearchBar";
import { UsersTable } from "./UsersTable";
import { UserFormDialog } from "./UserFormDialog";
import { UserDetailDialog } from "./UserDetailDialog";
import { DeleteUserDialog } from "./DeleteUserDialog";
import {
	CreateUserPayload,
	UpdateUserPayload,
	UserFilters,
	UserItem,
	UserStats,
	UserStatus,
} from "../types";
import {
	createUser,
	deleteUser,
	fetchUsers,
	toggleUserStatus,
	updateUser,
} from "../api";

export function AdminUsersView() {
	const queryClient = useQueryClient();

	const [filters, setFilters] = useState<UserFilters>({
		search: "",
		role: "ALL",
		status: "ALL",
	});
	const [debouncedSearch, setDebouncedSearch] = useState("");

	// Debounce tìm kiếm 180ms phản hồi mượt mà không chớp giật
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(filters.search.trim());
		}, 180);
		return () => clearTimeout(timer);
	}, [filters.search]);

	const {
		data,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: [
			"admin",
			"users",
			{ search: debouncedSearch, role: filters.role, status: filters.status },
		],
		queryFn: () =>
			fetchUsers({
				search: debouncedSearch,
				role: filters.role,
				status: filters.status,
			}),
		staleTime: 30 * 1000,
		gcTime: 5 * 60 * 1000,
		placeholderData: (prev) => prev,
	});

	const users = data?.items || [];
	const total = data?.total || 0;
	const stats: UserStats = data?.stats || {
		total: 0,
		doctors: 0,
		headDoctors: 0,
		active: 0,
		inactive: 0,
	};

	// Dialog states
	const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<UserItem | null>(null);
	const [isSubmittingForm, setIsSubmittingForm] = useState(false);

	const [detailUser, setDetailUser] = useState<UserItem | null>(null);
	const [isDetailOpen, setIsDetailOpen] = useState(false);

	const [deleteTargetUser, setDeleteTargetUser] = useState<UserItem | null>(null);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const showNotice = (
		message: string,
		type: "success" | "error" | "info" = "success"
	) => {
		if (type === "success") {
			toast.success(message);
		} else if (type === "info") {
			toast.info(message);
		} else {
			toast.error(message);
		}
	};

	// Tự động kiểm tra và hiển thị thông báo flash sau khi trang tự động reload
	useEffect(() => {
		if (typeof window !== "undefined") {
			try {
				const flash = sessionStorage.getItem("respira_admin_flash_notice");
				if (flash) {
					const { message, type } = JSON.parse(flash);
					showNotice(message, type);
					sessionStorage.removeItem("respira_admin_flash_notice");
				}
			} catch {}
		}
	}, []);

	// Tự động reload trang sau khi xác nhận hành động theo yêu cầu
	const triggerReloadWithNotice = (
		message: string,
		type: "success" | "error" | "info" = "success"
	) => {
		if (typeof window !== "undefined") {
			try {
				sessionStorage.setItem(
					"respira_admin_flash_notice",
					JSON.stringify({ message, type })
				);
			} catch {}
			window.location.reload();
		}
	};

	// Create user
	const handleCreateUser = async (payload: CreateUserPayload) => {
		setIsSubmittingForm(true);
		try {
			await createUser(payload);
			setIsFormDialogOpen(false);
			triggerReloadWithNotice("Tài khoản đang chờ xác nhận", "info");
		} catch (error) {
			console.error("Error creating user:", error);
			const errMsg = error instanceof Error ? error.message : "";
			// Nếu phát hiện trùng lặp dữ liệu trong DB (Saga rollback), báo lỗi trùng để người dùng sửa lại
			if (
				errMsg.includes("đã tồn tại") ||
				errMsg.includes("đã được đăng ký") ||
				errMsg.includes("trùng")
			) {
				showNotice(errMsg, "error");
				setIsSubmittingForm(false);
				return;
			}
			showNotice(errMsg || "Thêm người dùng thất bại", "error");
		} finally {
			setIsSubmittingForm(false);
		}
	};

	// Update user
	const handleUpdateUser = async (payload: UpdateUserPayload) => {
		setIsSubmittingForm(true);
		try {
			await updateUser(payload);
			setIsFormDialogOpen(false);
			setEditingUser(null);
			triggerReloadWithNotice("Đã cập nhật hồ sơ thành công", "success");
		} catch (error) {
			console.error("Error updating user:", error);
			showNotice(error instanceof Error ? error.message : "Cập nhật người dùng thất bại", "error");
		} finally {
			setIsSubmittingForm(false);
		}
	};

	// Delete user
	const handleConfirmDelete = async (user: UserItem) => {
		setIsDeleting(true);
		try {
			await deleteUser(user.id, user.doctorId, user.mediaId);
			setIsDeleteOpen(false);
			setDeleteTargetUser(null);
			triggerReloadWithNotice(`Đã xóa bác sĩ ${user.lastName} ${user.firstName}`, "success");
		} catch (error) {
			console.error("Error deleting user:", error);
			showNotice(error instanceof Error ? error.message : "Xóa bác sĩ thất bại", "error");
		} finally {
			setIsDeleting(false);
		}
	};

	// Toggle status with Optimistic UI Update (cập nhật trực tiếp cực nhanh 0ms, KHÔNG reload trang)
	const handleToggleStatus = async (user: UserItem) => {
		const prevStatus = user.status;
		const nextStatus: UserStatus = prevStatus === "Active" ? "Inactive" : "Active";

		// 1. Cập nhật lạc quan (Optimistic) ngay lập tức trên UI và thẻ thống kê (0ms)
		queryClient.setQueriesData({ queryKey: ["admin", "users"] }, (old: any) => {
			if (!old || !Array.isArray(old.items)) return old;
			return {
				...old,
				items: old.items.map((item: UserItem) =>
					item.id === user.id || (user.doctorId && item.doctorId === user.doctorId)
						? { ...item, status: nextStatus }
						: item
				),
				stats: old.stats
					? {
							...old.stats,
							active:
								nextStatus === "Active"
									? old.stats.active + 1
									: Math.max(0, old.stats.active - 1),
							inactive:
								nextStatus === "Inactive"
									? old.stats.inactive + 1
									: Math.max(0, old.stats.inactive - 1),
					  }
					: old.stats,
			};
		});

		try {
			// 2. Gửi request lock / unlock tới Backend (~20ms)
			const updated = await toggleUserStatus(user.id, user);

			// 3. Cập nhật trực tiếp kết quả chính xác từ Backend vào cache, không cần reload trang
			queryClient.setQueriesData({ queryKey: ["admin", "users"] }, (old: any) => {
				if (!old || !Array.isArray(old.items)) return old;
				return {
					...old,
					items: old.items.map((item: UserItem) =>
						item.id === user.id || (user.doctorId && item.doctorId === user.doctorId)
							? { ...item, status: updated.status, isEmailConfirmed: updated.isEmailConfirmed }
							: item
					),
				};
			});

			showNotice(
				`Đã ${updated.status === "Active" ? "mở khóa" : "khóa"} tài khoản ${user.lastName} ${user.firstName} (${user.email})`
			);
		} catch (error) {
			console.error("Error toggling status:", error);
			// Rollback lại trạng thái cũ nếu xảy ra lỗi mạng
			queryClient.setQueriesData({ queryKey: ["admin", "users"] }, (old: any) => {
				if (!old || !Array.isArray(old.items)) return old;
				return {
					...old,
					items: old.items.map((item: UserItem) =>
						item.id === user.id || (user.doctorId && item.doctorId === user.doctorId)
							? { ...item, status: prevStatus }
							: item
					),
					stats: old.stats
						? {
								...old.stats,
								active:
									prevStatus === "Active"
										? old.stats.active + 1
										: Math.max(0, old.stats.active - 1),
								inactive:
									prevStatus === "Inactive"
										? old.stats.inactive + 1
										: Math.max(0, old.stats.inactive - 1),
						  }
						: old.stats,
				};
			});
			showNotice(
				error instanceof Error ? error.message : "Không thể thay đổi trạng thái tài khoản",
				"error"
			);
		}
	};

	return (
		<div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
			{/* Page Header (UC-22: Manage Doctor) */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-[#0EA5E9]">
							<Stethoscope className="w-5 h-5" />
						</div>
						<h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
							Quản lý Bác sĩ
						</h1>
					</div>
					<p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
						Quản trị danh sách hồ sơ Bác sĩ điều trị và Bác sĩ Trưởng khoa (Doctor & HeadDepartmentDoctor)
					</p>
				</div>
			</div>

			{/* Stats Cards */}
			<UserStatsCards stats={stats} />

			{/* Search, Filter & Actions */}
			<UserSearchBar
				filters={filters}
				onFiltersChange={setFilters}
				onOpenCreateDialog={() => {
					setEditingUser(null);
					setIsFormDialogOpen(true);
				}}
				isLoading={isLoading}
			/>

			{/* Users Table */}
			<UsersTable
				users={users}
				isLoading={isLoading}
				onViewUser={(user) => {
					setDetailUser(user);
					setIsDetailOpen(true);
				}}
				onEditUser={(user) => {
					setEditingUser(user);
					setIsFormDialogOpen(true);
				}}
				onDeleteUser={(user) => {
					setDeleteTargetUser(user);
					setIsDeleteOpen(true);
				}}
				onToggleStatus={handleToggleStatus}
			/>

			{/* Dialogs */}
			<UserFormDialog
				isOpen={isFormDialogOpen}
				onClose={() => {
					setIsFormDialogOpen(false);
					setEditingUser(null);
				}}
				editingUser={editingUser}
				onSubmitCreate={handleCreateUser}
				onSubmitUpdate={handleUpdateUser}
				isSubmitting={isSubmittingForm}
			/>

			<UserDetailDialog
				user={detailUser}
				isOpen={isDetailOpen}
				onClose={() => {
					setIsDetailOpen(false);
					setDetailUser(null);
				}}
			/>

			<DeleteUserDialog
				user={deleteTargetUser}
				isOpen={isDeleteOpen}
				onClose={() => {
					setIsDeleteOpen(false);
					setDeleteTargetUser(null);
				}}
				onConfirmDelete={handleConfirmDelete}
				isDeleting={isDeleting}
			/>
		</div>
	);
}

