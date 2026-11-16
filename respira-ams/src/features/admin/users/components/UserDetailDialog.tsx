"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import {
	Mail,
	Phone,
	Calendar,
	MapPin,
	CreditCard,
	Award,
	CheckCircle2,
	Lock,
} from "lucide-react";
import {
	Dialog,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { UserDialogContent } from "./UserDialogContent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserItem } from "../types";
import { formatDate, formatFullNameWithTitle } from "../utils";

interface UserDetailDialogProps {
	user: UserItem | null;
	isOpen: boolean;
	onClose: () => void;
}

export function UserDetailDialog({ user, isOpen, onClose }: UserDetailDialogProps) {
	const t = useTranslations("admin.users.detail");
	const tForm = useTranslations("admin.users.form");
	const locale = useLocale();

	if (!user) return null;

	const positionLabels =
		(tForm.raw("positions") as Record<string, string> | undefined) ?? {};
	const academicTitleLabels =
		(tForm.raw("academicTitles") as Record<string, string> | undefined) ?? {};
	const degreeLabels = (tForm.raw("degrees") as Record<string, string> | undefined) ?? {};

	const roleLabel = (role: UserItem["role"]): string => {
		if (role === "Admin") return tForm("roleAdmin");
		if (role === "Manager") return tForm("roleManager");
		if (role === "HeadDepartmentDoctor") return tForm("roleHeadDoctor");
		return tForm("roleDoctor");
	};

	const initials =
		`${user.lastName[0] || ""}${user.firstName[0] || ""}`.toUpperCase() ||
		user.email.slice(0, 2).toUpperCase();
	const displayName =
		formatFullNameWithTitle(
			user.lastName,
			user.firstName,
			user.academicTitle,
			user.degrees,
			locale
		) || user.email;

	const degreesText =
		user.degrees && user.degrees.length > 0
			? user.degrees.map((degree) => degreeLabels[degree] ?? degree).join(", ")
			: t("none");

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<UserDialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle className="text-base font-bold text-text-primary dark:text-primary-foreground">
						{t("title")}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-6 pt-3">
					{/* Header banner */}
					<div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-info/10 dark:from-background dark:to-surface border border-primary/30 dark:border-border-default">
						<Avatar className="h-16 w-16 border-2 border-surface shadow-md">
							{user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={displayName} />}
							<AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
								{initials || "U"}
							</AvatarFallback>
						</Avatar>

						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2 flex-wrap">
								<h3 className="text-base font-extrabold text-text-primary dark:text-primary-foreground truncate">
									{displayName}
								</h3>
								<Badge
									variant="outline"
									className="bg-surface/80 dark:bg-surface font-bold text-xs"
								>
									{roleLabel(user.role)}
								</Badge>
							</div>
							<p className="text-xs text-text-secondary mt-0.5">
								{positionLabels[user.position] || user.position}
							</p>
							<div className="flex items-center gap-2 mt-2">
								{user.status === "Active" ? (
									<span className="inline-flex items-center gap-1 text-[11px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
										<CheckCircle2 className="w-3 h-3" />
										{t("active")}
									</span>
								) : (
									<span className="inline-flex items-center gap-1 text-[11px] font-bold text-error bg-error/10 px-2 py-0.5 rounded-full">
										<Lock className="w-3 h-3" />
										{t("locked")}
									</span>
								)}
								{user.isEmailConfirmed && (
									<span className="text-[11px] font-medium text-text-tertiary">
										• {t("emailVerified")}
									</span>
								)}
							</div>
						</div>
					</div>

					{/* Information Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
						<div className="p-3.5 rounded-xl bg-surface-secondary dark:bg-background/40 border border-border-default/80 dark:border-border-default space-y-1">
							<div className="flex items-center gap-1.5 text-text-tertiary font-semibold uppercase tracking-wider text-[10px]">
								<Mail className="w-3.5 h-3.5 text-text-tertiary" />
								<span>{t("email")}</span>
							</div>
							<p className="font-bold text-text-primary dark:text-primary-foreground text-sm break-all">
								{user.email}
							</p>
						</div>

						<div className="p-3.5 rounded-xl bg-surface-secondary dark:bg-background/40 border border-border-default/80 dark:border-border-default space-y-1">
							<div className="flex items-center gap-1.5 text-text-tertiary font-semibold uppercase tracking-wider text-[10px]">
								<Phone className="w-3.5 h-3.5 text-text-tertiary" />
								<span>{t("phone")}</span>
							</div>
							<p className="font-bold text-text-primary dark:text-primary-foreground text-sm">
								{user.phone || "—"}
							</p>
						</div>

						<div className="p-3.5 rounded-xl bg-surface-secondary dark:bg-background/40 border border-border-default/80 dark:border-border-default space-y-1">
							<div className="flex items-center gap-1.5 text-text-tertiary font-semibold uppercase tracking-wider text-[10px]">
								<CreditCard className="w-3.5 h-3.5 text-text-tertiary" />
								<span>{t("citizenId")}</span>
							</div>
							<p className="font-bold text-text-primary dark:text-primary-foreground text-sm">
								{user.citizenIdentificationNumber || "—"}
							</p>
						</div>

						<div className="p-3.5 rounded-xl bg-surface-secondary dark:bg-background/40 border border-border-default/80 dark:border-border-default space-y-1">
							<div className="flex items-center gap-1.5 text-text-tertiary font-semibold uppercase tracking-wider text-[10px]">
								<Calendar className="w-3.5 h-3.5 text-text-tertiary" />
								<span>{t("dobGender")}</span>
							</div>
							<p className="font-bold text-text-primary dark:text-primary-foreground text-sm">
								{formatDate(user.dateOfBirth, locale)} (
								{user.gender === "Male" ? tForm("male") : tForm("female")})
							</p>
						</div>

						<div className="sm:col-span-2 p-3.5 rounded-xl bg-surface-secondary dark:bg-background/40 border border-border-default/80 dark:border-border-default space-y-1">
							<div className="flex items-center gap-1.5 text-text-tertiary font-semibold uppercase tracking-wider text-[10px]">
								<MapPin className="w-3.5 h-3.5 text-text-tertiary" />
								<span>{t("addressDept")}</span>
							</div>
							<p className="font-semibold text-text-primary dark:text-text-tertiary text-xs">
								{user.address || "—"}
							</p>
						</div>

						<div className="p-3.5 rounded-xl bg-surface-secondary dark:bg-background/40 border border-border-default/80 dark:border-border-default space-y-1">
							<div className="flex items-center gap-1.5 text-text-tertiary font-semibold uppercase tracking-wider text-[10px]">
								<Award className="w-3.5 h-3.5 text-text-tertiary" />
								<span>{t("academicTitle")}</span>
							</div>
							<p className="font-bold text-text-primary dark:text-primary-foreground text-sm">
								{academicTitleLabels[user.academicTitle] || t("none")}
							</p>
						</div>

						<div className="p-3.5 rounded-xl bg-surface-secondary dark:bg-background/40 border border-border-default/80 dark:border-border-default space-y-1">
							<div className="flex items-center gap-1.5 text-text-tertiary font-semibold uppercase tracking-wider text-[10px]">
								<Award className="w-3.5 h-3.5 text-text-tertiary" />
								<span>{t("degrees")}</span>
							</div>
							<p className="font-bold text-text-primary dark:text-primary-foreground text-sm">
								{degreesText}
							</p>
						</div>
					</div>

					{/* Metadata */}
					<div className="flex items-center justify-between pt-2 border-t border-border-subtle dark:border-border-default text-[11px] text-text-tertiary">
						<span>ID: {user.id}</span>
						<span>{t("createdAt", { date: formatDate(user.createdAt, locale) })}</span>
					</div>
				</div>
			</UserDialogContent>
		</Dialog>
	);
}
