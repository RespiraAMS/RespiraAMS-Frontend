"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit, Eye, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { useSearchStore } from "@/features/manager/stores/searchStore";
import { MOCK_DISEASES, type DiseaseItem } from "../types";

const PAGE_SIZE = 5;

// ─── Props ────────────────────────────────────────────────────────────────────

interface DiseasesTableProps {
	onView: (item: DiseaseItem) => void;
	onEdit: (item: DiseaseItem) => void;
	onDelete: (item: DiseaseItem) => void;
}

// ─── DiseasesTable ────────────────────────────────────────────────────────────

export function DiseasesTable({ onView, onEdit, onDelete }: DiseasesTableProps) {
	const [page, setPage] = useState(1);

	const searchName = useSearchStore((s) => s.value);
	const clearSearch = useSearchStore((s) => s.clear);

	useEffect(() => { clearSearch(); }, [clearSearch]);
	useEffect(() => { setPage(1); }, [searchName]);

	const filtered = useMemo(
		() =>
			MOCK_DISEASES.filter((item) =>
				searchName
					? item.name.toLowerCase().includes(searchName.toLowerCase())
					: true
			),
		[searchName]
	);

	const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[260px]">Tên bệnh</TableHead>
						<TableHead>Mô tả</TableHead>
						<TableHead className="w-[80px] text-center">Tiêu chí ICU chính</TableHead>
						<TableHead className="w-[80px] text-center">Tiêu chí ICU phụ</TableHead>
						<TableHead className="w-[140px] text-right">Thao tác</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{items.length === 0 ? (
						<TableRow>
							<TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
								Không tìm thấy bệnh nào.
							</TableCell>
						</TableRow>
					) : (
						items.map((item) => (
							<TableRow key={item.id}>
								<TableCell className="font-medium align-middle">
									<span className="text-primary">{item.name}</span>
								</TableCell>
								<TableCell className="align-middle">
									<span className="text-foreground whitespace-normal line-clamp-2">
										{item.description}
									</span>
								</TableCell>
								<TableCell className="text-center align-middle">
									<span className="inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 min-w-[28px]">
										{item.requiredIcuMainCriteria}
									</span>
								</TableCell>
								<TableCell className="text-center align-middle">
									<span className="inline-flex items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 min-w-[28px]">
										{item.requiredIcuSecondaryCriteria}
									</span>
								</TableCell>
								<TableCell className="text-right">
									<div className="flex items-center justify-end gap-1">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onView(item)}
											id={`view-disease-${item.id}`}
											title="Xem chi tiết"
										>
											<Eye className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onEdit(item)}
											id={`edit-disease-${item.id}`}
											title="Chỉnh sửa"
										>
											<Edit className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onDelete(item)}
											id={`delete-disease-${item.id}`}
											title="Xóa"
										>
											<Trash className="h-4 w-4 text-destructive" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>

			{/* Pagination */}
			<Pagination className="mt-4">
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							className={page <= 1 ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}
							id="diseases-prev-page"
						/>
					</PaginationItem>

					<span className="text-sm text-muted-foreground px-4">
						Trang {page} / {totalPages}
					</span>

					<PaginationItem>
						<PaginationNext
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							className={page >= totalPages ? "pointer-events-none opacity-50 cursor-not-allowed" : "cursor-pointer"}
							id="diseases-next-page"
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</>
	);
}
