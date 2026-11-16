"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface SnapshotDiffProps {
	before?: unknown;
	after?: unknown;
	/** Hide technical identifiers from the rendered diff. */
	hideIdFields?: boolean;
	/** Show unchanged fields on first render. */
	defaultShowUnchanged?: boolean;
	className?: string;
}

interface SnapshotRow {
	key: string;
	before: unknown;
	after: unknown;
	changed: boolean;
}

const ID_FIELD_KEYS = new Set([
	"id",
	"Id",
	"entityId",
	"EntityId",
	"accountId",
	"AccountId",
	"changeSetId",
	"ChangeSetId",
	"traceId",
	"TraceId",
	"correlationId",
	"CorrelationId",
]);

function parseSnapshot(value: unknown): unknown {
	if (typeof value !== "string") return value;

	const trimmed = value.trim();
	if (!trimmed) return undefined;

	try {
		return JSON.parse(trimmed);
	} catch {
		return value;
	}
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function stripIdFields(value: unknown): unknown {
	if (Array.isArray(value)) {
		return value.map(stripIdFields);
	}
	if (isPlainObject(value)) {
		const result: Record<string, unknown> = {};
		for (const [key, child] of Object.entries(value)) {
			if (!ID_FIELD_KEYS.has(key)) {
				result[key] = stripIdFields(child);
			}
		}
		return result;
	}
	return value;
}

function comparable(value: unknown): string {
	if (value === undefined) return "__undefined__";
	try {
		const serialized = JSON.stringify(value);
		return serialized === undefined ? String(value) : serialized;
	} catch {
		return String(value);
	}
}

function buildRows(before: unknown, after: unknown): SnapshotRow[] {
	const beforeObject = isPlainObject(before) ? before : null;
	const afterObject = isPlainObject(after) ? after : null;

	if (!beforeObject && !afterObject) {
		if (before === undefined && after === undefined) return [];
		return [
			{
				key: "value",
				before,
				after,
				changed: comparable(before) !== comparable(after),
			},
		];
	}

	const keys = Array.from(
		new Set([
			...Object.keys(beforeObject ?? {}),
			...Object.keys(afterObject ?? {}),
		])
	);

	return keys.map((key) => ({
		key,
		before: beforeObject?.[key],
		after: afterObject?.[key],
		changed: comparable(beforeObject?.[key]) !== comparable(afterObject?.[key]),
	}));
}

function DiffValue({ value }: { value: unknown }) {
	const t = useTranslations("admin.auditLogs.diff");

	if (value === undefined) {
		return <span className="text-text-tertiary">{t("emptyValue")}</span>;
	}
	if (value === null) {
		return <span className="text-text-tertiary">{t("nullValue")}</span>;
	}
	if (typeof value === "object") {
		return (
			<pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all text-[10.5px]">
				{JSON.stringify(value, null, 2)}
			</pre>
		);
	}
	return <span className="whitespace-pre-wrap break-all">{String(value)}</span>;
}

export function SnapshotDiff({
	before,
	after,
	hideIdFields = false,
	defaultShowUnchanged = false,
	className,
}: SnapshotDiffProps) {
	const t = useTranslations("admin.auditLogs.diff");
	const [showUnchanged, setShowUnchanged] = useState(defaultShowUnchanged);

	const parsedBefore = parseSnapshot(before);
	const parsedAfter = parseSnapshot(after);
	const displayBefore = hideIdFields ? stripIdFields(parsedBefore) : parsedBefore;
	const displayAfter = hideIdFields ? stripIdFields(parsedAfter) : parsedAfter;

	const rows = buildRows(displayBefore, displayAfter);
	const changedRows = rows.filter((row) => row.changed);
	const visibleRows = showUnchanged ? rows : changedRows;
	const hiddenUnchanged = rows.length - changedRows.length;

	return (
		<div className={className}>
			<div className="flex items-center justify-between gap-3 flex-wrap border-b border-border-subtle px-3 py-2">
				<span className="text-[11px] font-semibold text-text-secondary">
					{t("summary", { changed: changedRows.length, total: rows.length })}
				</span>
				{hiddenUnchanged > 0 && (
					<button
						type="button"
						onClick={() => setShowUnchanged((value) => !value)}
						className="cursor-pointer text-[10.5px] font-semibold text-primary hover:underline"
					>
						{showUnchanged
							? t("hideUnchanged")
							: t("showUnchanged", { count: hiddenUnchanged })}
					</button>
				)}
			</div>

			{visibleRows.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="w-full table-fixed text-[11px] font-mono">
						<colgroup>
							<col className="w-[22%]" />
							<col className="w-[39%]" />
							<col className="w-[39%]" />
						</colgroup>
						<thead>
							<tr className="bg-surface-secondary/70 text-text-secondary">
								<th className="px-3 py-2 text-left font-bold">{t("field")}</th>
								<th className="px-3 py-2 text-left font-bold text-error">{t("before")}</th>
								<th className="px-3 py-2 text-left font-bold text-success">{t("after")}</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border-subtle">
							{visibleRows.map((row) => (
								<tr
									key={row.key}
									className={row.changed ? "bg-warning/5" : "opacity-60"}
								>
									<td className="break-all px-3 py-2 align-top font-semibold text-text-primary">
										{row.key === "value" ? t("rowValue") : row.key}
									</td>
									<td
										className={`break-all px-3 py-2 align-top ${
											row.changed ? "text-error" : "text-text-secondary"
										}`}
									>
										<DiffValue value={row.before} />
									</td>
									<td
										className={`break-all px-3 py-2 align-top ${
											row.changed ? "text-success" : "text-text-secondary"
										}`}
									>
										<DiffValue value={row.after} />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<p className="px-3.5 py-3 text-[11px] text-text-tertiary">{t("noChanges")}</p>
			)}

			<details className="border-t border-border-subtle">
				<summary className="cursor-pointer px-3.5 py-2 text-[10.5px] font-semibold text-primary">
					{t("rawJson")}
				</summary>
				<div className="grid grid-cols-1 divide-y divide-border-default md:grid-cols-2 md:divide-x md:divide-y-0">
					<div className="p-3">
						<div className="mb-1.5 text-[10.5px] font-bold text-error">
							{t("currentValue")}
						</div>
						<pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all text-[10.5px] text-text-tertiary">
							{displayBefore === undefined
								? t("none")
								: JSON.stringify(displayBefore, null, 2)}
						</pre>
					</div>
					<div className="bg-background/50 p-3">
						<div className="mb-1.5 text-[10.5px] font-bold text-success">
							{t("targetValue")}
						</div>
						<pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all text-[10.5px] text-success">
							{displayAfter === undefined
								? t("none")
								: JSON.stringify(displayAfter, null, 2)}
						</pre>
					</div>
				</div>
			</details>
		</div>
	);
}

export default SnapshotDiff;
