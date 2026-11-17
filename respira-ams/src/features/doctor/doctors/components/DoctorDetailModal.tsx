"use client";

import Image from "next/image";
import {
	Loader2,
	User,
	GraduationCap,
	Briefcase,
	ShieldCheck,
	CreditCard,
	Calendar,
	MapPin,
	Mail,
	Phone,
	FileBarChart2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { useDoctorDetailModal } from "../queries";
import { type DoctorSubordinateItem } from "../types";
import {
	formatDoctorFullName,
	getAcademicTitleLabel,
	getAccountStatusLabel,
	getDoctorDegreeLabel,
	getDoctorGenderLabel,
	getDoctorPositionLabel,
	getDoctorRoleLabel,
} from "../constants";

interface DoctorDetailModalProps {
	doctorItem: DoctorSubordinateItem | null;
	isOpen: boolean;
	onClose: () => void;
	onCreateReport: (doctor: DoctorSubordinateItem) => void;
}

function formatDateLocalized(
	isoString: string | null | undefined,
	emptyText: string,
	locale: string
): string {
	if (!isoString) return emptyText;
	const d = new Date(isoString);
	if (Number.isNaN(d.getTime())) return isoString;
	const dateLocale = locale === "en" ? "en-GB" : "vi-VN";
	return d.toLocaleDateString(dateLocale, {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}

export function DoctorDetailModal({
	doctorItem,
	isOpen,
	onClose,
	onCreateReport,
}: DoctorDetailModalProps) {
	const locale = useLocale();
	const t = useTranslations("doctor.doctors");

	const doctorId = doctorItem?.id ?? null;
	const { data: detailData, isLoading } = useDoctorDetailModal(doctorId, {
		enabled: isOpen && !!doctorId,
	});

	const info = detailData ?? doctorItem;
	const notUpdatedText = t("detailModal.notUpdated");

	const formatName = (doc: {
		firstName: string;
		lastName: string;
		academicTitle?: string;
	}) => formatDoctorFullName(doc, (key) => t(`prefixes.${key}`));

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-2xl border-border bg-popover text-popover-foreground max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-xl font-bold text-foreground">
						{t("detailModal.title")}
					</DialogTitle>
				</DialogHeader>

				{isLoading && !info ? (
					<div className="flex justify-center py-12">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : !info ? (
					<div className="py-8 text-center text-sm font-medium text-destructive">
						{t("detailModal.loadError")}
					</div>
				) : (
					<div className="space-y-5 text-foreground">
						{/* Profile Header Card */}
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-muted/30 dark:bg-muted/20 p-4">
							<div className="flex items-center gap-3.5">
								{doctorItem?.avatarUrl ? (
									<Image
										src={doctorItem.avatarUrl}
										alt={formatName(info)}
										width={56}
										height={56}
										unoptimized
										className="h-14 w-14 rounded-full object-cover border border-border shrink-0"
									/>
								) : (
									<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-lg border border-primary/25">
										{info.lastName?.[0]}
										{info.firstName?.[0]}
									</div>
								)}

								<div className="space-y-1">
									<h3 className="text-lg font-bold text-foreground">
										{formatName(info)}
									</h3>
									<div className="flex flex-wrap items-center gap-2">
										<span className="inline-flex items-center rounded-md bg-primary/10 border border-primary/25 px-2 py-0.5 text-xs font-semibold text-primary">
											{getDoctorRoleLabel(info.role, (k) =>
												t(`role.${k}`)
											)}
										</span>

										{doctorItem?.accountStatus && (
											<span
												className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border ${
													doctorItem.accountStatus === "Active"
														? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
														: "bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-400"
												}`}
											>
												{getAccountStatusLabel(
													doctorItem.accountStatus,
													(k) => t(`accountStatus.${k}`)
												)}
											</span>
										)}
									</div>
								</div>
							</div>

							{doctorItem && (
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => {
										onClose();
										onCreateReport(doctorItem);
									}}
									className="gap-1.5 border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-800 dark:hover:text-emerald-300 self-start sm:self-center"
								>
									<FileBarChart2 className="h-4 w-4" />
									{t("detailModal.createReportButton")}
								</Button>
							)}
						</div>

						{/* Degrees Section */}
						<div className="space-y-2">
							<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
								<GraduationCap className="h-4 w-4 text-primary" />
								{t("detailModal.degreesTitle")}
							</span>
							<div className="flex flex-wrap gap-1.5">
								{info.degrees && info.degrees.length > 0 ? (
									info.degrees.map((deg, index) => (
										<span
											key={`${deg}-${index}`}
											className="inline-flex items-center rounded-md bg-sky-500/15 border border-sky-500/30 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300"
										>
											{getDoctorDegreeLabel(deg, (k) =>
												t(`degree.${k}`)
											)}
										</span>
									))
								) : (
									<span className="text-sm text-muted-foreground italic">
										{t("detailModal.noDegrees")}
									</span>
								)}
							</div>
						</div>

						{/* Detailed Information Grid */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-border bg-card text-card-foreground p-4 text-sm">
							<div className="space-y-1">
								<span className="text-xs text-muted-foreground flex items-center gap-1.5">
									<Briefcase className="h-3.5 w-3.5" />{" "}
									{t("detailModal.position")}
								</span>
								<p className="font-semibold text-foreground">
									{getDoctorPositionLabel(info.position, (k) =>
										t(`position.${k}`)
									)}
								</p>
							</div>

							<div className="space-y-1">
								<span className="text-xs text-muted-foreground flex items-center gap-1.5">
									<ShieldCheck className="h-3.5 w-3.5" />{" "}
									{t("detailModal.academicTitle")}
								</span>
								<p className="font-semibold text-foreground">
									{getAcademicTitleLabel(info.academicTitle, (k) =>
										t(`academicTitle.${k}`)
									)}
								</p>
							</div>

							<div className="space-y-1">
								<span className="text-xs text-muted-foreground flex items-center gap-1.5">
									<User className="h-3.5 w-3.5" />{" "}
									{t("detailModal.gender")}
								</span>
								<p className="font-medium text-foreground">
									{getDoctorGenderLabel(info.gender, (k) =>
										t(`gender.${k}`)
									)}
								</p>
							</div>

							<div className="space-y-1">
								<span className="text-xs text-muted-foreground flex items-center gap-1.5">
									<Calendar className="h-3.5 w-3.5" />{" "}
									{t("detailModal.dateOfBirth")}
								</span>
								<p className="font-medium text-foreground">
									{formatDateLocalized(
										info.dateOfBirth,
										notUpdatedText,
										locale
									)}
								</p>
							</div>

							<div className="space-y-1">
								<span className="text-xs text-muted-foreground flex items-center gap-1.5">
									<CreditCard className="h-3.5 w-3.5" />{" "}
									{t("detailModal.citizenId")}
								</span>
								<p className="font-mono font-medium text-foreground">
									{info.citizenIdentificationNumber || notUpdatedText}
								</p>
							</div>

							<div className="space-y-1">
								<span className="text-xs text-muted-foreground flex items-center gap-1.5">
									<Calendar className="h-3.5 w-3.5" />{" "}
									{t("detailModal.joinedDate")}
								</span>
								<p className="font-medium text-foreground">
									{formatDateLocalized(
										info.createdAt,
										notUpdatedText,
										locale
									)}
								</p>
							</div>

							{doctorItem?.email && (
								<div className="space-y-1">
									<span className="text-xs text-muted-foreground flex items-center gap-1.5">
										<Mail className="h-3.5 w-3.5" />{" "}
										{t("detailModal.email")}
									</span>
									<p className="font-medium text-foreground break-all">
										{doctorItem.email}
									</p>
								</div>
							)}

							{doctorItem?.phone && (
								<div className="space-y-1">
									<span className="text-xs text-muted-foreground flex items-center gap-1.5">
										<Phone className="h-3.5 w-3.5" />{" "}
										{t("detailModal.phone")}
									</span>
									<p className="font-medium text-foreground font-mono">
										{doctorItem.phone}
									</p>
								</div>
							)}

							<div className="space-y-1 sm:col-span-2">
								<span className="text-xs text-muted-foreground flex items-center gap-1.5">
									<MapPin className="h-3.5 w-3.5" />{" "}
									{t("detailModal.address")}
								</span>
								<p className="font-medium text-foreground">
									{info.address || notUpdatedText}
								</p>
							</div>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}