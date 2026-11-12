"use client";

import { useState, useEffect } from "react";
import {
	GraduationCap,
	Award,
	Building2,
	CheckCircle2,
	BookOpen,
	Users,
	Search,
	Loader2,
	Stethoscope,
	Mail,
} from "lucide-react";
import {
	DoctorProfile,
	DEGREE_LABELS,
	POSITION_LABELS,
	ACADEMIC_TITLE_LABELS,
	getDoctorDisplayName,
} from "../types";
import { searchDoctorProfiles, fetchPagedDoctors } from "../api";

interface ProfileQualificationsCardProps {
	doctor: DoctorProfile;
}

export function ProfileQualificationsCard({ doctor }: ProfileQualificationsCardProps) {
	const [activeTab, setActiveTab] = useState<"qualifications" | "colleagues">("qualifications");

	// State cho phần tra cứu đồng nghiệp
	const [colleagueSearch, setColleagueSearch] = useState("");
	const [colleagues, setColleagues] = useState<DoctorProfile[]>([]);
	const [isLoadingColleagues, setIsLoadingColleagues] = useState(false);
	const [colleagueTotal, setColleagueTotal] = useState(0);

	useEffect(() => {
		if (activeTab !== "colleagues") return;

		let isMounted = true;
		setIsLoadingColleagues(true);

		const timer = setTimeout(() => {
			const fetcher = colleagueSearch.trim()
				? searchDoctorProfiles(colleagueSearch.trim(), 1, 6)
				: fetchPagedDoctors({ page: 1, size: 6 });

			fetcher
				.then((res) => {
					if (!isMounted) return;
					const items = "items" in res ? res.items : [];
					const total = "total" in res ? res.total : "totalCount" in res ? res.totalCount : items.length;
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

	const positionText = POSITION_LABELS[doctor.position] || doctor.position || "Bác sĩ điều trị";
	const academicTitleText =
		doctor.academicTitle && doctor.academicTitle !== "None"
			? ACADEMIC_TITLE_LABELS[doctor.academicTitle] || doctor.academicTitle
			: "Không có";

	return (
		<div className="rounded-[14px] border border-slate-200/80 bg-white p-6 shadow-2xs space-y-6">
			{/* ── Navigation Tabs ── */}
			<div className="flex items-center justify-between border-b border-slate-100 pb-3">
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => setActiveTab("qualifications")}
						className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[8px] text-xs font-semibold transition-all cursor-pointer ${
							activeTab === "qualifications"
								? "bg-[#E0F2FE] text-[#0369A1] shadow-2xs"
								: "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
						}`}
					>
						<GraduationCap className="h-4 w-4" />
						<span>Trình độ chuyên môn & Đào tạo</span>
					</button>

					<button
						type="button"
						onClick={() => setActiveTab("colleagues")}
						className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[8px] text-xs font-semibold transition-all cursor-pointer ${
							activeTab === "colleagues"
								? "bg-[#E0F2FE] text-[#0369A1] shadow-2xs"
								: "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
						}`}
					>
						<Users className="h-4 w-4" />
						<span>Danh bạ Bác sĩ đồng nghiệp</span>
					</button>
				</div>
			</div>

			{activeTab === "qualifications" ? (
				<div className="space-y-6">
					{/* ── 3 Summary Highlight Cards ── */}
					<div className="grid gap-3 sm:grid-cols-3">
						<div className="rounded-[10px] border border-slate-200/70 bg-slate-50/60 p-3.5">
							<div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
								<Building2 className="h-3.5 w-3.5 text-sky-500" />
								<span>Chức vụ chuyên môn</span>
							</div>
							<p className="mt-1.5 text-sm font-bold text-slate-800 tracking-tight">
								{positionText}
							</p>
							<p className="text-[11px] text-slate-500 mt-0.5">Vị trí công tác</p>
						</div>

						<div className="rounded-[10px] border border-slate-200/70 bg-slate-50/60 p-3.5">
							<div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
								<Award className="h-3.5 w-3.5 text-indigo-500" />
								<span>Học hàm khoa học</span>
							</div>
							<p className="mt-1.5 text-sm font-bold text-slate-800 tracking-tight">
								{academicTitleText}
							</p>
							<p className="text-[11px] text-slate-500 mt-0.5">Hội đồng chức danh</p>
						</div>

						<div className="rounded-[10px] border border-slate-200/70 bg-slate-50/60 p-3.5">
							<div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
								<Stethoscope className="h-3.5 w-3.5 text-emerald-500" />
								<span>Vai trò hệ thống</span>
							</div>
							<p className="mt-1.5 text-sm font-bold text-slate-800 tracking-tight">
								{doctor.role === "HeadDepartmentDoctor" ? "Bác sĩ Trưởng khoa" : "Bác sĩ chuyên môn"}
							</p>
							<p className="text-[11px] text-slate-500 mt-0.5">
								Trạng thái: {doctor.accountStatus || "Đang hoạt động"}
							</p>
						</div>
					</div>

					{/* ── Degrees & Academic Titles ── */}
					<div>
						<h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
							<GraduationCap className="h-4 w-4 text-sky-500" />
							<span>Học vị &amp; Văn bằng y khoa đã đạt được</span>
						</h3>

						<div className="grid gap-2.5 sm:grid-cols-2">
							{doctor.degrees && doctor.degrees.length > 0 ? (
								doctor.degrees.map((deg) => {
									const label = DEGREE_LABELS[deg] || deg;
									return (
										<div
											key={deg}
											className="flex items-center justify-between rounded-[10px] border border-slate-200/80 bg-white p-3 hover:border-sky-300 transition-all shadow-2xs"
										>
											<div className="flex items-center gap-2.5">
												<div className="h-8 w-8 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-bold text-xs">
													{deg.slice(0, 2).toUpperCase()}
												</div>
												<div>
													<p className="text-xs font-bold text-slate-800">{deg}</p>
													<p className="text-[11px] text-slate-500">{label}</p>
												</div>
											</div>
											<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700">
												<CheckCircle2 className="h-3 w-3 text-emerald-600" />
												Đã xác minh
											</span>
										</div>
									);
								})
							) : (
								<p className="text-xs text-slate-400 py-3 italic">
									Chưa cập nhật học vị hoặc bằng cấp y khoa.
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
							<h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
								Danh bạ Bác sĩ nội bộ ({colleagueTotal})
							</h3>
							<p className="text-[11.5px] text-slate-500">
								Tra cứu thông tin đồng nghiệp trong hệ thống Respira AMS
							</p>
						</div>

						{/* Search Input */}
						<div className="relative min-w-[220px]">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
							<input
								type="text"
								value={colleagueSearch}
								onChange={(e) => setColleagueSearch(e.target.value)}
								placeholder="Tìm theo tên hoặc email..."
								className="h-8 w-full rounded-[8px] border border-slate-200 bg-white pl-8 pr-3 text-xs placeholder:text-slate-400 focus:border-sky-500 focus:outline-hidden"
							/>
						</div>
					</div>

					{isLoadingColleagues ? (
						<div className="flex items-center justify-center py-10 text-slate-400 text-xs gap-2">
							<Loader2 className="h-4 w-4 animate-spin text-sky-500" />
							<span>Đang tải danh bạ bác sĩ...</span>
						</div>
					) : colleagues.length > 0 ? (
						<div className="grid gap-3 sm:grid-cols-2">
							{colleagues.map((item) => {
								const name = getDoctorDisplayName(item);
								const pos = POSITION_LABELS[item.position] || item.position || "Bác sĩ";
								const initial = item.firstName ? item.firstName.charAt(0).toUpperCase() : "B";
								return (
									<div
										key={item.id || item.doctorId}
										className="rounded-[10px] border border-slate-200/80 bg-white p-3 shadow-2xs hover:border-sky-300 transition-all"
									>
										<div className="flex items-center gap-3">
											<div className="h-9 w-9 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
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
												<p className="text-xs font-bold text-slate-900 truncate">
													{name}
												</p>
												<p className="text-[11px] text-slate-500 truncate">{pos}</p>
											</div>
										</div>
										{item.email && (
											<div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
												<Mail className="h-3 w-3 shrink-0 text-slate-400" />
												<a
													href={`mailto:${item.email}`}
													className="truncate hover:text-sky-600 hover:underline"
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
						<div className="text-center py-8 text-xs text-slate-400">
							Không tìm thấy bác sĩ phù hợp với từ khóa &quot;{colleagueSearch}&quot;.
						</div>
					)}
				</div>
			)}
		</div>
	);
}
