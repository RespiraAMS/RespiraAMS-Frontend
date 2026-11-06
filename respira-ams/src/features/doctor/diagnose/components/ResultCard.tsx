import { ReactNode } from "react";

interface ResultCardProps {
	step: number;
	title: string;
	children: ReactNode;
	headingClassName?: string;
}

/** Thẻ kết quả có tiêu đề đánh số bước, dùng chung cho các khối trong trang kết quả. */
export function ResultCard({ step, title, children, headingClassName = "mb-4" }: ResultCardProps) {
	return (
		<div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
			<h2
				className={`flex items-center gap-2.5 text-[1.05rem] font-bold pb-3.5 border-b border-slate-200 text-slate-900 ${headingClassName}`}
			>
				<span className="h-6 w-6 rounded-full bg-[#0EA5E9] text-white flex items-center justify-center text-xs font-extrabold shrink-0">
					{step}
				</span>
				{title}
			</h2>
			{children}
		</div>
	);
}

export function ResultRow({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className="flex items-center justify-between gap-4 p-3 bg-[#FBFCFE] border border-slate-200 rounded-xl">
			<span className="text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[120px]">
				{label}
			</span>
			{children}
		</div>
	);
}

