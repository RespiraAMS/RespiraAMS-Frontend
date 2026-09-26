"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit, Trash } from "lucide-react";
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
import { MOCK_ANTIBIOTIC_SPECTRA, type AntibioticSpectrumItem } from "../types";

const PAGE_SIZE = 5;

interface AntibioticSpectraTableProps {
	onEdit: (item: AntibioticSpectrumItem) => void;
	onDelete: (item: AntibioticSpectrumItem) => void;
}

export function AntibioticSpectraTable({
	onEdit,
	onDelete,
}: AntibioticSpectraTableProps) {
	const [page, setPage] = useState(1);
	const searchName = useSearchStore((s) => s.value);
	const clearSearch = useSearchStore((s) => s.clear);

	useEffect(() => {
		clearSearch();
	}, [clearSearch]);

	useEffect(() => {
		setPage(1);
	}, [searchName]);

	const filtered = useMemo(
		() =>
			MOCK_ANTIBIOTIC_SPECTRA.filter((s) =>
				searchName
					? s.name.toLowerCase().includes(searchName.toLowerCase())
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
						<TableHead className="w-[240px]">Tên phổ kháng sinh</TableHead>
						<TableHead>Mô tả</TableHead>
						<TableHead className="w-[120px]">Thao tác</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{items.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={3}
								className="text-center text-muted-foreground py-10"
							>
								Không tìm thấy phổ kháng sinh nào.
							</TableCell>
						</TableRow>
					) : (
						items.map((spectrum) => (
							<TableRow key={spectrum.id}>
								<TableCell className="font-medium align-middle">
									<span className="text-primary">{spectrum.name}</span>
								</TableCell>
								<TableCell className="align-middle whitespace-normal">
									<span className="text-foreground">{spectrum.description}</span>
								</TableCell>
								<TableCell className="align-middle">
									<div className="flex gap-1">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onEdit(spectrum)}
											id={`edit-spectrum-${spectrum.id}`}
											aria-label={`Sửa ${spectrum.name}`}
										>
											<Edit className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onDelete(spectrum)}
											id={`delete-spectrum-${spectrum.id}`}
											aria-label={`Xóa ${spectrum.name}`}
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

			<Pagination className="mt-4">
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							className={
								page > 1 ? "cursor-pointer" : "pointer-events-none opacity-50"
							}
							onClick={() => setPage((p) => p - 1)}
						/>
					</PaginationItem>
					<span className="text-sm text-muted-foreground px-2">
						Trang {page} / {totalPages}
					</span>
					<PaginationItem>
						<PaginationNext
							className={
								page < totalPages
									? "cursor-pointer"
									: "pointer-events-none opacity-50"
							}
							onClick={() => setPage((p) => p + 1)}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</>
	);
}
