"use client";

import { MoreVertical, Eye, Edit, Trash2, CheckCircle2, PauseCircle, Loader2 } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClinicalMetricItem } from "@/features/manager/clinical-metrics/types";

interface ProtocolsTableProps {
	items: ClinicalMetricItem[];
	isLoading: boolean;
	togglingId: string | null;
	onView: (item: ClinicalMetricItem) => void;
	onEdit: (item: ClinicalMetricItem) => void;
	onDelete: (item: ClinicalMetricItem) => void;
	onToggleApplied: (item: ClinicalMetricItem) => void;
}

const HEAD = "font-bold text-xs uppercase tracking-wider text-slate-600 py-3.5";

export function ProtocolsTable({
	items,
	isLoading,
	togglingId,
	onView,
	onEdit,
	onDelete,
	onToggleApplied,
}: ProtocolsTableProps) {
	// Chỉ hiện spinner toàn màn hình khi chưa có dữ liệu nào
	if (isLoading && items.length === 0) {
		return (
			<div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
				<div className="inline-block w-8 h-8 border-2 border-slate-200 border-t-[#0EA5E9] rounded-full animate-spin mb-3" />
				<p className="text-sm font-medium text-slate-500">Đang tải danh sách phác đồ...</p>
			</div>
		);
	}

	if (items.length === 0 && !isLoading) {
		return (
			<div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
				<h3 className="text-sm font-bold text-slate-800">Không tìm thấy phác đồ nào</h3>
				<p className="text-xs text-slate-500 mt-1">
					Thử đổi từ khóa tìm kiếm, bộ lọc trạng thái hoặc thêm phác đồ mới.
				</p>
			</div>
		);
	}

	return (
		<div className="relative bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
			{/* Loading bar mảnh chạy ngầm khi tìm kiếm, không làm giật bảng */}
			{isLoading && (
				<div className="absolute top-0 left-0 right-0 h-0.5 bg-sky-100 overflow-hidden z-10">
					<div className="w-full h-full bg-[#0EA5E9] animate-pulse" />
				</div>
			)}
			<Table className={`transition-opacity duration-150 ${isLoading ? "opacity-60" : "opacity-100"}`}>
				<TableHeader className="bg-slate-50/80">
					<TableRow className="border-b border-slate-200 hover:bg-transparent">
						<TableHead className={`w-[260px] ${HEAD}`}>Phác đồ</TableHead>
						<TableHead className={HEAD}>Phiên bản</TableHead>
						<TableHead className={HEAD}>Đơn vị ban hành</TableHead>
						<TableHead className={HEAD}>Mô tả</TableHead>
						<TableHead className={HEAD}>Trạng thái</TableHead>
						<TableHead className={`w-[60px] text-right ${HEAD}`}>Thao tác</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{items.map((item) => {
						const toggling = togglingId === item.id;
						return (
							<TableRow
								key={item.id}
								className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors"
							>
								<TableCell className="py-3">
									<div className="font-bold text-sm text-slate-900">{item.name}</div>
									<div className="text-[11px] font-mono text-slate-400">{item.code}</div>
								</TableCell>

								<TableCell className="py-3">
									<Badge variant="info" className="font-bold">
										v{item.version.replace(/^v/i, "")}
									</Badge>
								</TableCell>

								<TableCell className="py-3 text-xs text-slate-700">{item.publisher}</TableCell>

								<TableCell className="py-3 max-w-[280px]">
									<p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
								</TableCell>

								<TableCell className="py-3">
									<button
										type="button"
										disabled={toggling}
										onClick={() => onToggleApplied(item)}
										title={item.isApplied ? "Bấm để ngừng áp dụng" : "Bấm để áp dụng"}
										className="cursor-pointer disabled:opacity-60"
									>
										{item.isApplied ? (
											<Badge variant="success" className="font-bold gap-1 text-[11px]">
												{toggling ? (
													<Loader2 className="w-3 h-3 animate-spin" />
												) : (
													<CheckCircle2 className="w-3 h-3" />
												)}
												Đang áp dụng
											</Badge>
										) : (
											<Badge variant="warning" className="font-bold gap-1 text-[11px]">
												{toggling ? (
													<Loader2 className="w-3 h-3 animate-spin" />
												) : (
													<PauseCircle className="w-3 h-3" />
												)}
												Chưa áp dụng
											</Badge>
										)}
									</button>
								</TableCell>

								<TableCell className="py-3 text-right">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-500">
												<MoreVertical className="w-4 h-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end" className="w-48">
											<DropdownMenuItem
												onClick={() => onView(item)}
												className="cursor-pointer text-xs font-semibold gap-2 py-2"
											>
												<Eye className="w-3.5 h-3.5 text-slate-500" />
												<span>Xem chi tiết</span>
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => onEdit(item)}
												className="cursor-pointer text-xs font-semibold gap-2 py-2"
											>
												<Edit className="w-3.5 h-3.5 text-sky-600" />
												<span>Chỉnh sửa / đổi phiên bản</span>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												onClick={() => onDelete(item)}
												className="cursor-pointer text-xs font-semibold gap-2 py-2 text-red-600 focus:text-red-600 focus:bg-red-50"
											>
												<Trash2 className="w-3.5 h-3.5 text-red-600" />
												<span>Xóa phác đồ</span>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}

