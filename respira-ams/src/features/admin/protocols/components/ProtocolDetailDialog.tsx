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
		<div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
			<div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">{label}</div>
			<div className="font-bold text-slate-900 text-sm">{children}</div>
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
						<DialogTitle className="text-lg font-bold text-slate-900">{detail.name}</DialogTitle>
						<Badge variant="info" className="font-bold">
							v{detail.version.replace(/^v/i, "")}
						</Badge>
						{detail.isApplied ? (
							<Badge variant="success" className="font-bold">Đang áp dụng</Badge>
						) : (
							<Badge variant="warning" className="font-bold">Chưa áp dụng</Badge>
						)}
					</div>
					<p className="text-xs font-mono text-slate-400">{detail.code}</p>
				</DialogHeader>

				<div className="space-y-5 pt-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
						<Field label="Đơn vị ban hành">{detail.publisher}</Field>
						<Field label="Phiên bản">{detail.version}</Field>
						<div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
							<div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Mô tả</div>
							<p className="text-sm text-slate-800 leading-relaxed">{detail.description}</p>
						</div>
					</div>

					<div>
						<h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 pb-2 border-b border-dashed border-slate-200">
							Quy tắc đánh giá {data && `(${rules.length})`}
						</h4>

						{isLoading && <p className="text-xs text-slate-400">Đang tải quy tắc...</p>}
						{isError && (
							<p className="text-xs font-semibold text-red-600">
								Không thể tải quy tắc: {error instanceof Error ? error.message : "Lỗi không xác định"}
							</p>
						)}
						{data && rules.length === 0 && (
							<p className="text-xs italic text-slate-400">Phác đồ này chưa có quy tắc nào.</p>
						)}

						<div className="space-y-2">
							{rules.map((rule) => (
								<div key={rule.id} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5">
									<div className="flex items-center justify-between gap-2 flex-wrap">
										<span className="font-bold text-sm text-slate-900">{rule.criterion?.name}</span>
										<div className="flex items-center gap-1.5">
											{rule.isMajorRule != null && (
												<Badge variant={rule.isMajorRule ? "destructive" : "secondary"} className="text-[11px]">
													{rule.isMajorRule ? "Tiêu chí chính" : "Tiêu chí phụ"}
												</Badge>
											)}
											{rule.scoreFunction && (
												<Badge variant="info" className="text-[11px]">Có hàm tính điểm</Badge>
											)}
										</div>
									</div>
									{rule.criterion?.formula && (
										<code className="block text-[11px] font-mono bg-slate-100 border border-slate-200 rounded px-2 py-1 text-slate-700 break-all">
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

