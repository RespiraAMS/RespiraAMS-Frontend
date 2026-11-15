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

type UsersQueryData = {
	items: UserItem[];
	total: number;
	stats: UserStats;
};

function applyUserStatsDelta(stats: UserStats, user: UserItem, direction: 1 | -1): UserStats {
	return {
		total: stats.total + direction,
		doctors: stats.doctors + direction * (user.role === "Doctor" ? 1 : 0),
		managers:
			stats.managers +
			direction * (user.role === "Manager" || user.role === "HeadDepartmentDoctor" ? 1 : 0),
		admins: stats.admins + direction * (user.role === "Admin" ? 1 : 0),
		active: stats.active + direction * (user.status === "Active" ? 1 : 0),
		inactive: stats.inactive + direction * (user.status === "Inactive" ? 1 : 0),
	};
}

function matchesUserFilters(
	user: UserItem,
	filters: UserFilters,
	search: string
): boolean {
	if (filters.role !== "ALL" && user.role !== filters.role) return false;
	if (filters.status !== "ALL" && user.status !== filters.status) return false;

	const q = search.trim().toLowerCase();
	if (!q) return true;

	return (
		user.email.toLowerCase().includes(q) ||
		user.phone.toLowerCase().includes(q) ||
		`${user.lastName} ${user.firstName}`.toLowerCase().includes(q) ||
		user.citizenIdentificationNumber.toLowerCase().includes(q) ||
		user.address.toLowerCase().includes(q)
	);
}

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

	const usersQueryKey = [
		"admin",
		"users",
		{ search: debouncedSearch, role: filters.role, status: filters.status },
	] as const;

	const {
		data,
		isLoading,
	} = useQuery({
		queryKey: usersQueryKey,
		queryFn: () =>
			fetchUsers({
				search: debouncedSearch,
				role: filters.role,
				status: filters.status,
			}),
	});

	const users = data?.items || [];
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

	const updateUsersCache = (updater: (current: UsersQueryData) => UsersQueryData) => {
		queryClient.setQueryData<UsersQueryData>(usersQueryKey, (current) =>
			current ? updater(current) : current
		);
	};

	// Account list của backend được cache 2 phút; hẹn đồng bộ lại sau khi cache hết hạn
	// để không ghi đè các cập nhật lạc quan bằng dữ liệu cũ.
	const refreshUsersAfterCacheTtl = () => {
		if (typeof window === "undefined") return;
		window.setTimeout(() => {
			void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
		}, 125_000);
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

			if (result.user && matchesUserFilters(result.user, filters, debouncedSearch)) {
				updateUsersCache((current) => {
					if (current.items.some((u) => u.id === result.user!.id)) return current;
					return {
						items: [result.user!, ...current.items],
						total: current.total + 1,
						stats: applyUserStatsDelta(current.stats, result.user!, 1),
					};
				});
			}

			refreshUsersAfterCacheTtl();
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
			const result = await updateUser(payload);
			setIsFormDialogOpen(false);
			setEditingUser(null);
			showNotice(`Đã cập nhật hồ sơ thành công`);

			updateUsersCache((current) => {
				const previous = current.items.find((u) => u.id === result.user.id);
				if (!previous) return current;

				const items = current.items.map((u) => (u.id === result.user.id ? result.user : u));
				const stats = applyUserStatsDelta(
					applyUserStatsDelta(current.stats, previous, -1),
					result.user,
					1
				);
				return { ...current, items, stats };
			});

			refreshUsersAfterCacheTtl();
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
			showNotice(`Đã xóa người dùng ${user.lastName} ${user.firstName}`);

			updateUsersCache((current) => {
				const removed = current.items.find((u) => u.id === user.id);
				if (!removed) return current;
				return {
					items: current.items.filter((u) => u.id !== user.id),
					total: Math.max(0, current.total - 1),
					stats: applyUserStatsDelta(current.stats, removed, -1),
				};
			});

			refreshUsersAfterCacheTtl();
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

			updateUsersCache((current) => {
				const previous = current.items.find((u) => u.id === updated.id);
				if (!previous) return current;

				const items = current.items.map((u) => (u.id === updated.id ? updated : u));
				const stats = applyUserStatsDelta(
					applyUserStatsDelta(current.stats, previous, -1),
					updated,
					1
				);
				return { ...current, items, stats };
			});

			refreshUsersAfterCacheTtl();
			queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
		} catch (error) {
			console.error("Error toggling status:", error);
			showNotice(
				error instanceof Error ? error.message : "Không thể thay đổi trạng thái tài khoản",
				"error"
			);
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
						Quản trị danh sách tài khoản y bác sĩ, trưởng khoa, quản lý chuyên môn và phân quyền hoạt động hệ thống Respira
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

