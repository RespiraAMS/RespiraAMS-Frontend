"use client";

import { useState, useEffect } from "react";
import {
	GraduationCap,
	Award,
	Building2,
	CheckCircle2,
	Users,
	Search,
	Loader2,
	Stethoscope,
	Mail,
} from "lucide-react";
import { useTranslations } from "next-intl";

import {
	DoctorProfile,
	getDegreeLabel,
	getPositionLabel,
	getAcademicTitleLabel,
	getRoleLabel,
	getDoctorDisplayName,
} from "../types";
import { searchDoctorProfiles, fetchPagedDoctors } from "../api";

interface ProfileQualificationsCardProps {
	doctor: DoctorProfile;
}

export function ProfileQualificationsCard({
	doctor,
}: ProfileQualificationsCardProps) {
	const t = useTranslations("doctor.profile");
	const [activeTab, setActiveTab] = useState<"qualifications" | "colleagues">(
		"qualifications"
	);

	// State cho phần tra cứu đồng nghiệp
	const [colleagueSearch, setColleagueSearch] = useState("");
	const [colleagues, setColleagues] = useState<DoctorProfile[]>([]);
	const [isLoadingColleagues, setIsLoadingColleagues] = useState(false);
	const [colleagueTotal, setColleagueTotal] = useState(0);

	useEffect(() => {
		if (activeTab !== "colleagues") return;

		const searchTerm = colleagueSearch.trim();
		let isMounted = true;

		const timer = setTimeout(() => {
			if (!isMounted) return;
			setIsLoadingColleagues(true);

			const fetcher = searchTerm
				? searchDoctorProfiles(searchTerm, 1, 6)
				: fetchPagedDoctors({ page: 1, size: 6 });

			fetcher
				.then((res) => {
					if (!isMounted) return;
					const items = "items" in res ? res.items : [];
					const total =
						"total" in res
							? res.total
							: "totalCount" in res
								? res.totalCount
								: items.length;
					setColleagues(items);
					setColleagueTotal(total);
				})
				.catch(() => {
					if (!isMounted) return;
					setColleagues([]);
					setColleagueTotal(0);
				})
				.finally(() => {
					if (isMounted) setIsLoadingColleagues(false);
				});
		}, 200);

		return () => {
			isMounted = false;
			clearTimeout(timer);
		};
	}, [activeTab, colleagueSearch]);

	const positionText = getPositionLabel(doctor.position || "StaffDoctor", t);
	const academicTitleText =
		doctor.academicTitle && doctor.academicTitle !== "None"
			? getAcademicTitleLabel(doctor.academicTitle, t)
			: t("academicTitles.None");
	const roleText = getRoleLabel(doctor.role || "Doctor", t);
	const fallbackChar = t("initialsFallback").charAt(0) || "B";

	return (
		<div className="rounded-[14px] border border-border bg-card text-card-foreground p-6 shadow-2xs space-y-6">
			{/* ── Navigation Tabs ── */}
			<div className="flex items-center justify-between border-b border-border pb-3">
				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						onClick={() => setActiveTab("qualifications")}
						className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[8px] text-xs font-semibold transition-all cursor-pointer ${
							activeTab === "qualifications"
								? "bg-primary/15 text-primary shadow-2xs"
								: "text-muted-foreground hover:text-foreground hover:bg-muted/60"
						}`}
					>
						<GraduationCap className="h-4 w-4" />
						<span>{t("qualificationsCard.tabs.qualifications")}</span>
					</button>

					<button
						type="button"
						onClick={() => setActiveTab("colleagues")}
						className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[8px] text-xs font-semibold transition-all cursor-pointer ${
							activeTab === "colleagues"
								? "bg-primary/15 text-primary shadow-2xs"
								: "text-muted-foreground hover:text-foreground hover:bg-muted/60"
						}`}
					>
						<Users className="h-4 w-4" />
						<span>{t("qualificationsCard.tabs.colleagues")}</span>
					</button>
				</div>
			</div>

			{activeTab === "qualifications" ? (
				<div className="space-y-6">
					{/* ── 3 Summary Highlight Cards ── */}
					<div className="grid gap-3 sm:grid-cols-3">
						<div className="rounded-[10px] border border-border bg-muted/40 p-3.5">
							<div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
								<Building2 className="h-3.5 w-3.5 text-sky-500 dark:text-sky-400" />
								<span>{t("qualificationsCard.summary.positionLabel")}</span>
							</div>
							<p className="mt-1.5 text-sm font-bold text-foreground tracking-tight">
								{positionText}
							</p>
							<p className="text-[11px] text-muted-foreground mt-0.5">
								{t("qualificationsCard.summary.positionSub")}
							</p>
						</div>

						<div className="rounded-[10px] border border-border bg-muted/40 p-3.5">
							<div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
								<Award className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
								<span>
									{t("qualificationsCard.summary.academicTitleLabel")}
								</span>
							</div>
							<p className="mt-1.5 text-sm font-bold text-foreground tracking-tight">
								{academicTitleText}
							</p>
							<p className="text-[11px] text-muted-foreground mt-0.5">
								{t("qualificationsCard.summary.academicTitleSub")}
							</p>
						</div>

						<div className="rounded-[10px] border border-border bg-muted/40 p-3.5">
							<div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
								<Stethoscope className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
								<span>{t("qualificationsCard.summary.roleLabel")}</span>
							</div>
							<p className="mt-1.5 text-sm font-bold text-foreground tracking-tight">
								{roleText}
							</p>
							<p className="text-[11px] text-muted-foreground mt-0.5">
								{t("qualificationsCard.summary.statusPrefix", {
									status:
										doctor.accountStatus || t("avatarCard.activeStatus"),
								})}
							</p>
						</div>
					</div>

					{/* ── Degrees & Academic Titles ── */}
					<div>
						<h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
							<GraduationCap className="h-4 w-4 text-primary" />
							<span>{t("qualificationsCard.degrees.title")}</span>
						</h3>

						<div className="grid gap-2.5 sm:grid-cols-2">
							{doctor.degrees && doctor.degrees.length > 0 ? (
								doctor.degrees.map((deg) => {
									const label = getDegreeLabel(deg, t);
									return (
										<div
											key={deg}
											className="flex items-center justify-between rounded-[10px] border border-border bg-card p-3 hover:border-primary/50 transition-all shadow-2xs"
										>
											<div className="flex items-center gap-2.5">
												<div className="h-8 w-8 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs">
													{deg.slice(0, 2).toUpperCase()}
												</div>
												<div>
													<p className="text-xs font-bold text-foreground">
														{deg}
													</p>
													<p className="text-[11px] text-muted-foreground">
														{label}
													</p>
												</div>
											</div>
											{/* <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700 dark:text-emerald-400">
												<CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
												{t("qualificationsCard.degrees.verified")}
											</span> */}
										</div>
									);
								})
							) : (
								<p className="text-xs text-muted-foreground py-3 italic">
									{t("qualificationsCard.degrees.empty")}
								</p>
							)}
						</div>
					</div>
				</div>
			) : (
				/* ── Tab: Colleagues Directory ── */
				<div className="space-y-4">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
						<div>
							<h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
								{t("qualificationsCard.colleagues.title", {
									count: colleagueTotal,
								})}
							</h3>
							<p className="text-[11.5px] text-muted-foreground">
								{t("qualificationsCard.colleagues.subtitle")}
							</p>
						</div>

						{/* Search Input */}
						<div className="relative min-w-[220px]">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
							<input
								type="text"
								value={colleagueSearch}
								onChange={(e) => setColleagueSearch(e.target.value)}
								placeholder={t(
									"qualificationsCard.colleagues.searchPlaceholder"
								)}
								className="h-8 w-full rounded-[8px] border border-input bg-background text-foreground pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
							/>
						</div>
					</div>

					{isLoadingColleagues ? (
						<div className="flex items-center justify-center py-10 text-muted-foreground text-xs gap-2">
							<Loader2 className="h-4 w-4 animate-spin text-primary" />
							<span>{t("qualificationsCard.colleagues.loading")}</span>
						</div>
					) : colleagues.length > 0 ? (
						<div className="grid gap-3 sm:grid-cols-2">
							{colleagues.map((item) => {
								const name = getDoctorDisplayName(item, t);
								const pos = getPositionLabel(
									item.position || "StaffDoctor",
									t
								);
								const initial = item.firstName
									? item.firstName.charAt(0).toUpperCase()
									: fallbackChar;
								return (
									<div
										key={item.id || item.doctorId}
										className="rounded-[10px] border border-border bg-card p-3 shadow-2xs hover:border-primary/50 transition-all"
									>
										<div className="flex items-center gap-3">
											<div className="h-9 w-9 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
												{item.mediaUrl ? (
													<img
														src={item.mediaUrl}
														alt={name}
														className="h-full w-full object-cover"
													/>
												) : (
													initial
												)}
											</div>
											<div className="min-w-0 flex-1">
												<p className="text-xs font-bold text-foreground truncate">
													{name}
												</p>
												<p className="text-[11px] text-muted-foreground truncate">
													{pos}
												</p>
											</div>
										</div>
										{item.email && (
											<div className="mt-2.5 pt-2 border-t border-border flex items-center gap-1.5 text-[11px] text-muted-foreground truncate">
												<Mail className="h-3 w-3 shrink-0 text-muted-foreground/80" />
												<a
													href={`mailto:${item.email}`}
													className="truncate hover:text-primary hover:underline"
												>
													{item.email}
												</a>
											</div>
										)}
									</div>
								);
							})}
						</div>
					) : (
						<div className="text-center py-8 text-xs text-muted-foreground">
							{colleagueSearch.trim()
								? t("qualificationsCard.colleagues.emptySearch", {
										query: colleagueSearch,
									})
								: t("qualificationsCard.colleagues.emptyDefault")}
						</div>
					)}
				</div>
			)}
		</div>
	);
}