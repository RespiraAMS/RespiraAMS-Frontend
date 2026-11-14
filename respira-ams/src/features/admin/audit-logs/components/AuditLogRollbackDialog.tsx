"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "radix-ui";
import { AdminDialogContent } from "@/features/admin/components/AdminDialogContent";
import { Button } from "@/components/ui/button";
import {
	RotateCcw,
	CheckCircle2,
	AlertCircle,
	AlertTriangle,
	Loader2,
	Layers,
	ArrowRight,
	History,
	FileText,
	ShieldAlert,
	Check,
} from "lucide-react";
import { toast } from "sonner";
import {
	AuditLogItem,
	ClinicalRollbackPreview,
	ClinicalRollbackResult,
} from "../types";
import {
	previewClinicalRollback,
	applyClinicalRollback,
} from "../api";

interface AuditLogRollbackDialogProps {
	item: AuditLogItem | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

export function AuditLogRollbackDialog({
	item,
	open,
	onOpenChange,
	onSuccess,
}: AuditLogRollbackDialogProps) {
	const [isLoadingPreview, setIsLoadingPreview] = useState(false);
	const [preview, setPreview] = useState<ClinicalRollbackPreview | null>(null);
	const [previewError, setPreviewError] = useState<string | null>(null);

	const [isApplying, setIsApplying] = useState(false);
	const [result, setResult] = useState<ClinicalRollbackResult | null>(null);

	// Tải preview khi mở dialog
	useEffect(() => {
		if (open && item) {
			setResult(null);
			setPreview(null);
			setPreviewError(null);
			setIsLoadingPreview(true);

			previewClinicalRollback(item.id)
				.then((res) => {
					setPreview(res);
				})
				.catch((err) => {
					console.error("Lỗi khi tải rollback preview:", err);
					setPreviewError(
						err instanceof Error
							? err.message
							: "Không thể tải bản xem trước hoàn tác."
					);
				})
				.finally(() => {
					setIsLoadingPreview(false);
				});
		}
	}, [open, item]);

	if (!item) return null;

	const handleApplyRollback = async () => {
		if (!preview || !preview.canApply) return;

		setIsApplying(true);
		try {
			const res = await applyClinicalRollback(item.id);
			setResult(res);
			toast.success("Hoàn tác dữ liệu lâm sàng thành công!");
			if (onSuccess) {
				onSuccess();
			}
		} catch (err) {
			console.error("Lỗi khi thực thi rollback:", err);
			toast.error(
				err instanceof Error
					? err.message
					: "Hoàn tác thất bại. Vui lòng kiểm tra lại quyền hoặc xung đột dữ liệu."
			);
		} finally {
			setIsApplying(false);
		}
	};

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<AdminDialogContent className="max-w-2xl sm:max-w-3xl">
				{/* Header */}
				<div className="flex items-start justify-between gap-4 pb-4 border-b border-border-subtle">
					<div className="flex items-center gap-3">
						<div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-warning/10 text-warning border border-warning/30">
							<RotateCcw className="w-6 h-6" />
						</div>

						<div>
							<div className="flex items-center gap-2 flex-wrap mb-1">
								<h2 className="text-base sm:text-lg font-bold text-text-primary leading-snug">
									Xem trước &amp; Hoàn tác Dữ liệu (Clinical Rollback)
								</h2>
								<span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-warning/10 text-warning border border-warning/30">
									Admin Action
								</span>
							</div>
							<p className="text-xs text-text-secondary font-mono">
								ID Sự kiện: {item.id} • Dịch vụ: {item.service}
							</p>
						</div>
					</div>
				</div>

				{/* Body Content */}
				<div className="mt-4 space-y-4 text-xs">
					{/* Màn hình kết quả thành công */}
					{result ? (
						<div className="py-6 px-4 bg-success/10 border border-success/30 rounded-2xl text-center space-y-4">
							<div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto">
								<Check className="w-6 h-6 stroke-[3]" />
							</div>
							<div>
								<h3 className="text-base font-bold text-success">
									Hoàn tác dữ liệu thành công!
								</h3>
								<p className="text-xs text-success mt-1">
									Dữ liệu lâm sàng đã được phục hồi về phiên bản trước sự kiện này một cách an toàn.
								</p>
							</div>

							<div className="bg-surface p-4 rounded-xl border border-success/30 text-left max-w-lg mx-auto space-y-2 text-xs font-mono">
								<div className="flex justify-between py-1 border-b border-border-subtle">
									<span className="text-text-secondary">Mã giao dịch Hoàn tác:</span>
									<span className="font-bold text-text-primary">{result.rollbackAuditEntryId}</span>
								</div>
								<div className="flex justify-between py-1 border-b border-border-subtle">
									<span className="text-text-secondary">Mã ChangeSet:</span>
									<span className="font-bold text-text-primary">{result.changeSetId}</span>
								</div>
								<div className="flex justify-between py-1 border-b border-border-subtle">
									<span className="text-text-secondary">Số thay đổi đã áp dụng:</span>
									<span className="font-bold text-success">
										{result.changesApplied} đối tượng
									</span>
								</div>
								<div className="flex justify-between py-1">
									<span className="text-text-secondary">Thời điểm hoàn tất:</span>
									<span className="text-text-primary">
										{new Date(result.completedAt).toLocaleString("vi-VN")}
									</span>
								</div>
							</div>
						</div>
					) : isLoadingPreview ? (
						<div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
							<Loader2 className="w-8 h-8 animate-spin text-primary" />
							<p className="text-xs text-text-secondary font-medium">
								Đang kết nối vi dịch vụ Clinical để phân tích và kiểm tra xung đột dữ liệu...
							</p>
						</div>
					) : previewError ? (
						<div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error flex items-start gap-3">
							<AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
							<div>
								<h4 className="font-bold">Không thể tải bản xem trước hoàn tác</h4>
								<p className="mt-0.5">{previewError}</p>
							</div>
						</div>
					) : preview ? (
						<>
							{/* Status Banner */}
							{preview.canApply ? (
								<div className="p-3.5 rounded-xl bg-success/10 border border-success/30 text-success flex items-center gap-2.5">
									<CheckCircle2 className="w-4 h-4 text-success shrink-0" />
									<span className="font-medium text-xs">
										Sẵn sàng hoàn tác: Dữ liệu hiện tại hoàn toàn khớp và không có xung đột phiên bản.
									</span>
								</div>
							) : (
								<div className="p-3.5 rounded-xl bg-error/10 border border-error/30 text-error flex items-start gap-2.5">
									<AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
									<div>
										<p className="font-bold text-xs">
											Phát hiện xung đột: Không thể hoàn tác tự động cho sự kiện này.
										</p>
										<p className="text-[11px] text-error mt-0.5">
											Dữ liệu đối tượng đã bị thay đổi hoặc bản ghi gốc không hợp lệ để đảo ngược.
										</p>
									</div>
								</div>
							)}

							{/* Conflicts List (nếu có) */}
							{preview.conflicts.length > 0 && (
								<div className="p-3.5 rounded-xl bg-warning/10 border border-warning/30 space-y-2">
									<div className="flex items-center gap-2 font-bold text-warning">
										<AlertTriangle className="w-4 h-4 text-warning" />
										<span>Chi tiết xung đột ({preview.conflicts.length})</span>
									</div>
									<div className="space-y-1.5 pl-6 list-disc">
										{preview.conflicts.map((c, i) => (
											<div key={i} className="text-warning text-xs">
												<span className="font-mono font-bold">[{c.entityType}]</span>: {c.reason}
											</div>
										))}
									</div>
								</div>
							)}

							{/* Chi tiết các thay đổi (Diff Preview) */}
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<h4 className="font-bold text-text-primary flex items-center gap-1.5 text-xs">
										<History className="w-4 h-4 text-primary" />
										<span>Các thay đổi dự kiến sẽ được đảo ngược ({preview.changes.length})</span>
									</h4>
									<span className="text-[11px] text-text-secondary font-mono">
										ChangeSet: {preview.changeSetId}
									</span>
								</div>

								{preview.changes.map((change, idx) => (
									<div
										key={idx}
										className="rounded-xl border border-border-default bg-surface overflow-hidden shadow-2xs"
									>
										{/* Change Header */}
										<div className="px-3.5 py-2.5 bg-surface-secondary border-b border-border-default flex items-center justify-between flex-wrap gap-2">
											<div className="flex items-center gap-2">
												<span
													className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
														change.operation === "Insert"
															? "bg-success/10 text-success"
															: change.operation === "Delete"
															? "bg-error/10 text-error"
															: "bg-info/10 text-info"
													}`}
												>
													{change.operation}
												</span>
												<span className="font-bold text-text-primary text-xs">
													{change.entityType}
												</span>
											</div>
											<span className="text-text-secondary text-xs">{change.description}</span>
										</div>

										{/* Side-by-side Diff */}
										<div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border-default bg-surface text-[11px] font-mono">
											{/* Cột 1: Giá trị hiện tại */}
											<div className="p-3 overflow-x-auto">
												<div className="text-error font-bold mb-1.5 flex items-center gap-1.5">
													<span className="w-2 h-2 rounded-full bg-error" />
													<span>Giá trị hiện tại trong hệ thống</span>
												</div>
												<pre className="text-text-tertiary max-h-40 overflow-y-auto whitespace-pre-wrap">
													{change.currentJson || "(Không có)"}
												</pre>
											</div>

											{/* Cột 2: Giá trị sau hoàn tác */}
											<div className="p-3 overflow-x-auto bg-background/50">
												<div className="text-success font-bold mb-1.5 flex items-center gap-1.5">
													<span className="w-2 h-2 rounded-full bg-success" />
													<span>Giá trị phục hồi sau Hoàn tác</span>
												</div>
												<pre className="text-success max-h-40 overflow-y-auto whitespace-pre-wrap">
													{change.targetJson || "(Sẽ bị thu hồi / xóa)"}
												</pre>
											</div>
										</div>
									</div>
								))}
							</div>

							{/* Warning Message */}
							<div className="p-3 rounded-xl bg-warning/10 border border-warning/30 flex items-start gap-2.5 text-warning text-xs">
								<ShieldAlert className="w-4 h-4 text-warning shrink-0 mt-0.5" />
								<span>
									<strong>Lưu ý:</strong> Thao tác này sẽ khôi phục dữ liệu lâm sàng về phiên bản trước đó và tự động ghi lại một sự kiện kiểm toán mới mang tên <em>Clinical Rollback</em>.
								</span>
							</div>
						</>
					) : null}
				</div>

				{/* Footer Buttons */}
				<div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isApplying}
						className="h-9 px-4 rounded-xl border-border-default text-text-primary hover:bg-surface-secondary text-xs font-semibold cursor-pointer"
					>
						{result ? "Đóng" : "Quay lại"}
					</Button>

					{!result && (
						<Button
							type="button"
							onClick={handleApplyRollback}
							disabled={!preview?.canApply || isApplying || isLoadingPreview}
							className={`h-9 px-5 rounded-xl font-semibold text-xs cursor-pointer shadow-xs gap-2 ${
								preview?.canApply
									? "bg-warning hover:bg-warning/90 text-primary-foreground"
									: "bg-surface-tertiary text-text-tertiary cursor-not-allowed"
							}`}
						>
							{isApplying ? (
								<>
									<Loader2 className="w-3.5 h-3.5 animate-spin" />
									<span>Đang hoàn tác dữ liệu...</span>
								</>
							) : (
								<>
									<RotateCcw className="w-3.5 h-3.5" />
									<span>Xác nhận Hoàn tác (Rollback)</span>
								</>
							)}
						</Button>
					)}
				</div>
			</AdminDialogContent>
		</Dialog.Root>
	);
}

