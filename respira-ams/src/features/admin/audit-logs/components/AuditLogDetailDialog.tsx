"use client";

import React, { useState } from "react";
import { Dialog } from "radix-ui";
import { useLocale, useTranslations } from "next-intl";
import { AdminDialogContent } from "@/features/admin/components/AdminDialogContent";
import { Button } from "@/components/ui/button";
import {
	CheckCircle2,
	AlertTriangle,
	AlertCircle,
	User,
	RotateCcw,
} from "lucide-react";
import { AuditLogItem } from "../types";
import { AuditLogRollbackDialog } from "./AuditLogRollbackDialog";
import { SnapshotDiff, stripIdFields } from "@/components/ui/snapshot-diff";
import { useAuditActionLabel, useAuditRoleLabel, useAuditCategoryLabel } from "../use-audit-labels";

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
	const t = useTranslations("admin.auditLogs.detail");
	const tAudit = useTranslations("admin.auditLogs");
	const locale = useLocale();
	const actionLabel = useAuditActionLabel();
	const roleLabel = useAuditRoleLabel();
	const categoryLabel = useAuditCategoryLabel();

	if (!item) return null;

	const canRollback = item.service === "Clinical" && item.rawAction.startsWith("Clinical.");

	const detailLabels =
		(t.raw("labels") as Record<string, string> | undefined) ?? {};

	const formatDetailValue = (key: string, value: unknown): string => {
		if (key === "changedFields" && Array.isArray(value)) {
			return value.join(", ");
		}
		if (value === null || value === undefined) return "—";
		if (typeof value === "boolean") return value ? t("flagYes") : t("flagNo");
		if (typeof value === "object") return JSON.stringify(value, null, 2);
		return String(value);
	};

	const details =
		item.requestPayload && typeof item.requestPayload === "object"
			? (item.requestPayload as Record<string, unknown>)
			: null;

	const hasSnapshot = Boolean(details && ("before" in details || "after" in details));
	const snapshotBefore = details?.before;
	const snapshotAfter = details?.after;

	const flagEntries = details
		? Object.entries(details).filter(
				([key, value]) => key.endsWith("Changed") && typeof value === "boolean"
			)
		: [];

	const hiddenDetailKeys = new Set([
		"Id",
		"id",
		"entityId",
		"accountId",
		"changeSetId",
		"traceId",
		"correlationId",
		"before",
		"after",
		...flagEntries.map(([key]) => key),
	]);

	const metadataEntries = details
		? Object.entries(details).filter(([key]) => !hiddenDetailKeys.has(key))
		: [];

	const formatFullTimestamp = (iso: string) => {
		try {
			const d = new Date(iso);
			return d.toLocaleString(locale, {
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
									{t("title")}
								</h2>
								<span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-secondary text-text-primary">
									{item.service}
								</span>
							</div>
						</div>
					</div>
				</div>

				<div className="space-y-5 pt-5">
					{/* Status & Category */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-surface-secondary/80 p-3.5 rounded-xl border border-border-subtle">
						<div>
							<span className="text-[11px] font-semibold text-text-tertiary block mb-0.5">
								{t("status")}
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
									? t("statusSuccess")
									: item.status === "warning"
									? t("statusWarning")
									: t("statusError")}
							</span>
						</div>

						<div>
							<span className="text-[11px] font-semibold text-text-tertiary block mb-0.5">
								{t("category")}
							</span>
							<span className="font-mono text-xs font-semibold text-text-primary bg-surface border border-border-default px-1.5 py-0.2 rounded">
								{categoryLabel(item.category)}
							</span>
						</div>

						<div>
							<span className="text-[11px] font-semibold text-text-tertiary block mb-0.5">
								{t("timestamp")}
							</span>
							<span className="font-mono text-[11px] font-semibold text-text-primary">
								{formatFullTimestamp(item.timestamp)}
							</span>
						</div>
					</div>

					{/* Action description */}
					<div className="bg-surface p-4 rounded-xl border border-border-default/80">
						<span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block mb-1.5">
							{t("action")}
						</span>
						<p className="text-sm font-semibold text-text-primary leading-relaxed">
							{actionLabel(item.action)}
						</p>
						<div className="mt-2.5 pt-2.5 border-t border-border-subtle flex items-center gap-2 text-xs text-text-secondary">
							<span className="font-semibold text-text-tertiary">{t("resource")}</span>
							<code className="font-mono text-xs bg-surface-secondary px-2 py-0.5 rounded text-primary font-semibold border border-border-default/60">
								{item.target}
							</code>
						</div>
					</div>

					{/* Actor */}
					<div className="p-4 rounded-xl border border-border-default/80 space-y-2">
						<div className="flex items-center gap-2 text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
							<User className="w-3.5 h-3.5 text-primary" />
							<span>{t("actorTitle")}</span>
						</div>
						<div className="text-xs space-y-1.5">
							<div className="flex justify-between">
								<span className="text-text-secondary font-medium">{t("actorName")}</span>
								<span className="font-bold text-text-primary">
									{roleLabel(item.role)}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-text-secondary font-medium">{t("actorEmail")}</span>
								<span className="font-mono text-text-primary break-all">
									{item.actor.includes("@") ? item.actor : "—"}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-text-secondary font-medium">{t("role")}</span>
								<span className="font-bold text-primary">{roleLabel(item.role)}</span>
							</div>
						</div>
					</div>

					{/* Detailed system result from detailsJson */}
					<div className="p-4 rounded-xl bg-surface border border-border-default/80 text-xs space-y-2">
						<span className="font-bold text-text-primary block">
							{t("systemResult")}
						</span>

						{item.errorMessage && (
							<div className="rounded-lg bg-error/10 border border-error/30 p-2.5">
								<span className="font-bold text-error block mb-1">{t("error")}</span>
								<p className="font-mono text-error">{item.errorMessage}</p>
							</div>
						)}

						{hasSnapshot && (
							<div className="rounded-xl border border-border-default overflow-hidden">
								<SnapshotDiff
									before={snapshotBefore}
									after={snapshotAfter}
									hideIdFields
								/>
							</div>
						)}

						{flagEntries.length > 0 && (
							<div className="divide-y divide-border-subtle rounded-lg border border-border-default px-3">
								{flagEntries.map(([key, value]) => (
									<div
										key={key}
										className="flex items-start justify-between gap-4 py-1.5"
									>
										<span className="text-text-secondary font-medium">
											{detailLabels[key] ?? key}
										</span>
										<span
											className={
												value
													? "font-bold text-success"
													: "font-mono text-text-tertiary"
											}
										>
											{value ? t("flagYes") : t("flagNo")}
										</span>
									</div>
								))}
							</div>
						)}

						{metadataEntries.length > 0 && (
							<div className="divide-y divide-border-subtle">
								{metadataEntries.map(([key, value]) => (
									<div
										key={key}
										className="flex items-start justify-between gap-4 py-1.5"
									>
										<span className="text-text-secondary font-medium">
											{detailLabels[key] ?? key}
										</span>
										<span className="font-mono text-text-primary text-right break-all whitespace-pre-wrap max-w-[60%]">
											{formatDetailValue(key, value)}
										</span>
									</div>
								))}
							</div>
						)}

						{details && (
							<details className="border-t border-border-subtle pt-2">
								<summary className="cursor-pointer text-[10.5px] font-semibold text-primary">
									{t("rawJson")}
								</summary>
								<pre className="mt-1 max-h-64 overflow-auto whitespace-pre-wrap break-all rounded border border-border-subtle bg-surface-secondary p-2 font-mono text-[10.5px] text-text-secondary">
									{JSON.stringify(stripIdFields(details), null, 2)}
								</pre>
							</details>
						)}

						{!hasSnapshot &&
							flagEntries.length === 0 &&
							metadataEntries.length === 0 &&
							(typeof item.requestPayload !== "string" ||
								item.requestPayload.trim().length === 0) && (
								<p className="text-text-tertiary">{t("noDetails")}</p>
							)}

						{typeof item.requestPayload === "string" &&
							item.requestPayload.trim().length > 0 && (
								<pre className="font-mono text-[11px] text-text-secondary whitespace-pre-wrap break-all bg-surface-secondary p-2 rounded border border-border-subtle">
									{item.requestPayload}
								</pre>
							)}
					</div>
				</div>

				{/* Footer */}
				<div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between gap-3 flex-wrap">
					{/* Nút Xem trước & Hoàn tác (Rollback) */}
					<div className="flex-1">
						{canRollback && (
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsRollbackOpen(true)}
								className="h-9 px-3.5 rounded-xl border-warning/30 bg-warning/10 hover:bg-warning/10 text-warning font-semibold text-xs cursor-pointer gap-2 transition-all shadow-2xs hover:shadow-xs active:scale-[0.98]"
								title={t("rollbackTitle")}
							>
								<RotateCcw className="w-3.5 h-3.5 text-warning" />
								<span>{tAudit("rollbackBtn")}</span>
							</Button>
						)}
					</div>

					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="h-9 px-6 rounded-xl border-border-default text-text-primary hover:bg-surface-secondary text-xs font-semibold cursor-pointer"
					>
						{t("close")}
					</Button>
				</div>
			</AdminDialogContent>

			{/* Modal Xem trước & Hoàn tác (Rollback) */}
			{canRollback && (
				<AuditLogRollbackDialog
					item={item}
					open={isRollbackOpen}
					onOpenChange={setIsRollbackOpen}
					onSuccess={() => {
						onRollbackSuccess?.();
					}}
				/>
			)}
		</Dialog.Root>
	);
}
