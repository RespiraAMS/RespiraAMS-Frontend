"use client";

import { useState, useEffect, useMemo } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
} from "@/components/ui/popover";

interface BirthDatePickerProps {
	id?: string;
	value: string;
	onChange: (dateStr: string) => void;
	placeholder?: string;
	required?: boolean;
}

export function BirthDatePicker({
	id = "patient-dob",
	value,
	onChange,
	placeholder = "12/08/1970",
	required = false,
}: BirthDatePickerProps) {
	const [isOpen, setIsOpen] = useState(false);

	// Parse date string (DD/MM/YYYY)
	const parsed = useMemo(() => {
		if (value && value.includes("/")) {
			const parts = value.split("/");
			if (parts.length === 3) {
				const d = parseInt(parts[0], 10);
				const m = parseInt(parts[1], 10) - 1;
				const y = parseInt(parts[2], 10);
				if (!isNaN(d) && !isNaN(m) && !isNaN(y) && y >= 1900 && m >= 0 && m < 12 && d >= 1 && d <= 31) {
					return { day: d, month: m, year: y };
				}
			}
		}
		return { day: 12, month: 7, year: 1970 };
	}, [value]);

	const [viewMonth, setViewMonth] = useState(parsed.month);
	const [viewYear, setViewYear] = useState(parsed.year);

	// Sync view date whenever popover opens or value changes
	useEffect(() => {
		setViewMonth(parsed.month);
		setViewYear(parsed.year);
	}, [parsed, isOpen]);

	// Month names in Vietnamese
	const monthNames = [
		"Tháng 1",
		"Tháng 2",
		"Tháng 3",
		"Tháng 4",
		"Tháng 5",
		"Tháng 6",
		"Tháng 7",
		"Tháng 8",
		"Tháng 9",
		"Tháng 10",
		"Tháng 11",
		"Tháng 12",
	];

	// Year range (1920 to 2026)
	const years = useMemo(() => {
		const list: number[] = [];
		for (let y = 2026; y >= 1920; y--) {
			list.push(y);
		}
		return list;
	}, []);

	// Calendar calculation
	const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
	const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

	// Day of week for 1st day of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
	// We want Monday first (0 = Mon, 6 = Sun)
	const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
	const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

	const handlePrevMonth = () => {
		if (viewMonth === 0) {
			setViewMonth(11);
			setViewYear((prev) => Math.max(1920, prev - 1));
		} else {
			setViewMonth((prev) => prev - 1);
		}
	};

	const handleNextMonth = () => {
		if (viewMonth === 11) {
			setViewMonth(0);
			setViewYear((prev) => Math.min(2026, prev + 1));
		} else {
			setViewMonth((prev) => prev + 1);
		}
	};

	const handleSelectDay = (day: number) => {
		const dd = String(day).padStart(2, "0");
		const mm = String(viewMonth + 1).padStart(2, "0");
		const yyyy = String(viewYear);
		onChange(`${dd}/${mm}/${yyyy}`);
		setIsOpen(false);
	};

	const isSelected = (day: number) => {
		return (
			day === parsed.day &&
			viewMonth === parsed.month &&
			viewYear === parsed.year
		);
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverAnchor asChild>
				<div className="relative w-full">
					<input
						id={id}
						type="text"
						value={value}
						onChange={(e) => onChange(e.target.value)}
						placeholder={placeholder}
						required={required}
						className="w-full h-10 pl-3.5 pr-10 bg-[#F6F8FA] border border-transparent focus:border-[#0EA5E9] focus:bg-white rounded-[10px] text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none transition-all"
					/>
					<button
						type="button"
						onClick={() => setIsOpen((prev) => !prev)}
						className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-[8px] flex items-center justify-center text-slate-400 hover:text-[#0EA5E9] hover:bg-sky-50 transition-all cursor-pointer"
						title="Mở lịch chọn ngày"
						id="btn-open-dob-calendar"
					>
						<CalendarIcon className="h-4 w-4 stroke-[1.8]" />
					</button>
				</div>
			</PopoverAnchor>

			<PopoverContent
				align="start"
				sideOffset={6}
				className="z-[9999] w-[290px] p-3 rounded-[14px] bg-white shadow-xl border border-slate-100 text-slate-800 outline-none"
			>
				{/* Calendar Navigation Header */}
				<div className="flex items-center justify-between gap-1 pb-2 border-b border-slate-100">
					<button
						type="button"
						onClick={handlePrevMonth}
						className="h-7 w-7 rounded-[7px] flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
						title="Tháng trước"
					>
						<ChevronLeft className="h-4 w-4" />
					</button>

					<div className="flex items-center gap-1.5">
						{/* Month Selector */}
						<select
							value={viewMonth}
							onChange={(e) => setViewMonth(Number(e.target.value))}
							className="h-7 px-1.5 bg-[#F6F8FA] hover:bg-slate-100 text-xs font-semibold text-slate-800 rounded-[6px] border-none outline-none cursor-pointer"
						>
							{monthNames.map((name, index) => (
								<option key={name} value={index}>
									{name}
								</option>
							))}
						</select>

						{/* Year Selector */}
						<select
							value={viewYear}
							onChange={(e) => setViewYear(Number(e.target.value))}
							className="h-7 px-1.5 bg-[#F6F8FA] hover:bg-slate-100 text-xs font-semibold text-slate-800 rounded-[6px] border-none outline-none cursor-pointer"
						>
							{years.map((y) => (
								<option key={y} value={y}>
									{y}
								</option>
							))}
						</select>
					</div>

					<button
						type="button"
						onClick={handleNextMonth}
						className="h-7 w-7 rounded-[7px] flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
						title="Tháng sau"
					>
						<ChevronRight className="h-4 w-4" />
					</button>
				</div>

				{/* Week Days Header */}
				<div className="grid grid-cols-7 gap-1 pt-2 pb-1 text-center text-[10px] font-bold text-slate-400 uppercase">
					<span>T2</span>
					<span>T3</span>
					<span>T4</span>
					<span>T5</span>
					<span>T6</span>
					<span>T7</span>
					<span>CN</span>
				</div>

				{/* Days Grid */}
				<div className="grid grid-cols-7 gap-1 text-center text-xs">
					{/* Previous month padding days */}
					{Array.from({ length: startOffset }).map((_, i) => {
						const prevDay = daysInPrevMonth - startOffset + i + 1;
						return (
							<span
								key={`prev-${i}`}
								className="h-7 flex items-center justify-center text-slate-300 text-[11px] select-none"
							>
								{prevDay}
							</span>
						);
					})}

					{/* Current month days */}
					{Array.from({ length: daysInMonth }).map((_, i) => {
						const day = i + 1;
						const active = isSelected(day);

						return (
							<button
								key={`day-${day}`}
								type="button"
								onClick={() => handleSelectDay(day)}
								className={`h-7 w-full rounded-[7px] flex items-center justify-center text-[11.5px] font-medium transition-all cursor-pointer ${
									active
										? "bg-[#0EA5E9] text-white font-bold shadow-2xs scale-105"
										: "text-slate-700 hover:bg-sky-50 hover:text-[#0EA5E9]"
								}`}
							>
								{day}
							</button>
						);
					})}
				</div>

				{/* Quick Footer */}
				<div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
					<button
						type="button"
						onClick={() => {
							const today = new Date();
							const dd = String(today.getDate()).padStart(2, "0");
							const mm = String(today.getMonth() + 1).padStart(2, "0");
							const yyyy = String(today.getFullYear());
							onChange(`${dd}/${mm}/${yyyy}`);
							setIsOpen(false);
						}}
						className="text-[#0EA5E9] hover:text-[#0284C7] font-semibold cursor-pointer"
					>
						Hôm nay
					</button>

					<button
						type="button"
						onClick={() => setIsOpen(false)}
						className="text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
					>
						Đóng
					</button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
