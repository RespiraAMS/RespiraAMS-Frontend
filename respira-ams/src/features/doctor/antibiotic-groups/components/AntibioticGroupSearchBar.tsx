"use client";

import { useEffect, useRef } from "react";
import { Search } from "lucide-react";

interface AntibioticGroupSearchBarProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
}

export function AntibioticGroupSearchBar({
	searchQuery,
	onSearchChange,
}: AntibioticGroupSearchBarProps) {
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
		<div
			style={{ borderRadius: "14px" }}
			className="bg-white rounded-[14px] border border-slate-100/90 shadow-2xs p-3 sm:p-3.5"
		>
			<div
				style={{ borderRadius: "10px" }}
				className="flex items-center h-[42px] bg-[#F8FAFC] border border-slate-200/70 rounded-[10px] px-3.5 focus-within:border-[#0EA5E9] focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-100 transition-all"
			>
				<Search className="h-3.5 w-3.5 text-slate-400 shrink-0 mr-2.5" />
				<input
					ref={inputRef}
					id="antibiotic-group-search-input"
					type="text"
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder="Tìm theo tên nhóm kháng sinh"
					className="w-full bg-transparent border-none outline-hidden text-xs text-slate-800 placeholder:text-slate-400"
				/>
				<span className="shrink-0 text-[9.5px] font-semibold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded-[4px] select-none ml-2 shadow-2xs">
					Ctrl + K
				</span>
			</div>
		</div>
	);
}
