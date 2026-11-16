"use client";

import { useTranslations } from "next-intl";
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

const HEAD = "font-bold text-xs uppercase tracking-wider text-text-secondary py-3.5";

export function ProtocolsTable({
	items,
	isLoading,
	togglingId,
	onView,
	onEdit,
	onDelete,
	onToggleApplied,
}: ProtocolsTableProps) {
	const t = useTranslations("admin.protocols");

	// Chỉ hiện spinner toàn màn hình khi chưa có dữ liệu nào
	if (isLoading && items.length === 0) {
		return (
			<div className="bg-surface rounded-xl border border-border-default p-12 text-center">
				<div className="inline-block w-8 h-8 border-2 border-border-default border-t-primary rounded-full animate-spin mb-3" />
				<p className="text-sm font-medium text-text-secondary">{t("loading", { defaultMessage: "Đang tải danh sách phác đồ..." })}</p>
			</div>
		);
	}

	if (items.length === 0 && !isLoading) {
		return (
			<div className="bg-surface rounded-xl border border-border-default p-12 text-center">
				<h3 className="text-sm font-bold text-text-primary">{t("empty")}</h3>
				<p className="text-xs text-text-secondary mt-1">
					{t("emptyDesc", { defaultMessage: "Thử đổi từ khóa tìm kiếm, bộ lọc trạng thái hoặc thêm phác đồ mới." })}
				</p>
			</div>
		);
	}

	return (
		<div className="relative bg-surface rounded-xl border border-border-default shadow-xs overflow-hidden">
			{/* Loading bar mảnh chạy ngầm khi tìm kiếm, không làm giật bảng */}
			{isLoading && (
				<div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/10 overflow-hidden z-10">
					<div className="w-full h-full bg-primary animate-pulse" />
				</div>
			)}
			<Table className={`transition-opacity duration-150 ${isLoading ? "opacity-60" : "opacity-100"}`}>
				<TableHeader className="bg-surface-secondary/80">
					<TableRow className="border-b border-border-default hover:bg-transparent">
						<TableHead className={`w-[260px] ${HEAD}`}>{t("colProtocol")}</TableHead>
						<TableHead className={HEAD}>{t("colVersion")}</TableHead>
						<TableHead className={HEAD}>{t("colPublisher")}</TableHead>
						<TableHead className={HEAD}>{t("colDescription", { defaultMessage: "Mô tả" })}</TableHead>
						<TableHead className={HEAD}>{t("colApplied")}</TableHead>
						<TableHead className={`w-[60px] text-right ${HEAD}`}>{t("colActions")}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{items.map((item) => {
						const toggling = togglingId === item.id;
						return (
							<TableRow
								key={item.id}
								className="border-b border-border-subtle hover:bg-surface-secondary/60 transition-colors"
							>
								<TableCell className="py-3">
									<div className="font-bold text-sm text-text-primary">{item.name}</div>
									<div className="text-[11px] font-mono text-text-tertiary">{item.code}</div>
								</TableCell>

								<TableCell className="py-3">
									<Badge variant="outline" className="font-bold bg-info/10 text-info border-info/30">
										v{item.version.replace(/^v/i, "")}
									</Badge>
								</TableCell>

								<TableCell className="py-3 text-xs text-text-primary">{item.publisher}</TableCell>

								<TableCell className="py-3 max-w-[280px]">
									<p className="text-xs text-text-secondary line-clamp-2">{item.description}</p>
								</TableCell>

								<TableCell className="py-3">
									<button
										type="button"
										disabled={toggling}
										onClick={() => onToggleApplied(item)}
										title={item.isApplied ? t("clickToUnapply", { defaultMessage: "Bấm để ngừng áp dụng" }) : t("clickToApply", { defaultMessage: "Bấm để áp dụng" })}
										className="cursor-pointer disabled:opacity-60"
									>
										{item.isApplied ? (
											<Badge variant="outline" className="font-bold gap-1 text-[11px] bg-success/10 text-success border-success/30">
												{toggling ? (
													<Loader2 className="w-3 h-3 animate-spin" />
												) : (
													<CheckCircle2 className="w-3 h-3" />
												)}
												{t("applied")}
											</Badge>
										) : (
											<Badge variant="outline" className="font-bold gap-1 text-[11px] bg-warning/10 text-warning border-warning/30">
												{toggling ? (
													<Loader2 className="w-3 h-3 animate-spin" />
												) : (
													<PauseCircle className="w-3 h-3" />
												)}
												{t("notApplied")}
											</Badge>
										)}
									</button>
								</TableCell>

								<TableCell className="py-3 text-right">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-text-secondary">
												<MoreVertical className="w-4 h-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end" className="w-48">
											<DropdownMenuItem
												onClick={() => onView(item)}
												className="cursor-pointer text-xs font-semibold gap-2 py-2"
											>
												<Eye className="w-3.5 h-3.5 text-text-secondary" />
												<span>{t("actionView", { defaultMessage: "Xem chi tiết" })}</span>
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => onEdit(item)}
												className="cursor-pointer text-xs font-semibold gap-2 py-2"
											>
												<Edit className="w-3.5 h-3.5 text-primary" />
												<span>{t("actionEdit", { defaultMessage: "Chỉnh sửa / đổi phiên bản" })}</span>
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												onClick={() => onDelete(item)}
												className="cursor-pointer text-xs font-semibold gap-2 py-2 text-error focus:text-error focus:bg-error/10"
											>
												<Trash2 className="w-3.5 h-3.5 text-error" />
												<span>{t("actionDelete", { defaultMessage: "Xóa phác đồ" })}</span>
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

