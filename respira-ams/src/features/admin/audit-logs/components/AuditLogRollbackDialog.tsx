"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "radix-ui";
import { useLocale, useTranslations } from "next-intl";
import { AdminDialogContent } from "@/features/admin/components/AdminDialogContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SnapshotDiff } from "@/components/ui/snapshot-diff";
import {
	RotateCcw,
	CheckCircle2,
	AlertCircle,
	AlertTriangle,
	Loader2,
	History,
	ShieldAlert,
	Check,
	Copy,
} from "lucide-react";
import { toast } from "sonner";
import {
	AuditLogItem,
	ClinicalRollbackChange,
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

function RollbackChangeDiff({
	change,
}: {
	change: ClinicalRollbackChange;
}) {
	return (
		<div className="rounded-xl border border-border-default bg-surface overflow-hidden shadow-2xs">
			{/* Change Header */}
			<div className="px-3.5 py-2.5 bg-surface-secondary border-b border-border-default flex items-center justify-between flex-wrap gap-2">
				<div className="flex items-center gap-2 min-w-0">
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
					<span className="font-bold text-text-primary text-xs truncate">
						{change.entityType}
					</span>
				</div>
				<span className="text-text-secondary text-[11px]">{change.description}</span>
			</div>

			<SnapshotDiff
				before={change.currentJson}
				after={change.targetJson}
				hideIdFields
			/>
		</div>
	);
}

function buildConfirmationCode(preview: ClinicalRollbackPreview | null, item: AuditLogItem | null) {
	const source = preview?.changeSetId || item?.id || "";
	const compact = source.replace(/[^a-zA-Z0-9]/g, "");
	return compact.slice(-6).toUpperCase();
}

export function AuditLogRollbackDialog({
	item,
	open,
	onOpenChange,
	onSuccess,
}: AuditLogRollbackDialogProps) {
	const t = useTranslations("admin.auditLogs.rollback");
	const locale = useLocale();

	const [isLoadingPreview, setIsLoadingPreview] = useState(false);
	const [preview, setPreview] = useState<ClinicalRollbackPreview | null>(null);
	const [previewError, setPreviewError] = useState<string | null>(null);
	const [visibleChanges, setVisibleChanges] = useState(20);

	const [isApplying, setIsApplying] = useState(false);
	const [result, setResult] = useState<ClinicalRollbackResult | null>(null);

	const [confirmationInput, setConfirmationInput] = useState("");
	const [confirmationError, setConfirmationError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	// Tải preview khi mở dialog
	useEffect(() => {
		if (!open || !item) return;

		let cancelled = false;

		const load = async () => {
			// Reset state after the current render pass.
			await Promise.resolve();
			if (cancelled) return;

			setResult(null);
			setPreview(null);
			setPreviewError(null);
			setVisibleChanges(20);
			setConfirmationInput("");
			setConfirmationError(null);
			setCopied(false);
			setIsLoadingPreview(true);

			try {
				const res = await previewClinicalRollback(item.id);
				if (cancelled) return;
				setPreview(res);
				setVisibleChanges(20);
			} catch (err) {
				if (cancelled) return;
				console.error("[Rollback] Failed to load preview:", err);
				setPreviewError(
					err instanceof Error ? err.message : t("previewErrorFallback")
				);
			} finally {
				if (!cancelled) setIsLoadingPreview(false);
			}
		};

		void load();

		return () => {
			cancelled = true;
		};
	}, [open, item, t]);

	if (!item) return null;

	const requiredCode = buildConfirmationCode(preview, item);
	const isCodeMatched =
		confirmationInput.trim().toUpperCase() === requiredCode && requiredCode.length > 0;

	const handleCopyCode = async () => {
		try {
			await navigator.clipboard.writeText(requiredCode);
			setCopied(true);
			toast.success(t("confirmCopied"));
			setTimeout(() => setCopied(false), 1500);
		} catch {
			// Clipboard can be unavailable (permissions/insecure context); the code stays visible.
		}
	};

	const handleApplyRollback = async () => {
		if (!preview || !preview.canApply || isApplying) return;

		if (!isCodeMatched) {
			setConfirmationError(t("confirmMismatch"));
			return;
		}

		setConfirmationError(null);
		setIsApplying(true);
		try {
			const res = await applyClinicalRollback(item.id);
			setResult(res);
			toast.success(t("applySuccessToast"));
			if (onSuccess) {
				onSuccess();
			}
		} catch (err) {
			console.error("[Rollback] Apply failed:", err);
			toast.error(err instanceof Error ? err.message : t("applyErrorToast"));
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
									{t("title")}
								</h2>
								<span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-warning/10 text-warning border border-warning/30">
									{t("adminAction")}
								</span>
							</div>
							<p className="text-xs text-text-secondary font-mono">
								{t("eventMeta", { id: item.id, service: item.service })}
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
									{t("successTitle")}
								</h3>
								<p className="text-xs text-success mt-1">
									{t("successDesc")}
								</p>
							</div>

							<div className="bg-surface p-4 rounded-xl border border-success/30 text-left max-w-lg mx-auto space-y-2 text-xs font-mono">
								<div className="flex justify-between py-1 border-b border-border-subtle">
									<span className="text-text-secondary">{t("rollbackAuditId")}</span>
									<span className="font-bold text-text-primary">{result.rollbackAuditEntryId}</span>
								</div>
								<div className="flex justify-between py-1 border-b border-border-subtle">
									<span className="text-text-secondary">{t("changeSetIdLabel")}</span>
									<span className="font-bold text-text-primary">{result.changeSetId}</span>
								</div>
								<div className="flex justify-between py-1 border-b border-border-subtle">
									<span className="text-text-secondary">{t("changesApplied")}</span>
									<span className="font-bold text-success">
										{t("objectsSuffix", { count: result.changesApplied })}
									</span>
								</div>
								<div className="flex justify-between py-1">
									<span className="text-text-secondary">{t("completedAt")}</span>
									<span className="text-text-primary">
										{new Date(result.completedAt).toLocaleString(locale)}
									</span>
								</div>
							</div>
						</div>
					) : isLoadingPreview ? (
						<div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
							<Loader2 className="w-8 h-8 animate-spin text-primary" />
							<p className="text-xs text-text-secondary font-medium">
								{t("previewLoading")}
							</p>
						</div>
					) : previewError ? (
						<div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error flex items-start gap-3">
							<AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
							<div>
								<h4 className="font-bold">{t("previewErrorTitle")}</h4>
								<p className="mt-0.5">{previewError}</p>
							</div>
						</div>
					) : preview ? (
						<>
							{/* Status Banner */}
							{preview.canApply ? (
								<div className="p-3.5 rounded-xl bg-success/10 border border-success/30 text-success flex items-center gap-2.5">
									<CheckCircle2 className="w-4 h-4 text-success shrink-0" />
									<span className="font-medium text-xs">{t("ready")}</span>
								</div>
							) : (
								<div className="p-3.5 rounded-xl bg-error/10 border border-error/30 text-error flex items-start gap-2.5">
									<AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
									<div>
										<p className="font-bold text-xs">{t("conflictTitle")}</p>
										<p className="text-[11px] text-error mt-0.5">{t("conflictDesc")}</p>
									</div>
								</div>
							)}

							{/* Conflicts List */}
							{preview.conflicts.length > 0 && (
								<div className="p-3.5 rounded-xl bg-warning/10 border border-warning/30 space-y-2">
									<div className="flex items-center gap-2 font-bold text-warning">
										<AlertTriangle className="w-4 h-4 text-warning" />
										<span>{t("conflictDetails", { count: preview.conflicts.length })}</span>
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
										<span>{t("changesTitle", { count: preview.changes.length })}</span>
									</h4>
									<span className="text-[11px] text-text-secondary font-mono">
										{t("changeSet", { id: preview.changeSetId })}
									</span>
								</div>

								{preview.changes.slice(0, visibleChanges).map((change, idx) => (
									<RollbackChangeDiff key={idx} change={change} />
								))}

								{preview.changes.length > visibleChanges && (
									<div className="flex justify-center pt-1">
										<Button
											type="button"
											variant="outline"
											onClick={() =>
												setVisibleChanges((value) =>
													Math.min(value + 20, preview.changes.length)
												)
											}
											className="h-8 px-4 rounded-lg border-border-default text-text-primary hover:bg-surface-secondary text-xs font-semibold cursor-pointer"
										>
											{t("showMore", {
												count: Math.min(20, preview.changes.length - visibleChanges),
											})}
										</Button>
									</div>
								)}
							</div>

							{/* Warning Message */}
							<div className="p-3 rounded-xl bg-warning/10 border border-warning/30 flex items-start gap-2.5 text-warning text-xs">
								<ShieldAlert className="w-4 h-4 text-warning shrink-0 mt-0.5" />
								<span>{t("warning")}</span>
							</div>

							{/* Confirmation code */}
							{preview.canApply && (
								<div className="rounded-xl border border-warning/40 bg-warning/5 p-3.5 space-y-2.5">
									<div>
										<p className="font-bold text-text-primary text-xs">
											{t("confirmTitle")}
										</p>
										<p className="text-[11px] text-text-secondary mt-0.5">
											{t("confirmHint")}
										</p>
									</div>

									<div className="flex items-center gap-2 flex-wrap">
										<span className="text-[11px] font-semibold text-text-secondary">
											{t("confirmLabel")}:
										</span>
										<code className="rounded-md border border-warning/40 bg-surface px-2.5 py-1 font-mono text-sm font-bold tracking-[0.2em] text-warning">
											{requiredCode}
										</code>
										<button
											type="button"
											onClick={handleCopyCode}
											className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10.5px] font-semibold text-primary hover:bg-primary/10 cursor-pointer"
										>
											{copied ? (
												<Check className="h-3.5 w-3.5" />
											) : (
												<Copy className="h-3.5 w-3.5" />
											)}
											<span>{t("confirmCopy")}</span>
										</button>
									</div>

									<Input
										value={confirmationInput}
										onChange={(event) => {
											setConfirmationInput(event.target.value);
											if (confirmationError) setConfirmationError(null);
										}}
										placeholder={t("confirmPlaceholder")}
										autoComplete="off"
										spellCheck={false}
										aria-label={t("confirmLabel")}
										aria-invalid={Boolean(confirmationError)}
										className={`h-9 max-w-xs font-mono text-xs uppercase tracking-widest ${
											confirmationError ? "border-error focus-visible:ring-error/40" : ""
										}`}
									/>
									{confirmationError && (
										<p className="flex items-center gap-1 text-[11px] font-semibold text-error">
											<AlertCircle className="h-3.5 w-3.5" />
											{confirmationError}
										</p>
									)}
								</div>
							)}
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
						{result ? t("close") : t("back")}
					</Button>

					{!result && (
						<Button
							type="button"
							onClick={handleApplyRollback}
							disabled={
								!preview?.canApply ||
								!isCodeMatched ||
								isApplying ||
								isLoadingPreview
							}
							className={`h-9 px-5 rounded-xl font-semibold text-xs cursor-pointer shadow-xs gap-2 ${
								preview?.canApply && isCodeMatched
									? "bg-warning hover:bg-warning/90 text-primary-foreground"
									: "bg-surface-tertiary text-text-tertiary cursor-not-allowed"
							}`}
						>
							{isApplying ? (
								<>
									<Loader2 className="w-3.5 h-3.5 animate-spin" />
									<span>{t("applying")}</span>
								</>
							) : (
								<>
									<RotateCcw className="w-3.5 h-3.5" />
									<span>{t("apply")}</span>
								</>
							)}
						</Button>
					)}
				</div>
			</AdminDialogContent>
		</Dialog.Root>
	);
}
