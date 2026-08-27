"use client";

import { useState } from "react";
import { Trash } from "lucide-react";
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
import { MOCK_DOCTORS, getInitials, type DoctorItem } from "../types";

const PAGE_SIZE = 3;

interface DoctorsTableProps {
	onDelete: (doctor: DoctorItem) => void;
}

export function DoctorsTable({ onDelete }: DoctorsTableProps) {
	const [page, setPage] = useState(1);

	const totalPages = Math.ceil(MOCK_DOCTORS.length / PAGE_SIZE);
	const startIdx = (page - 1) * PAGE_SIZE;
	const items = MOCK_DOCTORS.slice(startIdx, startIdx + PAGE_SIZE);
	const hasPrevious = page > 1;
	const hasNext = page < totalPages;

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Hồ sơ Bác sĩ</TableHead>
						<TableHead>Thông tin liên hệ</TableHead>
						<TableHead>Chức vụ / Học hàm</TableHead>
						<TableHead>Giới tính</TableHead>
						<TableHead>Thao tác</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{items.map((doc) => (
						<TableRow key={doc.id}>
							{/* Avatar + Tên */}
							<TableCell className="font-medium align-middle">
								<div className="flex items-center gap-3">
									<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border shrink-0">
										{doc.mediaUrl ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img
												src={doc.mediaUrl}
												alt="Avatar"
												className="h-full w-full object-cover"
											/>
										) : (
											<span className="text-sm">
												{getInitials(doc.firstName, doc.lastName)}
											</span>
										)}
									</div>
									<span className="text-primary shrink-0">
										{doc.firstName} {doc.lastName}
									</span>
								</div>
							</TableCell>

							{/* Contact */}
							<TableCell className="align-middle">
								<div>{doc.email}</div>
								<div className="mt-0.5 text-muted-foreground text-xs">
									{doc.phoneNumber}
								</div>
							</TableCell>

							{/* Position / Title */}
							<TableCell className="align-middle">
								<div className="text-sm font-medium text-zinc-800">
									{doc.position || "N/A"}
								</div>
								<div className="text-xs text-zinc-500 mt-0.5">
									{doc.academicTitle || "No title"}
								</div>
							</TableCell>

							{/* Gender */}
							<TableCell className="align-middle">
								<span
									className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
										doc.gender
											? "bg-blue-100 text-blue-800"
											: "bg-pink-100 text-pink-800"
									}`}
								>
									{doc.gender ? "Nam" : "Nữ"}
								</span>
							</TableCell>

							{/* Actions */}
							<TableCell className="flex gap-2 align-middle">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => onDelete(doc)}
									id={`delete-doctor-${doc.id}`}
									aria-label={`Xóa bác sĩ ${doc.firstName} ${doc.lastName}`}
								>
									<Trash className="text-destructive h-4 w-4" />
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			{/* Pagination */}
			<Pagination className="mt-4">
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							className={
								hasPrevious ? "cursor-pointer" : "pointer-events-none opacity-50"
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
								hasNext ? "cursor-pointer" : "pointer-events-none opacity-50"
							}
							onClick={() => setPage((p) => p + 1)}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</>
	);
}
