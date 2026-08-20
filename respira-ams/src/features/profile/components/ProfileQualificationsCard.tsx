"use client";

import { DoctorProfile } from "../types";

interface ProfileQualificationsCardProps {
	doctor: DoctorProfile;
}

export function ProfileQualificationsCard({ doctor }: ProfileQualificationsCardProps) {
	return (
		<section className="rounded-md border-2 bg-white p-6">
			{/* ── Section Title ── */}
			<h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-[#003461]">
				{/* Graduation cap icon (inline SVG to avoid external asset dependency) */}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-6 w-6 text-[#003461]"
					viewBox="0 0 24 24"
					fill="currentColor"
				>
					<path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
					<path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
				</svg>
				Trình độ chuyên môn &amp; Đào tạo
			</h2>

			<div className="mb-6 border-b-2" />

			{/* ── Position & Academic Title ── */}
			<div className="grid gap-4 md:grid-cols-3">
				<div className="rounded-md border border-gray-200 bg-slate-50 p-4">
					<div className="text-xs uppercase tracking-wide text-gray-500">Chức vụ</div>
					<div className="mt-2 font-medium text-[#003461]">
						{doctor.position || "Chưa cập nhật"}
					</div>
				</div>

				<div className="rounded-md border border-gray-200 bg-slate-50 p-4">
					<div className="text-xs uppercase tracking-wide text-gray-500">Học hàm</div>
					<div className="mt-2 font-medium text-[#003461]">
						{doctor.academicTitle || "Chưa cập nhật"}
					</div>
				</div>

				<div className="rounded-md border border-gray-200 bg-slate-50 p-4">
					<div className="text-xs uppercase tracking-wide text-gray-500">Chuyên khoa</div>
					<div className="mt-2 font-medium text-[#003461]">
						{doctor.specialty || "Chưa cập nhật"}
					</div>
				</div>
			</div>

			{/* ── Degrees ── */}
			<div className="mt-6">
				<h3 className="mb-3 font-medium text-gray-800">Học vị, bằng cấp</h3>

				<div className="grid gap-3 md:grid-cols-2">
					{doctor.degrees.length > 0 ? (
						doctor.degrees.map((degree) => (
							<div
								key={degree}
								className="rounded-md border border-gray-200 bg-slate-50 p-4"
							>
								<div className="font-medium text-[#003461]">{degree}</div>
							</div>
						))
					) : (
						<div className="rounded-md border border-gray-200 bg-slate-50 p-4 text-sm text-gray-500">
							Chưa cập nhật
						</div>
					)}
				</div>
			</div>

			{/* ── Certificates ── */}
			{doctor.certificates.length > 0 && (
				<div className="mt-6">
					<h3 className="mb-3 font-medium text-gray-800">Chứng chỉ hành nghề</h3>
					<div className="flex flex-wrap gap-2">
						{doctor.certificates.map((item) => (
							<div
								key={item}
								className="flex items-center gap-2 rounded border-2 border-gray-300 bg-gray-50 px-3 py-1 text-sm"
							>
								{/* Tick checkmark */}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4 text-emerald-600"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clipRule="evenodd"
									/>
								</svg>
								<span>{item}</span>
							</div>
						))}
					</div>
				</div>
			)}
		</section>
	);
}
