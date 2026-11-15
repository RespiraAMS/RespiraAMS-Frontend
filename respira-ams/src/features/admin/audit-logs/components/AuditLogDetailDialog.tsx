"use client";

import React, { useState } from "react";
import { Dialog } from "radix-ui";
import { AdminDialogContent } from "@/features/admin/components/AdminDialogContent";
import { Button } from "@/components/ui/button";
import {
	Shield,
	CheckCircle2,
	AlertTriangle,
	AlertCircle,
	Check,
	Clock,
	Layers,
	Globe,
	Server,
	User,
	Activity,
	RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { AuditLogItem } from "../types";
import { AuditLogRollbackDialog } from "./AuditLogRollbackDialog";

interface AuditLogDetailDialogProps {
	item: AuditLogItem | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onRollbackSuccess?: () => void;
}

export function AuditLogDetailDialog({
	item,
	open,
	onOpenChange,
	onRollbackSuccess,
}: AuditLogDetailDialogProps) {
	const [isRollbackOpen, setIsRollbackOpen] = useState(false);

	if (!item) return null;

	const formatFullTimestamp = (iso: string) => {
		try {
			const d = new Date(iso);
			return d.toLocaleString("vi-VN", {
				weekday: "long",
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			});
		} catch {
			return iso;
		}
	};

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<AdminDialogContent className="max-w-2xl sm:max-w-3xl">
				{/* Header */}
				<div className="flex items-start justify-between gap-4 pb-4 border-b border-border-subtle">
					<div className="flex items-center gap-3">
						<div
							className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
								item.status === "success"
									? "bg-success/10 text-success border border-success/30"
									: item.status === "warning"
									? "bg-warning/10 text-warning border border-warning/30"
									: "bg-error/10 text-error border border-error/30"
							}`}
						>
							{item.status === "success" ? (
								<CheckCircle2 className="w-6 h-6" />
							) : item.status === "warning" ? (
								<AlertTriangle className="w-6 h-6" />
							) : (
								<AlertCircle className="w-6 h-6" />
							)}
						</div>

						<div>
							<div className="flex items-center gap-2 flex-wrap mb-1">
								<h2 className="text-base sm:text-lg font-bold text-text-primary leading-snug">
									Chi tiết Sự kiện Kiểm toán
								</h2>
								<span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-secondary text-text-primary">
									{item.service}
								</span>
							</div>
							<p className="text-xs text-text-secondary font-mono">
								ID: {item.id} • Correlation: {item.correlationId}
							</p>
						</div>
					</div>
				</div>

				<div className="space-y-5 pt-5">
					{/* Status & Severity Summary Bar */}
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-secondary/80 p-3.5 rounded-xl border border-border-subtle">
						<div>
							<span className="text-[11px] font-semibold text-text-tertiary block mb-0.5">
								Trạng thái
							</span>
							<span
								className={`inline-flex items-center gap-1 font-bold text-xs ${
									item.status === "success"
										? "text-success"
										: item.status === "warning"
										? "text-warning"
										: "text-error"
								}`}
							>
								{item.status === "success"
									? "Thành công (Success)"
									: item.status === "warning"
									? "Cảnh báo (Warning)"
									: "Thất bại (Error)"}
							</span>
						</div>

						<div>
							<span className="text-[11px] font-semibold text-text-tertiary block mb-0.5">
								Mức độ nghiêm trọng
							</span>
							<span
								className={`inline-block font-bold text-xs uppercase ${
									item.severity === "critical"
										? "text-error"
										: item.severity === "high"
										? "text-warning"
										: item.severity === "medium"
										? "text-warning"
										: "text-text-secondary"
								}`}
							>
								{item.severity}
							</span>
						</div>

						<div>
							<span className="text-[11px] font-semibold text-text-tertiary block mb-0.5">
								Thời gian xử lý
							</span>
							<span className="font-mono text-xs font-bold text-text-primary">
								{item.durationMs} ms
							</span>
						</div>

						<div>
							<span className="text-[11px] font-semibold text-text-tertiary block mb-0.5">
								Danh mục
							</span>
							<span className="font-mono text-xs font-semibold text-text-primary bg-surface border border-border-default px-1.5 py-0.2 rounded">
								{item.category}
							</span>
						</div>
					</div>

					{/* Action description */}
					<div className="bg-surface p-4 rounded-xl border border-border-default/80">
						<span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block mb-1.5">
							Hành động đã thực thi
						</span>
						<p className="text-sm font-semibold text-text-primary leading-relaxed">{item.action}</p>
						<div className="mt-2.5 pt-2.5 border-t border-border-subtle flex items-center gap-2 text-xs text-text-secondary">
							<span className="font-semibold text-text-tertiary">Tài nguyên đối tượng:</span>
							<code className="font-mono text-xs bg-surface-secondary px-2 py-0.5 rounded text-primary font-semibold border border-border-default/60">
								{item.target}
							</code>
						</div>
					</div>

					{/* Actor & Network Environment */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{/* Actor Box */}
						<div className="p-4 rounded-xl border border-border-default/80 space-y-2">
							<div className="flex items-center gap-2 text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
								<User className="w-3.5 h-3.5 text-primary" />
								<span>Thông tin Tác nhân (Actor)</span>
							</div>
							<div className="text-xs space-y-1.5">
								<div className="flex justify-between">
									<span className="text-text-secondary font-medium">Họ tên:</span>
									<span className="font-bold text-text-primary">{item.actorName}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-text-secondary font-medium">Email / ID:</span>
									<span className="font-mono text-text-primary break-all">{item.actor}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-text-secondary font-medium">Vai trò:</span>
									<span className="font-bold text-primary">{item.role}</span>
								</div>
							</div>
						</div>

						{/* Network Box */}
						<div className="p-4 rounded-xl border border-border-default/80 space-y-2">
							<div className="flex items-center gap-2 text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
								<Globe className="w-3.5 h-3.5 text-info" />
								<span>Môi trường Mạng & Thiết bị</span>
							</div>
							<div className="text-xs space-y-1.5">
								<div className="flex justify-between">
									<span className="text-text-secondary font-medium">Địa chỉ IP:</span>
									<span className="font-mono font-bold text-text-primary">{item.ipAddress}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-text-secondary font-medium">Thời điểm:</span>
									<span className="font-mono text-text-primary text-[11px]">
										{formatFullTimestamp(item.timestamp)}
									</span>
								</div>
								<div className="flex flex-col gap-1 pt-1">
									<span className="text-text-secondary font-medium">User Agent:</span>
									<span className="font-mono text-[10.5px] text-text-secondary truncate bg-surface-secondary p-1 rounded border border-border-subtle">
										{item.userAgent || "N/A"}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Error or Response Box */}
					{item.errorMessage ? (
						<div className="p-3.5 rounded-xl bg-error/10 border border-error/30 text-xs">
							<span className="font-bold text-error block mb-1">
								Thông điệp Lỗi / Ngoại lệ:
							</span>
							<p className="font-mono text-error">{item.errorMessage}</p>
						</div>
					) : item.responseSummary ? (
						<div className="p-3.5 rounded-xl bg-success/10 border border-success/30 text-xs">
							<span className="font-bold text-success block mb-1">
								Kết quả phản hồi hệ thống:
							</span>
							<p className="text-success font-medium">{item.responseSummary}</p>
						</div>
					) : null}
				</div>

				{/* Footer */}
				<div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between gap-3 flex-wrap">
					{/* Nút Xem trước & Hoàn tác (Rollback) */}
					<Button
						type="button"
						variant="outline"
						onClick={() => setIsRollbackOpen(true)}
						className="h-9 px-3.5 rounded-xl border-warning/30 bg-warning/10 hover:bg-warning/10 text-warning font-semibold text-xs cursor-pointer gap-2 transition-all shadow-2xs hover:shadow-xs active:scale-[0.98]"
						title="Xem trước sự thay đổi và hoàn tác dữ liệu lâm sàng về phiên bản trước"
					>
						<RotateCcw className="w-3.5 h-3.5 text-warning" />
						<span>Xem trước &amp; Hoàn tác (Rollback)</span>
					</Button>

					<Button
						type="button"
						onClick={() => onOpenChange(false)}
						className="h-9 px-6 rounded-xl bg-foreground hover:bg-foreground/90 text-background font-semibold text-xs cursor-pointer shadow-xs"
					>
						Đóng
					</Button>
				</div>
			</AdminDialogContent>

			{/* Modal Xem trước & Hoàn tác (Rollback) */}
			<AuditLogRollbackDialog
				item={item}
				open={isRollbackOpen}
				onOpenChange={setIsRollbackOpen}
				onSuccess={() => {
					onRollbackSuccess?.();
				}}
			/>
		</Dialog.Root>
	);
}

