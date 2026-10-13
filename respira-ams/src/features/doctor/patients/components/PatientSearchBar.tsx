"use client";

import { useEffect, useRef } from "react";
import { Search, Plus } from "lucide-react";

interface PatientSearchBarProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	onAddPatient: () => void;
}

export function PatientSearchBar({
	searchQuery,
	onSearchChange,
	onAddPatient,
}: PatientSearchBarProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				inputRef.current?.focus();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
		<div className="bg-white rounded-[14px] border border-slate-100/90 shadow-2xs p-3 sm:p-3.5 flex flex-col sm:flex-row items-center gap-3">
			{/* Search Input Box */}
			<div className="relative flex-1 w-full h-[42px] flex items-center bg-[#F8FAFC] border border-slate-200/70 rounded-[10px] px-3.5 focus-within:border-[#0EA5E9] focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-100 transition-all">
				<Search className="h-3.5 w-3.5 text-slate-400 shrink-0 mr-2.5" />
				<input
					ref={inputRef}
					type="text"
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder="Tìm theo họ tên, mã bệnh án (BA-2026-...)"
					className="w-full bg-transparent border-none outline-hidden text-xs text-slate-800 placeholder:text-slate-400"
					id="patient-search-input"
				/>
				<span className="shrink-0 text-[9.5px] font-semibold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded-[4px] select-none ml-2 shadow-2xs">
					Ctrl + K
				</span>
			</div>

			{/* Add Patient Button */}
			<button
				type="button"
				onClick={onAddPatient}
				className="w-full sm:w-auto h-[42px] shrink-0 inline-flex items-center justify-center gap-1.5 bg-[#0EA5E9] hover:bg-[#25B4F8] text-white text-xs font-semibold px-5 rounded-[10px] shadow-xs hover:shadow-md hover:shadow-sky-500/15 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
				id="btn-add-patient"
			>
				<Plus className="h-3.5 w-3.5" />
				<span>Thêm bệnh nhân</span>
			</button>
		</div>
	);
}
