"use client";

import { useMemo } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MOCK_DOCTORS, type DoctorOption } from "../types";

interface DashboardFilterBarProps {
	selectedDoctorId: string | null;
	selectedYear: number;
	selectedMonth: number;
	onDoctorChange: (id: string | null) => void;
	onYearChange: (year: number) => void;
	onMonthChange: (month: number) => void;
}

export function DashboardFilterBar({
	selectedDoctorId,
	selectedYear,
	selectedMonth,
	onDoctorChange,
	onYearChange,
	onMonthChange,
}: DashboardFilterBarProps) {
	const [open, setOpen] = React.useState(false);

	const currentYear = new Date().getFullYear();
	const currentMonth = new Date().getMonth() + 1;

	const doctors: DoctorOption[] = MOCK_DOCTORS;

	const years = useMemo(() => {
		const arr = [];
		for (let y = currentYear; y >= 2025; y--) {
			arr.push(y);
		}
		return arr;
	}, [currentYear]);

	const months = useMemo(() => {
		const maxMonth =
			selectedYear === currentYear ? currentMonth : 12;
		const arr = [];
		for (let m = 1; m <= maxMonth; m++) {
			arr.push(m);
		}
		return arr;
	}, [selectedYear, currentYear, currentMonth]);

	const handleYearChange = (value: string) => {
		const y = parseInt(value);
		onYearChange(y);
		if (y === currentYear && selectedMonth > currentMonth) {
			onMonthChange(currentMonth);
		}
	};

	const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

	return (
		<Card className="shadow-sm">
			<CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
				{/* Doctor Filter */}
				<div className="space-y-1.5">
					<label className="text-xs font-bold text-zinc-600 uppercase">
						Lọc theo Bác sĩ
					</label>
					<Popover open={open} onOpenChange={setOpen}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								role="combobox"
								aria-expanded={open}
								id="dashboard-doctor-select"
								className="w-full justify-between h-auto py-3 bg-white"
							>
								{selectedDoctorId && selectedDoctor ? (
									<div className="flex flex-col items-start text-left">
										<span className="font-semibold text-[#0c3660]">
											{selectedDoctor.firstName} {selectedDoctor.lastName}
										</span>
										<span className="text-xs text-zinc-500 font-normal mt-0.5">
											{selectedDoctor.email} • {selectedDoctor.phoneNumber}
										</span>
									</div>
								) : (
									<span className="text-zinc-500">Tất cả Bác sĩ</span>
								)}
								<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-[300px] p-0" align="start">
							<Command>
								<CommandInput placeholder="Tìm bác sĩ..." />
								<CommandEmpty>Không tìm thấy bác sĩ.</CommandEmpty>
								<CommandList className="max-h-[300px] overflow-y-auto">
									<CommandGroup>
										<CommandItem
											value="all"
											onSelect={() => {
												onDoctorChange(null);
												setOpen(false);
											}}
											className="cursor-pointer"
										>
											<Check
												className={cn(
													"mr-2 h-4 w-4",
													selectedDoctorId === null
														? "opacity-100"
														: "opacity-0"
												)}
											/>
											<span className="font-semibold">Tất cả Bác sĩ</span>
										</CommandItem>

										{doctors.map((doc) => (
											<CommandItem
												key={doc.id}
												value={doc.id}
												onSelect={(currentValue) => {
													onDoctorChange(
														currentValue === selectedDoctorId ? null : doc.id
													);
													setOpen(false);
												}}
												className="cursor-pointer flex items-start py-3"
											>
												<Check
													className={cn(
														"mr-2 h-4 w-4 mt-1",
														selectedDoctorId === doc.id
															? "opacity-100 text-primary"
															: "opacity-0"
													)}
												/>
												<div className="flex flex-col flex-1">
													<span className="font-semibold text-zinc-900">
														{doc.firstName} {doc.lastName}
													</span>
													<span className="text-xs text-zinc-500 mt-1">
														Email: {doc.email}
													</span>
													<span className="text-xs text-zinc-500">
														SĐT: {doc.phoneNumber}
													</span>
												</div>
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				</div>

				{/* Year Filter */}
				<div className="space-y-1.5">
					<label className="text-xs font-bold text-zinc-600 uppercase">
						Năm
					</label>
					<Select
						value={String(selectedYear)}
						onValueChange={handleYearChange}
					>
						<SelectTrigger className="w-full" id="dashboard-year-select">
							<SelectValue />
						</SelectTrigger>
						<SelectContent position="popper" side="bottom">
							{years.map((y) => (
								<SelectItem key={y} value={String(y)}>
									{y}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Month Filter */}
				<div className="space-y-1.5">
					<label className="text-xs font-bold text-zinc-600 uppercase">
						Tháng
					</label>
					<Select
						value={String(selectedMonth)}
						onValueChange={(v) => onMonthChange(parseInt(v))}
					>
						<SelectTrigger className="w-full" id="dashboard-month-select">
							<SelectValue />
						</SelectTrigger>
						<SelectContent position="popper" side="bottom">
							{months.map((m) => (
								<SelectItem key={m} value={String(m)}>
									Tháng {m}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</CardContent>
		</Card>
	);
}
