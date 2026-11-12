"use client";

import { useEffect, useState } from "react";
import {
	UserPlus,
	UserCog,
	User,
	Activity,
	MapPin,
	Check,
	X,
	Loader2,
	AlertCircle,
} from "lucide-react";
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
	"w-full h-10 px-3.5 bg-[#F8FAFC] border border-slate-200/80 focus:border-[#0EA5E9] focus:bg-white rounded-[10px] text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none transition-all shadow-2xs";
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

	// Quản lý lỗi định dạng từng trường theo thời gian thực
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});

	// Khóa scroll body khi mở popup và lắng nghe phím ESC
	useEffect(() => {
		if (open) {
			document.body.style.overflow = "hidden";
			const handleKeyDown = (e: KeyboardEvent) => {
				if (e.key === "Escape") onOpenChange(false);
			};
			window.addEventListener("keydown", handleKeyDown);
			return () => {
				document.body.style.overflow = "";
				window.removeEventListener("keydown", handleKeyDown);
			};
		}
	}, [open, onOpenChange]);

	useEffect(() => {
		if (!open) return;
		setError(null);
		setErrors({});
		setTouched({});
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

	const validateField = (field: string, value: string): string | null => {
		const val = value.trim();
		switch (field) {
			case "lastName":
				if (!val) return "Vui lòng nhập họ và tên đệm.";
				return null;
			case "firstName":
				if (!val) return "Vui lòng nhập tên bệnh nhân.";
				return null;
			case "code":
				if (!val) return "Vui lòng nhập mã bệnh án.";
				if (val.length < 3) return "Mã bệnh án phải có ít nhất 3 ký tự.";
				return null;
			case "phone":
				if (!val) return "Vui lòng nhập số điện thoại.";
				if (!/^(0|\+84|84)(3|5|7|8|9)[0-9]{8}$/.test(val)) {
					return "Số điện thoại không hợp lệ (10 số, bắt đầu 03, 05, 07, 08, 09).";
				}
				return null;
			case "birthDate":
				if (!val) return "Vui lòng chọn hoặc nhập ngày sinh.";
				const iso = displayDateToIso(val);
				if (!iso) return "Ngày sinh không đúng định dạng DD/MM/YYYY.";
				const d = new Date(iso);
				if (d > new Date()) return "Ngày sinh không được ở tương lai.";
				const age = new Date().getFullYear() - d.getFullYear();
				if (age < 15) return "Bệnh nhân phải từ 15 tuổi trở lên.";
				return null;
			case "height":
				if (!val) return "Vui lòng nhập chiều cao.";
				const h = Number(val.replace(",", "."));
				if (isNaN(h) || !(h > 0)) return "Chiều cao phải lớn hơn 0 (cm).";
				if (h > 260) return "Chiều cao vượt quá giới hạn cho phép.";
				return null;
			case "weight":
				if (!val) return "Vui lòng nhập cân nặng.";
				const w = Number(val.replace(",", "."));
				if (isNaN(w) || !(w > 0)) return "Cân nặng phải lớn hơn 0 (kg).";
				if (w > 400) return "Cân nặng vượt quá giới hạn cho phép.";
				return null;
			case "bhyt":
				const rawBhyt = val.replace(/\s+/g, "");
				if (!rawBhyt) return "Vui lòng nhập số thẻ BHYT.";
				if (!/^[0-9]{10}$/.test(rawBhyt)) {
					return "Số thẻ BHYT phải gồm đúng 10 chữ số.";
				}
				return null;
			case "address":
				if (!val) return "Vui lòng nhập địa chỉ cư trú.";
				return null;
			case "city":
				if (!val) return "Vui lòng nhập tỉnh hoặc thành phố.";
				return null;
			default:
				return null;
		}
	};

	const handleBlur = (field: string, value: string) => {
		setTouched((prev) => ({ ...prev, [field]: true }));
		const err = validateField(field, value);
		setErrors((prev) => {
			const next = { ...prev };
			if (err) next[field] = err;
			else delete next[field];
			return next;
		});
	};

	const handleFieldChange = (
		field: string,
		value: string,
		setter: (val: string) => void
	) => {
		setter(value);
		if (touched[field]) {
			const err = validateField(field, value);
			setErrors((prev) => {
				const next = { ...prev };
				if (err) next[field] = err;
				else delete next[field];
				return next;
			});
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		const fields = [
			{ name: "lastName", value: lastName, id: "patient-last-name" },
			{ name: "firstName", value: firstName, id: "patient-first-name" },
			{ name: "code", value: code, id: "patient-code" },
			{ name: "phone", value: phone, id: "patient-phone" },
			{ name: "birthDate", value: birthDate, id: "patient-dob" },
			{ name: "height", value: height, id: "patient-height" },
			{ name: "weight", value: weight, id: "patient-weight" },
			{ name: "bhyt", value: bhyt, id: "patient-bhyt" },
			{ name: "address", value: address, id: "patient-address" },
			{ name: "city", value: city, id: "patient-city" },
		];

		const newErrors: Record<string, string> = {};
		const allTouched: Record<string, boolean> = {};
		let firstInvalidId: string | null = null;

		for (const f of fields) {
			allTouched[f.name] = true;
			const err = validateField(f.name, f.value);
			if (err) {
				newErrors[f.name] = err;
				if (!firstInvalidId) firstInvalidId = f.id;
			}
		}

		setTouched(allTouched);
		setErrors(newErrors);

		if (firstInvalidId) {
			// Nhập sai format: Báo ngay, không out ra ngoài mà cuộn và focus ngay vào ô sai!
			const targetEl = document.getElementById(firstInvalidId);
			if (targetEl) {
				targetEl.focus();
				targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
			}
			return;
		}

		const isoDob = displayDateToIso(birthDate)!;
		const heightNum = Number(height.replace(",", "."));
		const weightNum = Number(weight.replace(",", "."));

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
					: "bg-[#F8FAFC] border border-slate-200/80 text-slate-500 hover:bg-slate-100"
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

	if (!open) return null;

	return (
		<div
			className="fixed inset-0 z-50 overflow-y-auto bg-black/45 backdrop-blur-xs p-4 sm:p-6 flex justify-center items-start animate-in fade-in-0 duration-150"
			onMouseDown={(e) => {
				if (e.target === e.currentTarget) onOpenChange(false);
			}}
			role="presentation"
		>
			<div
				className="w-full max-w-[620px] my-auto sm:my-8 rounded-[20px] bg-white p-6 sm:p-7 shadow-2xl border border-slate-100 outline-none animate-in fade-in zoom-in-95 duration-150"
				onClick={(e) => e.stopPropagation()}
				role="dialog"
				aria-modal="true"
			>
				{/* ── Header giống ảnh mẫu ── */}
				<div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-5">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-[10px] bg-sky-50 text-[#0EA5E9] flex items-center justify-center shrink-0 shadow-2xs">
							{initialData ? (
								<UserCog className="h-5 w-5" />
							) : (
								<UserPlus className="h-5 w-5" />
							)}
						</div>
						<div>
							<div className="flex items-center gap-2 flex-wrap">
								<h2 className="text-base font-bold text-slate-900 tracking-tight">
									{initialData ? "Chỉnh sửa thông tin bệnh nhân" : "Thêm bệnh nhân mới"}
								</h2>
								<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-[#0284C7] border border-sky-200/60">
									<span className="h-1.5 w-1.5 rounded-full bg-[#0EA5E9]" />
									<span>{initialData ? "Cập nhật hồ sơ" : "Hồ sơ mới"}</span>
								</span>
							</div>
							<p className="text-[11px] text-slate-400 mt-0.5">
								Thông tin hành chính & thể trạng bệnh nhân
							</p>
						</div>
					</div>

					<button
						type="button"
						onClick={() => onOpenChange(false)}
						className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
						aria-label="Đóng"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* ── Form Body ── */}
				<form onSubmit={handleSubmit} className="space-y-5" noValidate>
					{/* Nhóm 1: Thông tin định danh */}
					<div className="space-y-3">
						<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
							<User className="h-3.5 w-3.5 text-[#0EA5E9]" />
							<span>Thông tin định danh</span>
						</div>

						<div className="grid grid-cols-2 gap-3.5">
							<div className="space-y-1.5">
								<label htmlFor="patient-last-name" className={LABEL_CLASS}>
									Họ và tên đệm <Required />
								</label>
								<input
									id="patient-last-name"
									type="text"
									value={lastName}
									onChange={(e) =>
										handleFieldChange("lastName", e.target.value, setLastName)
									}
									onBlur={() => handleBlur("lastName", lastName)}
									placeholder="Nguyễn Văn"
									required
									className={`${INPUT_CLASS} ${
										touched.lastName && errors.lastName
											? "border-red-400 focus:border-red-500 bg-red-50/20"
											: ""
									}`}
								/>
								{touched.lastName && errors.lastName && (
									<p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
										<AlertCircle className="h-3 w-3 shrink-0" />
										<span>{errors.lastName}</span>
									</p>
								)}
							</div>
							<div className="space-y-1.5">
								<label htmlFor="patient-first-name" className={LABEL_CLASS}>
									Tên <Required />
								</label>
								<input
									id="patient-first-name"
									type="text"
									value={firstName}
									onChange={(e) =>
										handleFieldChange("firstName", e.target.value, setFirstName)
									}
									onBlur={() => handleBlur("firstName", firstName)}
									placeholder="A"
									required
									className={`${INPUT_CLASS} ${
										touched.firstName && errors.firstName
											? "border-red-400 focus:border-red-500 bg-red-50/20"
											: ""
									}`}
								/>
								{touched.firstName && errors.firstName && (
									<p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
										<AlertCircle className="h-3 w-3 shrink-0" />
										<span>{errors.firstName}</span>
									</p>
								)}
							</div>
						</div>

						<div className="grid grid-cols-2 gap-3.5">
							<div className="space-y-1.5">
								<label htmlFor="patient-dob" className={LABEL_CLASS}>
									Ngày sinh <Required />
								</label>
								<BirthDatePicker
									id="patient-dob"
									value={birthDate}
									onChange={(val) =>
										handleFieldChange("birthDate", val, setBirthDate)
									}
									onBlur={() => handleBlur("birthDate", birthDate)}
									hasError={Boolean(touched.birthDate && errors.birthDate)}
									placeholder="15/08/1997"
									required
								/>
								{touched.birthDate && errors.birthDate && (
									<p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
										<AlertCircle className="h-3 w-3 shrink-0" />
										<span>{errors.birthDate}</span>
									</p>
								)}
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
					</div>

					{/* Nhóm 2: Mã bệnh án & Thể trạng */}
					<div className="space-y-3 pt-1 border-t border-slate-100">
						<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 pt-2">
							<Activity className="h-3.5 w-3.5 text-indigo-500" />
							<span>Mã bệnh án & Thể trạng</span>
						</div>

						<div className="grid grid-cols-2 gap-3.5">
							<div className="space-y-1.5">
								<label htmlFor="patient-code" className={LABEL_CLASS}>
									Mã bệnh án <Required />
								</label>
								<input
									id="patient-code"
									type="text"
									value={code}
									onChange={(e) =>
										handleFieldChange("code", e.target.value, setCode)
									}
									onBlur={() => handleBlur("code", code)}
									placeholder="BA-2026-3541"
									required
									className={`${INPUT_CLASS} font-semibold font-mono ${
										touched.code && errors.code
											? "border-red-400 focus:border-red-500 bg-red-50/20"
											: ""
									}`}
								/>
								{touched.code && errors.code && (
									<p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
										<AlertCircle className="h-3 w-3 shrink-0" />
										<span>{errors.code}</span>
									</p>
								)}
							</div>
							<div className="space-y-1.5">
								<label htmlFor="patient-bhyt" className={LABEL_CLASS}>
									Số thẻ BHYT (đúng 10 số) <Required />
								</label>
								<input
									id="patient-bhyt"
									type="text"
									inputMode="numeric"
									value={bhyt}
									onChange={(e) =>
										handleFieldChange("bhyt", e.target.value, setBhyt)
									}
									onBlur={() => handleBlur("bhyt", bhyt)}
									placeholder="1234567890"
									required
									className={`${INPUT_CLASS} tracking-wider font-mono ${
										touched.bhyt && errors.bhyt
											? "border-red-400 focus:border-red-500 bg-red-50/20"
											: ""
									}`}
								/>
								{touched.bhyt && errors.bhyt && (
									<p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
										<AlertCircle className="h-3 w-3 shrink-0" />
										<span>{errors.bhyt}</span>
									</p>
								)}
							</div>
						</div>

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
									onChange={(e) =>
										handleFieldChange("height", e.target.value, setHeight)
									}
									onBlur={() => handleBlur("height", height)}
									placeholder="170"
									required
									className={`${INPUT_CLASS} ${
										touched.height && errors.height
											? "border-red-400 focus:border-red-500 bg-red-50/20"
											: ""
									}`}
								/>
								{touched.height && errors.height && (
									<p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
										<AlertCircle className="h-3 w-3 shrink-0" />
										<span>{errors.height}</span>
									</p>
								)}
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
									onChange={(e) =>
										handleFieldChange("weight", e.target.value, setWeight)
									}
									onBlur={() => handleBlur("weight", weight)}
									placeholder="65"
									required
									className={`${INPUT_CLASS} ${
										touched.weight && errors.weight
											? "border-red-400 focus:border-red-500 bg-red-50/20"
											: ""
									}`}
								/>
								{touched.weight && errors.weight && (
									<p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
										<AlertCircle className="h-3 w-3 shrink-0" />
										<span>{errors.weight}</span>
									</p>
								)}
							</div>
						</div>
					</div>

					{/* Nhóm 3: Thông tin liên hệ & Cư trú */}
					<div className="space-y-3 pt-1 border-t border-slate-100">
						<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 pt-2">
							<MapPin className="h-3.5 w-3.5 text-amber-500" />
							<span>Thông tin liên hệ & Cư trú</span>
						</div>

						<div className="space-y-1.5">
							<label htmlFor="patient-phone" className={LABEL_CLASS}>
								Số điện thoại liên hệ <Required />
							</label>
							<input
								id="patient-phone"
								type="tel"
								value={phone}
								onChange={(e) =>
									handleFieldChange("phone", e.target.value, setPhone)
								}
								onBlur={() => handleBlur("phone", phone)}
								placeholder="0931056047"
								required
								className={`${INPUT_CLASS} ${
									touched.phone && errors.phone
										? "border-red-400 focus:border-red-500 bg-red-50/20"
										: ""
								}`}
							/>
							{touched.phone && errors.phone && (
								<p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
									<AlertCircle className="h-3 w-3 shrink-0" />
									<span>{errors.phone}</span>
								</p>
							)}
						</div>

						<div className="grid grid-cols-2 gap-3.5">
							<div className="space-y-1.5">
								<label htmlFor="patient-address" className={LABEL_CLASS}>
									Địa chỉ cư trú <Required />
								</label>
								<input
									id="patient-address"
									type="text"
									value={address}
									onChange={(e) =>
										handleFieldChange("address", e.target.value, setAddress)
									}
									onBlur={() => handleBlur("address", address)}
									placeholder="Số nhà, tên đường, phường..."
									required
									className={`${INPUT_CLASS} ${
										touched.address && errors.address
											? "border-red-400 focus:border-red-500 bg-red-50/20"
											: ""
									}`}
								/>
								{touched.address && errors.address && (
									<p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
										<AlertCircle className="h-3 w-3 shrink-0" />
										<span>{errors.address}</span>
									</p>
								)}
							</div>
							<div className="space-y-1.5">
								<label htmlFor="patient-city" className={LABEL_CLASS}>
									Tỉnh / Thành phố <Required />
								</label>
								<input
									id="patient-city"
									type="text"
									value={city}
									onChange={(e) =>
										handleFieldChange("city", e.target.value, setCity)
									}
									onBlur={() => handleBlur("city", city)}
									placeholder="TP. Hồ Chí Minh"
									required
									className={`${INPUT_CLASS} ${
										touched.city && errors.city
											? "border-red-400 focus:border-red-500 bg-red-50/20"
											: ""
									}`}
								/>
								{touched.city && errors.city && (
									<p className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
										<AlertCircle className="h-3 w-3 shrink-0" />
										<span>{errors.city}</span>
									</p>
								)}
							</div>
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
							className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer disabled:opacity-50"
						>
							Hủy bỏ
						</button>
						<button
							type="submit"
							disabled={isSaving}
							className="inline-flex items-center gap-1.5 bg-[#0EA5E9] hover:bg-[#25B4F8] text-white text-xs font-semibold px-5 py-2.5 rounded-[10px] shadow-xs hover:shadow-md hover:shadow-sky-500/15 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:hover:scale-100"
						>
							{isSaving ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Check className="h-4 w-4 stroke-[2.5]" />
							)}
							<span>{isSaving ? "Đang lưu..." : "Lưu hồ sơ"}</span>
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
