"use client";

import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Check } from "lucide-react";
import { DisplayGender, Patient, PatientPayload } from "../types";
import { displayDateToIso, splitFullName, toApiGender } from "../api";
import { BirthDatePicker } from "./BirthDatePicker";

interface PatientDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialData?: Patient | null;
	/** Should throw (e.g. ApiError) when the backend rejects the request. */
	onSave: (payload: PatientPayload, id?: string) => Promise<void>;
}

const INPUT_CLASS =
	"w-full h-10 px-3.5 bg-[#F6F8FA] border border-transparent focus:border-[#0EA5E9] focus:bg-white rounded-[10px] text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none transition-all";
const LABEL_CLASS = "text-[11.5px] font-semibold text-slate-700 block";

function Required() {
	return <span className="text-red-500 font-bold">*</span>;
}

export function PatientDialog({
	open,
	onOpenChange,
	initialData,
	onSave,
}: PatientDialogProps) {
	const [lastName, setLastName] = useState("");
	const [firstName, setFirstName] = useState("");
	const [code, setCode] = useState("");
	const [phone, setPhone] = useState("");
	const [birthDate, setBirthDate] = useState("");
	const [gender, setGender] = useState<DisplayGender>("Nam");
	const [height, setHeight] = useState("");
	const [weight, setWeight] = useState("");
	const [bhyt, setBhyt] = useState("");
	const [address, setAddress] = useState("");
	const [city, setCity] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (!open) return;
		setError(null);
		if (initialData) {
			const names = splitFullName(initialData.name);
			setLastName(names.lastName);
			setFirstName(names.firstName);
			setCode(initialData.code);
			setPhone(initialData.phone ?? "");
			setBirthDate(initialData.birthDate);
			setGender(initialData.gender);
			setHeight(initialData.height != null ? String(initialData.height) : "");
			setWeight(initialData.weight != null ? String(initialData.weight) : "");
			setBhyt(initialData.bhyt ?? "");
			setAddress(initialData.address ?? "");
			setCity(initialData.city ?? "");
		} else {
			setLastName("");
			setFirstName("");
			setCode("");
			setPhone("");
			setBirthDate("");
			setGender("Nam");
			setHeight("");
			setWeight("");
			setBhyt("");
			setAddress("");
			setCity("");
		}
	}, [initialData, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		const isoDob = displayDateToIso(birthDate);
		if (!isoDob) {
			setError("Ngày sinh không hợp lệ (định dạng DD/MM/YYYY).");
			return;
		}
		const heightNum = Number(height.replace(",", "."));
		const weightNum = Number(weight.replace(",", "."));
		if (!(heightNum > 0) || !(weightNum > 0)) {
			setError("Chiều cao và cân nặng phải lớn hơn 0.");
			return;
		}

		const payload: PatientPayload = {
			firstName: firstName.trim(),
			lastName: lastName.trim(),
			phoneNumber: phone.trim(),
			dateOfBirth: isoDob,
			gender: toApiGender(gender),
			height: heightNum,
			weight: weightNum,
			medicalRecordCode: code.trim(),
			healthInsuranceCard: bhyt.replace(/\s+/g, ""),
			address: address.trim(),
			city: city.trim(),
		};

		setIsSaving(true);
		try {
			await onSave(payload, initialData?.id);
			onOpenChange(false);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Không thể lưu hồ sơ bệnh nhân."
			);
		} finally {
			setIsSaving(false);
		}
	};

	const genderButton = (value: DisplayGender) => (
		<button
			type="button"
			onClick={() => setGender(value)}
			className={`h-10 rounded-[10px] flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer transition-all ${
				gender === value
					? "bg-[#E0F2FE] border border-[#7DD3FC] text-[#0284C7] shadow-2xs"
					: "bg-[#F6F8FA] border border-transparent text-slate-500 hover:bg-slate-100"
			}`}
		>
			<span
				className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
					gender === value
						? "border-2 border-[#0EA5E9]"
						: "border border-slate-300"
				}`}
			>
				{gender === value && (
					<span className="w-1.5 h-1.5 rounded-full bg-[#0EA5E9]" />
				)}
			</span>
			<span>{value}</span>
		</button>
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[540px] w-full max-h-[92vh] overflow-y-auto rounded-[18px] bg-white p-6 shadow-2xl border-none outline-none">
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
					{/* Row 1: Last name & first name */}
					<div className="grid grid-cols-2 gap-3.5">
						<div className="space-y-1.5">
							<label htmlFor="patient-last-name" className={LABEL_CLASS}>
								Họ và tên đệm <Required />
							</label>
							<input
								id="patient-last-name"
								type="text"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								placeholder="Nguyễn Minh"
								required
								className={INPUT_CLASS}
							/>
						</div>
						<div className="space-y-1.5">
							<label htmlFor="patient-first-name" className={LABEL_CLASS}>
								Tên <Required />
							</label>
							<input
								id="patient-first-name"
								type="text"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								placeholder="Khôi"
								required
								className={INPUT_CLASS}
							/>
						</div>
					</div>

					{/* Row 2: Code & phone */}
					<div className="grid grid-cols-2 gap-3.5">
						<div className="space-y-1.5">
							<label htmlFor="patient-code" className={LABEL_CLASS}>
								Mã bệnh án <Required />
							</label>
							<input
								id="patient-code"
								type="text"
								value={code}
								onChange={(e) => setCode(e.target.value)}
								placeholder="BA-2026-0231"
								required
								className={`${INPUT_CLASS} font-semibold font-mono`}
							/>
						</div>
						<div className="space-y-1.5">
							<label htmlFor="patient-phone" className={LABEL_CLASS}>
								Số điện thoại <Required />
							</label>
							<input
								id="patient-phone"
								type="tel"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								placeholder="0912345678"
								required
								className={INPUT_CLASS}
							/>
						</div>
					</div>

					{/* Row 3: DOB and Gender */}
					<div className="grid grid-cols-2 gap-3.5">
						<div className="space-y-1.5">
							<label htmlFor="patient-dob" className={LABEL_CLASS}>
								Ngày sinh <Required />
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
							<label className={LABEL_CLASS}>
								Giới tính <Required />
							</label>
							<div className="grid grid-cols-2 gap-2">
								{genderButton("Nam")}
								{genderButton("Nữ")}
							</div>
						</div>
					</div>

					{/* Row 4: Height & weight */}
					<div className="grid grid-cols-2 gap-3.5">
						<div className="space-y-1.5">
							<label htmlFor="patient-height" className={LABEL_CLASS}>
								Chiều cao (cm) <Required />
							</label>
							<input
								id="patient-height"
								type="number"
								min="1"
								step="0.1"
								value={height}
								onChange={(e) => setHeight(e.target.value)}
								placeholder="170"
								required
								className={INPUT_CLASS}
							/>
						</div>
						<div className="space-y-1.5">
							<label htmlFor="patient-weight" className={LABEL_CLASS}>
								Cân nặng (kg) <Required />
							</label>
							<input
								id="patient-weight"
								type="number"
								min="1"
								step="0.1"
								value={weight}
								onChange={(e) => setWeight(e.target.value)}
								placeholder="62"
								required
								className={INPUT_CLASS}
							/>
						</div>
					</div>

					{/* Row 5: BHYT */}
					<div className="space-y-1.5">
						<label htmlFor="patient-bhyt" className={LABEL_CLASS}>
							Số thẻ bảo hiểm y tế (BHYT) <Required />
						</label>
						<input
							id="patient-bhyt"
							type="text"
							inputMode="numeric"
							value={bhyt}
							onChange={(e) => setBhyt(e.target.value)}
							placeholder="10 chữ số, ví dụ: 0012345678"
							required
							className={`${INPUT_CLASS} tracking-wider font-mono`}
						/>
					</div>

					{/* Row 6: Address & city */}
					<div className="grid grid-cols-2 gap-3.5">
						<div className="space-y-1.5">
							<label htmlFor="patient-address" className={LABEL_CLASS}>
								Địa chỉ <Required />
							</label>
							<input
								id="patient-address"
								type="text"
								value={address}
								onChange={(e) => setAddress(e.target.value)}
								placeholder="Ninh Kiều"
								required
								className={INPUT_CLASS}
							/>
						</div>
						<div className="space-y-1.5">
							<label htmlFor="patient-city" className={LABEL_CLASS}>
								Tỉnh / Thành phố <Required />
							</label>
							<input
								id="patient-city"
								type="text"
								value={city}
								onChange={(e) => setCity(e.target.value)}
								placeholder="Cần Thơ"
								required
								className={INPUT_CLASS}
							/>
						</div>
					</div>

					{error && (
						<p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-[10px] px-3.5 py-2.5">
							{error}
						</p>
					)}

					{/* Dialog Footer */}
					<div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 mt-4">
						<button
							type="button"
							onClick={() => onOpenChange(false)}
							disabled={isSaving}
							className="px-3.5 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer disabled:opacity-50"
						>
							Hủy bỏ
						</button>
						<button
							type="submit"
							disabled={isSaving}
							className="inline-flex items-center gap-1.5 bg-[#0EA5E9] hover:bg-[#25B4F8] text-white text-xs font-semibold px-5 py-2.5 rounded-[10px] shadow-xs hover:shadow-md hover:shadow-sky-500/15 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:hover:scale-100"
						>
							<Check className="h-4 w-4 stroke-[2.5]" />
							<span>{isSaving ? "Đang lưu..." : "Lưu hồ sơ"}</span>
						</button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
