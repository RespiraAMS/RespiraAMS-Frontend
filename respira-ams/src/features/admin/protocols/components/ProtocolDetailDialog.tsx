"use client";

import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AdminDialogContent } from "@/features/admin/components/AdminDialogContent";
import { ClinicalMetricItem } from "@/features/manager/clinical-metrics/types";
import { useProtocolDetail } from "../queries";

interface ProtocolDetailDialogProps {
	item: ClinicalMetricItem | null;
	open: boolean;
	onClose: () => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="p-3.5 rounded-xl bg-surface-secondary border border-border-default/80 space-y-1">
			<div className="text-text-tertiary font-semibold uppercase tracking-wider text-[10px]">{label}</div>
			<div className="font-bold text-text-primary text-sm">{children}</div>
		</div>
	);
}

export function ProtocolDetailDialog({ item, open, onClose }: ProtocolDetailDialogProps) {
	const { data, isLoading, isError, error } = useProtocolDetail(item?.id ?? "", {
		enabled: open && !!item,
	});

	if (!item) return null;
	const detail = data ?? item;
	const rules = data?.rules ?? [];

	return (
		<Dialog open={open} onOpenChange={(o) => !o && onClose()}>
			<AdminDialogContent className="max-w-2xl">
				<DialogHeader>
					<div className="flex items-center gap-2 flex-wrap pr-8">
						<DialogTitle className="text-lg font-bold text-text-primary">{detail.name}</DialogTitle>
						<Badge variant="outline" className="font-bold bg-info/10 text-info border-info/30">
							v{detail.version.replace(/^v/i, "")}
						</Badge>
						{detail.isApplied ? (
							<Badge variant="outline" className="font-bold bg-success/10 text-success border-success/30">Đang áp dụng</Badge>
						) : (
							<Badge variant="outline" className="font-bold bg-warning/10 text-warning border-warning/30">Chưa áp dụng</Badge>
						)}
					</div>
					<p className="text-xs font-mono text-text-tertiary">{detail.code}</p>
				</DialogHeader>

				<div className="space-y-5 pt-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
						<Field label="Đơn vị ban hành">{detail.publisher}</Field>
						<Field label="Phiên bản">{detail.version}</Field>
						<div className="sm:col-span-2 p-3.5 rounded-xl bg-surface-secondary border border-border-default/80 space-y-1">
							<div className="text-text-tertiary font-semibold uppercase tracking-wider text-[10px]">Mô tả</div>
							<p className="text-sm text-text-primary leading-relaxed">{detail.description}</p>
						</div>
					</div>

					<div>
						<h4 className="text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-3 pb-2 border-b border-dashed border-border-default">
							Quy tắc đánh giá {data && `(${rules.length})`}
						</h4>

						{isLoading && <p className="text-xs text-text-tertiary">Đang tải quy tắc...</p>}
						{isError && (
							<p className="text-xs font-semibold text-error">
								Không thể tải quy tắc: {error instanceof Error ? error.message : "Lỗi không xác định"}
							</p>
						)}
						{data && rules.length === 0 && (
							<p className="text-xs italic text-text-tertiary">Phác đồ này chưa có quy tắc nào.</p>
						)}

						<div className="space-y-2">
							{rules.map((rule) => (
								<div key={rule.id} className="p-3.5 rounded-xl border border-border-default bg-surface space-y-1.5">
									<div className="flex items-center justify-between gap-2 flex-wrap">
										<span className="font-bold text-sm text-text-primary">{rule.criterion?.name}</span>
										<div className="flex items-center gap-1.5">
											{rule.isMajorRule != null && (
												<Badge variant={rule.isMajorRule ? "destructive" : "secondary"} className="text-[11px]">
													{rule.isMajorRule ? "Tiêu chí chính" : "Tiêu chí phụ"}
												</Badge>
											)}
											{rule.scoreFunction && (
												<Badge variant="outline" className="text-[11px] bg-info/10 text-info border-info/30">Có hàm tính điểm</Badge>
											)}
										</div>
									</div>
									{rule.criterion?.formula && (
										<code className="block text-[11px] font-mono bg-surface-secondary border border-border-default rounded px-2 py-1 text-text-primary break-all">
											{rule.criterion.formula}
										</code>
									)}
								</div>
							))}
						</div>
					</div>
				</div>
			</AdminDialogContent>
		</Dialog>
	);
}

