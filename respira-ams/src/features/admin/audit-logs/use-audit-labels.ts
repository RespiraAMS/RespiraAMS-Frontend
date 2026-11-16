"use client";

import { useTranslations } from "next-intl";

/**
 * Audit events arrive with technical action names (for example
 * `Clinical.ClinicalMetric.Updated`). The translation map lives in the message
 * files so the same payload renders in Vietnamese or English.
 */
export function useAuditActionLabel() {
	const t = useTranslations("admin.auditLogs");
	const knownActions = t.raw("actions") as Record<string, string> | undefined;

	return (rawAction?: string | null): string => {
		if (!rawAction) return "";
		// Message keys cannot contain "." (next-intl reserves it for nesting),
		// so the action map stores them with "__" instead.
		const key = rawAction.replace(/\./g, "__");
		return knownActions?.[key] ?? knownActions?.[rawAction] ?? rawAction;
	};
}

export function useAuditRoleLabel() {
	const t = useTranslations("admin.auditLogs");
	const knownRoles = t.raw("roles") as Record<string, string> | undefined;

	return (role?: string | null): string => {
		if (!role) return "";
		return knownRoles?.[role] ?? role;
	};
}

export function useAuditCategoryLabel() {
	const t = useTranslations("admin.auditLogs");
	const knownCategories = t.raw("categories") as Record<string, string> | undefined;

	return (category?: string | null): string => {
		if (!category) return "";
		return knownCategories?.[category] ?? category;
	};
}
