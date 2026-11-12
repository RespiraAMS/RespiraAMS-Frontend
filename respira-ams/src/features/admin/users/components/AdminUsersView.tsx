"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Users } from "lucide-react";
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
	INITIAL_USERS,
} from "../api";

export function AdminUsersView() {
	const [users, setUsers] = useState<UserItem[]>(() => INITIAL_USERS.slice(0, 10));
	const [total, setTotal] = useState(() => INITIAL_USERS.length);
	const [stats, setStats] = useState<UserStats>(() => ({
		total: INITIAL_USERS.length,
		doctors: INITIAL_USERS.filter((u) => u.role === "Doctor").length,
		managers: INITIAL_USERS.filter((u) => u.role === "Manager").length,
		admins: INITIAL_USERS.filter((u) => u.role === "Admin").length,
		active: INITIAL_USERS.filter((u) => u.status === "Active").length,
		inactive: INITIAL_USERS.filter((u) => u.status === "Inactive").length,
	}));
	const [isLoading, setIsLoading] = useState(false);

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

	// Dialog states
	const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<UserItem | null>(null);
	const [isSubmittingForm, setIsSubmittingForm] = useState(false);

	const [detailUser, setDetailUser] = useState<UserItem | null>(null);
	const [isDetailOpen, setIsDetailOpen] = useState(false);

	const [deleteTargetUser, setDeleteTargetUser] = useState<UserItem | null>(null);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	// Notification banner
	const [notice, setNotice] = useState<{ message: string; type: "success" | "error" } | null>(
		null
	);

	const showNotice = (message: string, type: "success" | "error" = "success") => {
		setNotice({ message, type });
		setTimeout(() => setNotice(null), 4000);
	};

	const loadData = useCallback(async () => {
		if (users.length === 0) {
			setIsLoading(true);
		}
		try {
			const activeFilters: UserFilters = {
				...filters,
				search: debouncedSearch,
			};
			const res = await fetchUsers(activeFilters);
			setUsers(res.items);
			setTotal(res.total);
			setStats(res.stats);
		} catch (error) {
			console.error("Failed to load users:", error);
			showNotice("Không thể tải danh sách người dùng", "error");
		} finally {
			setIsLoading(false);
		}
	}, [debouncedSearch, filters, users.length]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	// Create user
	const handleCreateUser = async (payload: CreateUserPayload) => {
		setIsSubmittingForm(true);
		try {
			const res = await createUser(payload);
			setIsFormDialogOpen(false);
			showNotice(`Đã tạo tài khoản thành công cho ${payload.lastName} ${payload.firstName}`);
			await loadData();
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
			await loadData();
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
			await loadData();
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
			const updated = await toggleUserStatus(user.id);
			showNotice(
				`Đã ${updated.status === "Active" ? "kích hoạt" : "khóa"} tài khoản ${user.email}`
			);
			await loadData();
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
						<div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-[#0EA5E9]">
							<Users className="w-5 h-5" />
						</div>
						<h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
							Quản lý người dùng
						</h1>
					</div>
					<p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
						Quản trị danh sách tài khoản y bác sĩ, trưởng khoa và phân quyền hoạt động hệ thống Respira
					</p>
				</div>
			</div>

			{/* Notice banner */}
			{notice && (
				<div
					className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200 ${
						notice.type === "success"
							? "bg-emerald-50 border-emerald-200 text-emerald-800"
							: "bg-red-50 border-red-200 text-red-800"
					}`}
				>
					<span>{notice.message}</span>
					<button
						type="button"
						onClick={() => setNotice(null)}
						className="text-xs opacity-70 hover:opacity-100"
					>
						&times;
					</button>
				</div>
			)}

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
				onRefresh={loadData}
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

