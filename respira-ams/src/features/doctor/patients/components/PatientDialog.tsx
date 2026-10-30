"use client";

import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Check } from "lucide-react";
import { Patient, PatientStatus, PatientRisk } from "../types";
import { BirthDatePicker } from "./BirthDatePicker";

interface PatientDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialData?: Patient | null;
	onSave: (patient: Patient) => void;
}

export function PatientDialog({
	open,
	onOpenChange,
	initialData,
	onSave,
}: PatientDialogProps) {
	const [name, setName] = useState("");
	const [code, setCode] = useState("");
	const [birthDate, setBirthDate] = useState("");
	const [gender, setGender] = useState<"Nam" | "Nữ">("Nam");
	const [bhyt, setBhyt] = useState("");
	const [address, setAddress] = useState("");

	useEffect(() => {
		if (initialData) {
			setName(initialData.name);
			setCode(initialData.code);
			setBirthDate(initialData.birthDate ?? "12/08/1970");
			setGender(initialData.gender);
			setBhyt(initialData.bhyt ?? "DN  4  01  0012345678");
			setAddress(initialData.address ?? "Ninh Kiều, Cần Thơ");
		} else {
			setName("Nguyễn Minh Khôi");
			setCode("BA-2026-0231");
			setBirthDate("12/08/1970");
			setGender("Nam");
			setBhyt("DN  4  01  0012345678");
			setAddress("Ninh Kiều, Cần Thơ");
		}
	}, [initialData, open]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		// Calculate rough age from birth date if available (e.g., DD/MM/YYYY)
		let age = 55;
		if (birthDate.includes("/")) {
			const parts = birthDate.split("/");
			const birthYear = Number(parts[2]);
			if (!isNaN(birthYear) && birthYear > 1900) {
				age = Math.max(1, 2026 - birthYear);
			}
		}

		const patientToSave: Patient = {
			id: initialData?.id ?? String(Date.now()),
			name: name.trim(),
			code: code.trim() || `BA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
			age,
			gender,
			birthDate: birthDate.trim() || "12/08/1970",
			bhyt: bhyt.trim(),
			address: address.trim(),
			weightHeight: initialData?.weightHeight ?? "62kg - 182cm",
			status: initialData?.status ?? ("treating" as PatientStatus),
			risk: initialData?.risk ?? ("normal" as PatientRisk),
			diagnosis: initialData?.diagnosis ?? "Viêm phổi mắc phải cộng đồng (CAP)",
			room: initialData?.room ?? "P.302",
			admissionDate: initialData?.admissionDate ?? "01/08/2026",
			timeline: initialData?.timeline,
		};

		onSave(patientToSave);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px] w-full rounded-[18px] bg-white p-6 shadow-2xl border-none outline-none">
				{/* Dialog Header */}
				<DialogHeader className="pb-3 border-b border-slate-100 text-left">
					<DialogTitle className="text-[17px] font-bold text-slate-900 tracking-tight">
						{initialData ? "Chỉnh sửa thông tin bệnh nhân" : "Thêm bệnh nhân mới"}
					</DialogTitle>
					<p className="text-xs text-slate-400 mt-0.5">
						Nhập thông tin hồ sơ bệnh nhân vào hệ thống
					</p>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4 pt-1">
					{/* Row 1: Name and Code */}
					<div className="grid grid-cols-2 gap-3.5">
						<div className="space-y-1.5">
							<label
								htmlFor="patient-name"
								className="text-[11.5px] font-semibold text-slate-700 block"
							>
								Họ và tên <span className="text-red-500 font-bold">*</span>
							</label>
							<input
								id="patient-name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Nguyễn Minh Khôi"
								required
								className="w-full h-10 px-3.5 bg-[#F6F8FA] border border-transparent focus:border-[#0EA5E9] focus:bg-white rounded-[10px] text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none transition-all"
							/>
						</div>

						<div className="space-y-1.5">
							<label
								htmlFor="patient-code"
								className="text-[11.5px] font-semibold text-slate-700 block"
							>
								Mã bệnh án <span className="text-red-500 font-bold">*</span>
							</label>
							<input
								id="patient-code"
								type="text"
								value={code}
								onChange={(e) => setCode(e.target.value)}
								placeholder="BA-2026-0231"
								required
								className="w-full h-10 px-3.5 bg-[#F6F8FA] border border-transparent focus:border-[#0EA5E9] focus:bg-white rounded-[10px] text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none transition-all font-mono"
							/>
						</div>
					</div>

					{/* Row 2: DOB and Gender */}
					<div className="grid grid-cols-2 gap-3.5">
						<div className="space-y-1.5">
							<label
								htmlFor="patient-dob"
								className="text-[11.5px] font-semibold text-slate-700 block"
							>
								Ngày sinh <span className="text-red-500 font-bold">*</span>
							</label>
							<BirthDatePicker
								id="patient-dob"
								value={birthDate}
								onChange={setBirthDate}
								placeholder="12/08/1970"
								required
							/>
						</div>

						<div className="space-y-1.5">
							<label className="text-[11.5px] font-semibold text-slate-700 block">
								Giới tính <span className="text-red-500 font-bold">*</span>
							</label>
							<div className="grid grid-cols-2 gap-2">
								{/* Nam button */}
								<button
									type="button"
									onClick={() => setGender("Nam")}
									className={`h-10 rounded-[10px] flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer transition-all ${
										gender === "Nam"
											? "bg-[#E0F2FE] border border-[#7DD3FC] text-[#0284C7] shadow-2xs"
											: "bg-[#F6F8FA] border border-transparent text-slate-500 hover:bg-slate-100"
									}`}
								>
									<span
										className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
											gender === "Nam"
												? "border-2 border-[#0EA5E9]"
												: "border border-slate-300"
										}`}
									>
										{gender === "Nam" && (
											<span className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9]" />
										)}
									</span>
									<span>Nam</span>
								</button>

								{/* Nu button */}
								<button
									type="button"
									onClick={() => setGender("Nữ")}
									className={`h-10 rounded-[10px] flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer transition-all ${
										gender === "Nữ"
											? "bg-[#E0F2FE] border border-[#7DD3FC] text-[#0284C7] shadow-2xs"
											: "bg-[#F6F8FA] border border-transparent text-slate-500 hover:bg-slate-100"
									}`}
								>
									<span
										className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
											gender === "Nữ"
												? "border-2 border-[#0EA5E9]"
												: "border border-slate-300"
										}`}
									>
										{gender === "Nữ" && (
											<span className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9]" />
										)}
									</span>
									<span>Nữ</span>
								</button>
							</div>
						</div>
					</div>

					{/* Row 3: BHYT */}
					<div className="space-y-1.5">
						<label
							htmlFor="patient-bhyt"
							className="text-[11.5px] font-semibold text-slate-700 block"
						>
							Số thẻ bảo hiểm y tế (BHYT)
						</label>
						<input
							id="patient-bhyt"
							type="text"
							value={bhyt}
							onChange={(e) => setBhyt(e.target.value)}
							placeholder="DN  4  01  0012345678"
							className="w-full h-10 px-3.5 bg-[#F6F8FA] border border-transparent focus:border-[#0EA5E9] focus:bg-white rounded-[10px] text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none transition-all tracking-wider font-mono"
						/>
					</div>

					{/* Row 4: Dia chi */}
					<div className="space-y-1.5">
						<label
							htmlFor="patient-address"
							className="text-[11.5px] font-semibold text-slate-700 block"
						>
							Địa chỉ
						</label>
						<input
							id="patient-address"
							type="text"
							value={address}
							onChange={(e) => setAddress(e.target.value)}
							placeholder="Ninh Kiều, Cần Thơ"
							className="w-full h-10 px-3.5 bg-[#F6F8FA] border border-transparent focus:border-[#0EA5E9] focus:bg-white rounded-[10px] text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none transition-all"
						/>
					</div>

					{/* Dialog Footer */}
					<div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 mt-4">
						<button
							type="button"
							onClick={() => onOpenChange(false)}
							className="px-3.5 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
						>
							Hủy bỏ
						</button>
						<button
							type="submit"
							className="inline-flex items-center gap-1.5 bg-[#0EA5E9] hover:bg-[#25B4F8] text-white text-xs font-semibold px-5 py-2.5 rounded-[10px] shadow-xs hover:shadow-md hover:shadow-sky-500/15 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
						>
							<Check className="h-4 w-4 stroke-[2.5]" />
							<span>Lưu hồ sơ</span>
						</button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
