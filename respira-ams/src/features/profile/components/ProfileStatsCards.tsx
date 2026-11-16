"use client";

import { DoctorProfile, POSITION_LABELS, ACADEMIC_TITLE_LABELS } from "../types";
import { Building2, GraduationCap, ShieldCheck } from "lucide-react";

interface ProfileStatsCardsProps {
	doctor: DoctorProfile;
}

export function ProfileStatsCards({ doctor }: ProfileStatsCardsProps) {
	const positionText = POSITION_LABELS[doctor.position] || doctor.position || "Bác sĩ điều trị";
	const academicTitleText =
		doctor.academicTitle && doctor.academicTitle !== "None"
			? ACADEMIC_TITLE_LABELS[doctor.academicTitle] || doctor.academicTitle
			: "Chưa xét học hàm";
	const primaryDegree = doctor.degrees?.[0] ? doctor.degrees[0] : "Bác sĩ";

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
			{/* Card 1: Chức vụ & Khoa công tác */}
			<div className="bg-white rounded-[12px] px-5 py-4 text-left border border-slate-100 shadow-2xs hover:shadow-xs transition-all">
				<div className="flex items-center justify-between">
					<p className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
						Vị trí công tác
					</p>
					<div className="h-7 w-7 rounded-full bg-[#E0F2FE] text-[#0EA5E9] flex items-center justify-center">
						<Building2 className="h-3.5 w-3.5" />
					</div>
				</div>
				<p className="text-lg font-bold text-slate-900 mt-1.5 tracking-tight truncate">
					{positionText}
				</p>
				<p className="text-[11.5px] font-medium text-slate-500 truncate mt-0.5">
					{doctor.role === "HeadDepartmentDoctor" ? "Bác sĩ Trưởng khoa" : "Bác sĩ chuyên môn"}
				</p>
				<div className="h-1 w-20 bg-[#0EA5E9] rounded-full mt-2.5" />
			</div>

			{/* Card 2: Trình độ & Bằng cấp cao nhất */}
			<div className="bg-white rounded-[12px] px-5 py-4 text-left border border-slate-100 shadow-2xs hover:shadow-xs transition-all">
				<div className="flex items-center justify-between">
					<p className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
						Học hàm & Bằng cấp
					</p>
					<div className="h-7 w-7 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
						<GraduationCap className="h-3.5 w-3.5" />
					</div>
				</div>
				<p className="text-lg font-bold text-[#4F46E5] mt-1.5 tracking-tight truncate">
					{primaryDegree} {academicTitleText !== "Chưa xét học hàm" ? `• ${academicTitleText}` : ""}
				</p>
				<p className="text-[11.5px] font-medium text-slate-500 truncate mt-0.5">
					{doctor.degrees?.length || 1} Văn bằng y khoa đã ghi nhận
				</p>
				<div className="h-1 w-14 bg-[#4F46E5] rounded-full mt-2.5" />
			</div>

			{/* Card 3: Trạng thái chứng chỉ & Xác thực */}
			<div className="bg-white rounded-[12px] px-5 py-4 text-left border border-slate-100 shadow-2xs hover:shadow-xs transition-all">
				<div className="flex items-center justify-between">
					<p className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
						Trạng thái hồ sơ
					</p>
					<div className="h-7 w-7 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
						<ShieldCheck className="h-3.5 w-3.5" />
					</div>
				</div>
				<div className="flex items-center gap-2 mt-1.5">
					<span className="inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2.5 py-0.5 text-xs font-bold text-[#059669]">
						<span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
						{doctor.accountStatus ? `Đang hoạt động (${doctor.accountStatus})` : "Đang hoạt động"}
					</span>
				</div>
				<p className="text-[11.5px] font-medium text-slate-500 truncate mt-1">
					Tài khoản: {doctor.email || "Đã liên kết SSO"}
				</p>
				<div className="h-1 w-10 bg-[#10B981] rounded-full mt-2.5" />
			</div>
		</div>
	);
}

