"use client";

import { useTranslations } from "next-intl";

export function DiagnoseHeader() {
	const t = useTranslations("doctor.diagnose");

	return (
		<header className="text-center mb-8">
			<div className="w-[52px] h-[52px] mx-auto mb-3 rounded-2xl bg-linear-to-br from-[#0EA5E9] to-[#0284C7] flex items-center justify-center shadow-[0_6px_16px_rgba(14,165,233,0.25)]">
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="white"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="w-7 h-7"
				>
					<path d="M6 2v6a4 4 0 0 0 4 4h0a4 4 0 0 0 4-4V2" />
					<path d="M6 12v3a6 6 0 0 0 12 0v-3" />
					<circle cx="20" cy="10" r="2" />
				</svg>
			</div>
			<h1 className="text-2xl sm:text-[1.6rem] font-extrabold tracking-tight text-slate-900">
				{t("title", { defaultMessage: "Chẩn đoán kinh nghiệm Respira" })}
			</h1>
			<p className="text-slate-500 text-sm mt-1">
				{t("subtitle", { defaultMessage: "Nhập các chỉ số lâm sàng và cận lâm sàng để đánh giá mức độ nặng và dự đoán tác nhân gây bệnh" })}
			</p>
		</header>
	);
}
