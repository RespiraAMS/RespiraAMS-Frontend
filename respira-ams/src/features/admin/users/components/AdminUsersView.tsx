"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";
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
	});

	const users = data?.items || [];
	const total = data?.total || 0;
	const stats: UserStats = data?.stats || {
		total: 0,
		doctors: 0,
		managers: 0,
		admins: 0,
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

	const showNotice = (message: string, type: "success" | "error" = "success") => {
		if (type === "success") {
			toast.success(message);
		} else {
			toast.error(message);
		}
	};

	// Create user
	const handleCreateUser = async (payload: CreateUserPayload) => {
		setIsSubmittingForm(true);
		try {
			const result = await createUser(payload);
			setIsFormDialogOpen(false);

			const displayName =
				[payload.lastName, payload.firstName].filter(Boolean).join(" ") || payload.email;
			showNotice(`Đã tạo tài khoản thành công cho ${displayName}`);

			if (!result.emailSent) {
				toast.warning(
					"Tài khoản đã tạo nhưng chưa gửi được email xác thực. Vui lòng kiểm tra cấu hình email của backend."
				);
			}

			if (payload.role === "Manager") {
				toast.info(
					"Tài khoản Quản lý chuyên môn không có hồ sơ bác sĩ nên không hiển thị trong danh sách này."
				);
			}

			await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
			queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
		} catch (error) {
			console.error("Error creating user:", error);
			showNotice(error instanceof Error ? error.message : "Tạo người dùng thất bại", "error");
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
			showNotice(`Đã cập nhật hồ sơ thành công`);
			await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
			queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
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
			showNotice(`Đã xóa mềm người dùng ${user.lastName} ${user.firstName}`);
			await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
			queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
		} catch (error) {
			console.error("Error deleting user:", error);
			showNotice(error instanceof Error ? error.message : "Xóa người dùng thất bại", "error");
		} finally {
			setIsDeleting(false);
		}
	};

	// Toggle status
	const handleToggleStatus = async (user: UserItem) => {
		try {
			const updated = await toggleUserStatus(user.id, user);
			showNotice(
				`Đã ${updated.status === "Active" ? "mở khóa" : "khóa"} tài khoản ${user.lastName} ${user.firstName} (${user.email})`
			);
			await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
			queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
		} catch (error) {
			console.error("Error toggling status:", error);
			showNotice("Không thể thay đổi trạng thái tài khoản", "error");
		}
	};

	return (
		<div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-xl bg-primary/10 dark:bg-primary/10 text-primary">
							<Users className="w-5 h-5" />
						</div>
						<h1 className="text-xl sm:text-2xl font-extrabold text-text-primary dark:text-primary-foreground tracking-tight">
							Quản lý người dùng
						</h1>
					</div>
					<p className="text-xs sm:text-sm text-text-secondary dark:text-text-tertiary mt-1">
						Quản trị danh sách tài khoản y bác sĩ, trưởng khoa và phân quyền hoạt động hệ thống Respira
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

			{filters.role === "Manager" && (
				<div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-xs font-medium text-warning dark:border-warning/30 dark:bg-warning/10 dark:text-warning">
					Tài khoản Quản lý chuyên môn (MedicalRegulationReviewer) không có hồ sơ bác sĩ nên
					không hiển thị trong danh sách này. Sự kiện tạo tài khoản vẫn được ghi nhận trong
					Nhật ký kiểm toán.
				</div>
			)}

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

