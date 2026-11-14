"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { ClinicalMetricItem } from "@/features/manager/clinical-metrics/types";
import { ProtocolStatsCards } from "./ProtocolStatsCards";
import { ProtocolToolbar } from "./ProtocolToolbar";
import { ProtocolsTable } from "./ProtocolsTable";
import { ProtocolPagination } from "./ProtocolPagination";
import { ProtocolFormDialog } from "./ProtocolFormDialog";
import { ProtocolDetailDialog } from "./ProtocolDetailDialog";
import { DeleteProtocolDialog } from "./DeleteProtocolDialog";
import { useProtocolsList, useProtocolMutations } from "../queries";
import { ProtocolFilter, ProtocolFormValues, filterToIsApplied } from "../types";

const PAGE_SIZE = 10;

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định";
}

export function AdminProtocolsView() {
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [filter, setFilter] = useState<ProtocolFilter>("ALL");
	const [page, setPage] = useState(1);

	const [formOpen, setFormOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<ClinicalMetricItem | null>(null);
	const [detailItem, setDetailItem] = useState<ClinicalMetricItem | null>(null);
	const [deleteItem, setDeleteItem] = useState<ClinicalMetricItem | null>(null);
	const [togglingId, setTogglingId] = useState<string | null>(null);

	// Debounce ô tìm kiếm nhanh gọn (180ms) phản hồi tức thì
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search.trim());
			setPage(1);
		}, 180);
		return () => clearTimeout(timer);
	}, [search]);

	const isApplied = filterToIsApplied(filter);
	// BE validator yêu cầu SearchTerm có ít nhất 2 ký tự trên endpoint /search.
	// Nếu < 2 ký tự, không gửi search lên BE để tránh lỗi 400 Bad Request.
	const effectiveSearch = debouncedSearch.length >= 2 ? debouncedSearch : undefined;
	const { data, isLoading, isFetching, isError, error, refetch } = useProtocolsList(
		page,
		PAGE_SIZE,
		effectiveSearch,
		isApplied
	);
	const { createMutation, updateMutation, deleteMutation } = useProtocolMutations();

	// Endpoint /search của BE chỉ nhận SearchTerm nên lọc trạng thái phía client khi đang tìm kiếm.
	// Nếu người dùng chỉ gõ 1 ký tự, lọc tạm phía client trên danh sách hiện có để phản hồi tức thì mà không báo lỗi.
	const items = useMemo(() => {
		let list = data?.items ?? [];
		if (debouncedSearch && debouncedSearch.length === 1) {
			const s = debouncedSearch.toLowerCase();
			list = list.filter((i) =>
				i.name?.toLowerCase().includes(s) ||
				i.description?.toLowerCase().includes(s) ||
				i.publisher?.toLowerCase().includes(s)
			);
		}
		if (debouncedSearch && isApplied !== null) {
			return list.filter((i) => i.isApplied === isApplied);
		}
		return list;
	}, [data, debouncedSearch, isApplied]);

	const metadata = data?.metadata;

	const openCreate = () => {
		setEditingItem(null);
		setFormOpen(true);
	};

	const openEdit = (item: ClinicalMetricItem) => {
		setEditingItem(item);
		setFormOpen(true);
	};

	const closeForm = () => {
		setFormOpen(false);
		setEditingItem(null);
	};

	const handleSubmit = (values: ProtocolFormValues) => {
		if (editingItem) {
			updateMutation.mutate(
				{
					id: editingItem.id,
					data: {
						name: values.name,
						description: values.description,
						version: values.version,
						publisher: values.publisher,
						isApplied: values.isApplied,
					},
				},
				{
					onSuccess: () => {
						closeForm();
						toast.success(`Đã cập nhật phác đồ "${values.name}"`);
					},
					onError: (e) => toast.error(`Cập nhật thất bại: ${errorMessage(e)}`),
				}
			);
		} else {
			createMutation.mutate(
				{
					name: values.name,
					code: values.code,
					description: values.description,
					version: values.version,
					publisher: values.publisher,
				},
				{
					onSuccess: () => {
						closeForm();
						toast.success(`Đã tạo phác đồ "${values.name}"`);
					},
					onError: (e) => toast.error(`Tạo phác đồ thất bại: ${errorMessage(e)}`),
				}
			);
		}
	};

	const handleToggleApplied = (item: ClinicalMetricItem) => {
		setTogglingId(item.id);
		updateMutation.mutate(
			{
				id: item.id,
				data: {
					name: item.name,
					description: item.description,
					version: item.version,
					publisher: item.publisher,
					isApplied: !item.isApplied,
				},
			},
			{
				onSuccess: () =>
					toast.success(
						item.isApplied
							? `Đã ngừng áp dụng "${item.name}"`
							: `Đã áp dụng "${item.name}"`
					),
				onError: (e) => toast.error(`Đổi trạng thái thất bại: ${errorMessage(e)}`),
				onSettled: () => setTogglingId(null),
			}
		);
	};

	const handleConfirmDelete = (item: ClinicalMetricItem) => {
		deleteMutation.mutate(item.id, {
			onSuccess: () => {
				setDeleteItem(null);
				toast.success(`Đã xóa mềm phác đồ "${item.name}"`);
				if (items.length === 1 && page > 1) setPage(page - 1);
			},
			onError: (e) => toast.error(`Xóa thất bại: ${errorMessage(e)}`),
		});
	};

	return (
		<div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
			<div>
				<div className="flex items-center gap-2">
					<div className="p-2 rounded-xl bg-primary/10 text-primary">
						<FileText className="w-5 h-5" />
					</div>
					<h1 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
						Phác đồ &amp; Phiên bản
					</h1>
				</div>
				<p className="text-xs sm:text-sm text-text-secondary mt-1">
					Quản lý các phác đồ / thang điểm lâm sàng, phiên bản ban hành và trạng thái áp dụng trong hệ thống Respira
				</p>
			</div>

			<ProtocolStatsCards />

			<ProtocolToolbar
				search={search}
				onSearchChange={setSearch}
				filter={filter}
				onFilterChange={(f) => {
					setFilter(f);
					setPage(1);
				}}
				onCreate={openCreate}
			/>

			{isError ? (
				<div className="bg-error/10 border border-error/30 rounded-xl p-6 text-center">
					<p className="text-sm font-bold text-error">Không thể tải danh sách phác đồ</p>
					<p className="text-xs text-error mt-1">{errorMessage(error)}</p>
				</div>
			) : (
				<ProtocolsTable
					items={items}
					isLoading={isLoading}
					togglingId={togglingId}
					onView={setDetailItem}
					onEdit={openEdit}
					onDelete={setDeleteItem}
					onToggleApplied={handleToggleApplied}
				/>
			)}

			<ProtocolPagination
				page={page}
				pageCount={metadata?.pageCount ?? 1}
				totalItems={metadata?.totalItemCount ?? 0}
				pageSize={PAGE_SIZE}
				onPageChange={setPage}
			/>

			<ProtocolFormDialog
				open={formOpen}
				editingItem={editingItem}
				isSubmitting={createMutation.isPending || updateMutation.isPending}
				onClose={closeForm}
				onSubmit={handleSubmit}
			/>

			<ProtocolDetailDialog
				item={detailItem}
				open={!!detailItem}
				onClose={() => setDetailItem(null)}
			/>

			<DeleteProtocolDialog
				item={deleteItem}
				isDeleting={deleteMutation.isPending}
				onClose={() => setDeleteItem(null)}
				onConfirm={handleConfirmDelete}
			/>
		</div>
	);
}

