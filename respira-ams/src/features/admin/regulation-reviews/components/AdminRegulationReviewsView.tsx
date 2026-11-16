"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { RegulationReviewStatsCards } from "./RegulationReviewStatsCards";
import { RegulationReviewSearchBar } from "./RegulationReviewSearchBar";
import { RegulationReviewsTable } from "./RegulationReviewsTable";
import { RegulationReviewFormDialog } from "./RegulationReviewFormDialog";
import { DeleteRegulationReviewDialog } from "./DeleteRegulationReviewDialog";
import {
	CreateRegulationReviewPayload,
	UpdateRegulationReviewPayload,
	RegulationReviewFilters,
	RegulationReviewItem,
	RegulationReviewStats,
} from "../types";
import {
	createRegulationReview,
	deleteRegulationReview,
	fetchRegulationReviews,
	markRecentDeleted,
	saveRecentReviewer,
	toggleReviewerStatus,
	updateRecentReviewer,
	updateRegulationReview,
} from "../api";

export function AdminRegulationReviewsView() {
	const queryClient = useQueryClient();

	const [filters, setFilters] = useState<RegulationReviewFilters>({
		search: "",
		status: "ALL",
	});
	const [debouncedSearch, setDebouncedSearch] = useState("");

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(filters.search.trim());
		}, 180);
		return () => clearTimeout(timer);
	}, [filters.search]);

	const { data, isLoading } = useQuery({
		queryKey: [
			"admin",
			"regulation-reviews",
			{ search: debouncedSearch, status: filters.status },
		],
		queryFn: () =>
			fetchRegulationReviews(1, 50, {
				search: debouncedSearch,
				status: filters.status,
			}),
		staleTime: 30 * 1000,
		gcTime: 5 * 60 * 1000,
		placeholderData: (prev) => prev,
	});

	const items = data?.items || [];
	const stats: RegulationReviewStats = data?.stats || {
		total: 0,
		active: 0,
		inactive: 0,
		emailConfirmed: 0,
	};

	// Dialog states
	const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<RegulationReviewItem | null>(null);
	const [isSubmittingForm, setIsSubmittingForm] = useState(false);

	const [deleteTarget, setDeleteTarget] = useState<RegulationReviewItem | null>(null);
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

	// Tự động reload trang sau khi xác nhận hành động theo yêu cầu người dùng
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

	// Create reviewer (Cập nhật siêu tốc 0ms vào UI, chống độ trễ Redis backend 2 phút)
	const handleCreateReviewer = async (payload: CreateRegulationReviewPayload) => {
		setIsSubmittingForm(true);
		try {
			const newId = await createRegulationReview(payload);
			const newItem: RegulationReviewItem = {
				id: newId || `rev-${Date.now()}`,
				email: payload.email,
				phone: payload.phone,
				role: "MedicalRegulationReviewer",
				status: "Active",
				isEmailConfirmed: false,
				isDeleted: false,
			};

			// Lưu tạm vào session storage để chống bị mất do Redis cache 2 phút của backend
			saveRecentReviewer(newItem);

			// Cập nhật ngay lập tức vào TanStack Query Cache (0ms)
			queryClient.setQueriesData({ queryKey: ["admin", "regulation-reviews"] }, (old: any) => {
				if (!old || !Array.isArray(old.items)) return old;
				const exists = old.items.some(
					(i: RegulationReviewItem) => i.id === newItem.id || i.email.toLowerCase() === newItem.email.toLowerCase()
				);
				if (exists) return old;
				return {
					...old,
					items: [newItem, ...old.items],
					total: (old.total || 0) + 1,
					stats: old.stats
						? {
								...old.stats,
								total: (old.stats.total || 0) + 1,
								active: (old.stats.active || 0) + 1,
						  }
						: old.stats,
				};
			});

			setIsFormDialogOpen(false);
			showNotice(`Đã thêm thành viên ${payload.email} thành công!`, "success");
		} catch (error) {
			console.error("Error creating regulation reviewer:", error);
			const errMsg = error instanceof Error ? error.message : "";
			if (
				errMsg.includes("đã tồn tại") ||
				errMsg.includes("đã được đăng ký") ||
				errMsg.includes("trùng")
			) {
				showNotice(errMsg, "error");
				setIsSubmittingForm(false);
				return;
			}
			showNotice(errMsg || "Thêm thành viên thất bại", "error");
		} finally {
			setIsSubmittingForm(false);
		}
	};

	// Update reviewer
	const handleUpdateReviewer = async (payload: UpdateRegulationReviewPayload) => {
		setIsSubmittingForm(true);
		try {
			await updateRegulationReview(payload);
			setIsFormDialogOpen(false);
			setEditingItem(null);
			triggerReloadWithNotice("Đã cập nhật hồ sơ thành công", "success");
		} catch (error) {
			console.error("Error updating regulation reviewer:", error);
			showNotice(
				error instanceof Error ? error.message : "Cập nhật thành viên thất bại",
				"error"
			);
		} finally {
			setIsSubmittingForm(false);
		}
	};

	// Delete reviewer (Xóa trực tiếp 0ms, không reload)
	const handleConfirmDelete = async (item: RegulationReviewItem) => {
		setIsDeleting(true);
		try {
			await deleteRegulationReview(item.id);
			markRecentDeleted(item.id);

			queryClient.setQueriesData({ queryKey: ["admin", "regulation-reviews"] }, (old: any) => {
				if (!old || !Array.isArray(old.items)) return old;
				return {
					...old,
					items: old.items.filter((i: RegulationReviewItem) => i.id !== item.id),
					total: Math.max(0, (old.total || 1) - 1),
					stats: old.stats
						? {
								...old.stats,
								total: Math.max(0, (old.stats.total || 1) - 1),
								active:
									item.status === "Active"
										? Math.max(0, (old.stats.active || 1) - 1)
										: old.stats.active,
								inactive:
									item.status === "Inactive"
										? Math.max(0, (old.stats.inactive || 1) - 1)
										: old.stats.inactive,
						  }
						: old.stats,
				};
			});

			setIsDeleteOpen(false);
			setDeleteTarget(null);
			showNotice(`Đã xóa tài khoản ${item.email}`, "success");
		} catch (error) {
			console.error("Error deleting regulation reviewer:", error);
			showNotice(error instanceof Error ? error.message : "Xóa thành viên thất bại", "error");
		} finally {
			setIsDeleting(false);
		}
	};

	// Toggle status with Optimistic UI Update (cập nhật trực tiếp 0ms, KHÔNG reload trang)
	const handleToggleStatus = async (item: RegulationReviewItem) => {
		const prevStatus = item.status;
		const nextStatus = prevStatus === "Active" ? "Inactive" : "Active";

		// 1. Cập nhật lạc quan (Optimistic) ngay lập tức trên UI và stats (0ms)
		queryClient.setQueriesData({ queryKey: ["admin", "regulation-reviews"] }, (old: any) => {
			if (!old || !Array.isArray(old.items)) return old;
			return {
				...old,
				items: old.items.map((i: RegulationReviewItem) =>
					i.id === item.id ? { ...i, status: nextStatus } : i
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
			// 2. Gửi request lock / unlock tới Backend
			const updated = await toggleReviewerStatus(item);

			// 3. Cập nhật trực tiếp kết quả chính xác từ Backend vào cache, không reload trang
			queryClient.setQueriesData({ queryKey: ["admin", "regulation-reviews"] }, (old: any) => {
				if (!old || !Array.isArray(old.items)) return old;
				return {
					...old,
					items: old.items.map((i: RegulationReviewItem) =>
						i.id === item.id ? { ...i, status: updated.status } : i
					),
				};
			});

			showNotice(
				`Đã ${updated.status === "Active" ? "mở khóa" : "khóa"} tài khoản ${item.email}`
			);
		} catch (error) {
			console.error("Error toggling status:", error);
			// Rollback lại trạng thái cũ nếu lỗi
			queryClient.setQueriesData({ queryKey: ["admin", "regulation-reviews"] }, (old: any) => {
				if (!old || !Array.isArray(old.items)) return old;
				return {
					...old,
					items: old.items.map((i: RegulationReviewItem) =>
						i.id === item.id ? { ...i, status: prevStatus } : i
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
							<Stethoscope className="w-5 h-5" />
						</div>
						<h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
							Hội đồng thẩm định
						</h1>
					</div>
					<p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
						Quản lý danh sách, hồ sơ và quyền hạn thành viên Hội đồng thẩm định (Medical Regulation Reviewer)
					</p>
				</div>
			</div>

			{/* Stats Cards */}
			<RegulationReviewStatsCards stats={stats} />

			{/* Search, Filter & Actions */}
			<RegulationReviewSearchBar
				filters={filters}
				onFiltersChange={setFilters}
				onOpenCreateDialog={() => {
					setEditingItem(null);
					setIsFormDialogOpen(true);
				}}
				isLoading={isLoading}
			/>

			{/* Regulation Reviews Table */}
			<RegulationReviewsTable
				items={items}
				isLoading={isLoading}
				onEdit={(item) => {
					setEditingItem(item);
					setIsFormDialogOpen(true);
				}}
				onDelete={(item) => {
					setDeleteTarget(item);
					setIsDeleteOpen(true);
				}}
				onToggleStatus={handleToggleStatus}
			/>

			{/* Form Dialog (Create & Edit) */}
			<RegulationReviewFormDialog
				isOpen={isFormDialogOpen}
				onClose={() => {
					setIsFormDialogOpen(false);
					setEditingItem(null);
				}}
				editingItem={editingItem}
				existingItems={items}
				onSubmitCreate={handleCreateReviewer}
				onSubmitUpdate={handleUpdateReviewer}
				isSubmitting={isSubmittingForm}
			/>

			{/* Delete Dialog */}
			<DeleteRegulationReviewDialog
				isOpen={isDeleteOpen}
				onClose={() => {
					setIsDeleteOpen(false);
					setDeleteTarget(null);
				}}
				item={deleteTarget}
				onConfirmDelete={handleConfirmDelete}
				isDeleting={isDeleting}
			/>
		</div>
	);
}
