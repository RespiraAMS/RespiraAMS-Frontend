"use client";

import { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { cn } from "@/lib/utils";
import {
	type PatientDetail,
	type CreatePatientRequest,
	type UpdatePatientRequest,
	type Gender,
} from "../types";

const VN_PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
const INSURANCE_CARD_REGEX = /^\d{10}$/;
const RFC3339_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

interface PatientFormProps {
	initialData?: PatientDetail | null;
	onSubmit: (data: CreatePatientRequest | UpdatePatientRequest) => void;
	onCancel: () => void;
	isPending?: boolean;
}

function splitFullName(fullName: string): { lastName: string; firstName: string } {
	const parts = fullName.trim().split(/\s+/);
	if (parts.length <= 1) {
		return { lastName: parts[0] || "", firstName: "" };
	}
	return {
		lastName: parts[0],
		firstName: parts.slice(1).join(" "),
	};
}

export function PatientForm({ initialData, onSubmit, onCancel, isPending }: PatientFormProps) {
	const tForm = useTranslations("doctor.patients.form");
	const tVal = useTranslations("doctor.patients.validation");
	const tGender = useTranslations("doctor.patients.gender");
	const tCommon = useTranslations("common");

	const isEdit = !!initialData;

	const formSchema = useMemo(() => {
		return z.object({
			lastName: z.string().trim().min(1, tVal("lastNameRequired")),
			firstName: z.string().trim().min(1, tVal("firstNameRequired")),
			phoneNumber: z
				.string()
				.trim()
				.min(1, tVal("phoneRequired"))
				.regex(VN_PHONE_REGEX, tVal("phoneInvalid")),
			dateOfBirth: z
				.string()
				.min(1, tVal("dobRequired"))
				.regex(RFC3339_DATE_REGEX, tVal("dobInvalid")),
			gender: z.enum(["Male", "Female"]),
			height: z
				.number({ error: tVal("heightNumber") })
				.min(1, tVal("heightMin"))
				.max(300, tVal("heightMax")),
			weight: z
				.number({ error: tVal("weightNumber") })
				.min(1, tVal("weightMin"))
				.max(500, tVal("weightMax")),
			medicalRecordCode: z.string().trim().min(1, tVal("medicalRecordCodeRequired")),
			healthInsuranceCard: z
				.string()
				.trim()
				.regex(INSURANCE_CARD_REGEX, tVal("insuranceCardInvalid")),
			address: z.string().trim().min(1, tVal("addressRequired")),
			city: z.string().trim().min(1, tVal("cityRequired")),
		});
	}, [tVal]);

	type FormValues = z.infer<typeof formSchema>;

	const defaultValues: FormValues = useMemo(() => {
		if (!initialData) {
			return {
				lastName: "",
				firstName: "",
				phoneNumber: "",
				dateOfBirth: "",
				gender: "Male",
				height: 165,
				weight: 60,
				medicalRecordCode: "",
				healthInsuranceCard: "",
				address: "Ninh Kiều",
				city: "Cần Thơ",
			};
		}

		const { lastName, firstName } = splitFullName(initialData.fullName);
		return {
			lastName,
			firstName,
			phoneNumber: initialData.phoneNumber,
			dateOfBirth: initialData.dateOfBirth,
			gender: initialData.gender,
			height: initialData.height,
			weight: initialData.weight,
			medicalRecordCode: initialData.medicalRecordCode,
			healthInsuranceCard: initialData.healthInsuranceCard,
			address: initialData.address,
			city: initialData.city,
		};
	}, [initialData]);

	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues,
	});

	const handleValidSubmit = (data: FormValues) => {
		onSubmit({
			firstName: data.firstName,
			lastName: data.lastName,
			phoneNumber: data.phoneNumber,
			dateOfBirth: data.dateOfBirth,
			gender: data.gender as Gender,
			height: data.height,
			weight: data.weight,
			medicalRecordCode: data.medicalRecordCode,
			healthInsuranceCard: data.healthInsuranceCard,
			address: data.address,
			city: data.city,
		});
	};

	return (
		<form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-4 text-foreground">
			{/* Last Name & First Name */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="space-y-1.5">
					<Label className="text-foreground">
						{tForm("lastNameLabel")} <span className="text-destructive">*</span>
					</Label>
					<Input
						{...register("lastName")}
						placeholder={tForm("lastNamePlaceholder")}
						disabled={isPending}
						className="bg-background text-foreground border-input"
					/>
					{errors.lastName && (
						<p className="text-xs text-destructive font-medium">{errors.lastName.message}</p>
					)}
				</div>

				<div className="space-y-1.5">
					<Label className="text-foreground">
						{tForm("firstNameLabel")} <span className="text-destructive">*</span>
					</Label>
					<Input
						{...register("firstName")}
						placeholder={tForm("firstNamePlaceholder")}
						disabled={isPending}
						className="bg-background text-foreground border-input"
					/>
					{errors.firstName && (
						<p className="text-xs text-destructive font-medium">{errors.firstName.message}</p>
					)}
				</div>
			</div>

			{/* Medical Record Code & Health Insurance Card */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="space-y-1.5">
					<Label className="text-foreground">
						{tForm("medicalRecordCodeLabel")} <span className="text-destructive">*</span>
					</Label>
					<Input
						{...register("medicalRecordCode")}
						placeholder={tForm("medicalRecordCodePlaceholder")}
						disabled={isPending}
						className="bg-background text-foreground border-input"
					/>
					{errors.medicalRecordCode && (
						<p className="text-xs text-destructive font-medium">{errors.medicalRecordCode.message}</p>
					)}
				</div>

				<div className="space-y-1.5">
					<Label className="text-foreground">
						{tForm("healthInsuranceCardLabel")} <span className="text-destructive">*</span>
					</Label>
					<Input
						{...register("healthInsuranceCard")}
						placeholder={tForm("healthInsuranceCardPlaceholder")}
						maxLength={10}
						disabled={isPending}
						className="bg-background text-foreground border-input"
					/>
					{errors.healthInsuranceCard && (
						<p className="text-xs text-destructive font-medium">{errors.healthInsuranceCard.message}</p>
					)}
				</div>
			</div>

			{/* Date of Birth & Phone Number */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="space-y-1.5">
					<Label className="text-foreground">
						{tForm("dateOfBirthLabel")} <span className="text-destructive">*</span>
					</Label>
					<Input
						type="date"
						{...register("dateOfBirth")}
						disabled={isPending}
						className="bg-background text-foreground border-input"
					/>
					{errors.dateOfBirth && (
						<p className="text-xs text-destructive font-medium">{errors.dateOfBirth.message}</p>
					)}
				</div>

				<div className="space-y-1.5">
					<Label className="text-foreground">
						{tForm("phoneNumberLabel")} <span className="text-destructive">*</span>
					</Label>
					<Input
						{...register("phoneNumber")}
						placeholder={tForm("phoneNumberPlaceholder")}
						disabled={isPending}
						className="bg-background text-foreground border-input"
					/>
					{errors.phoneNumber && (
						<p className="text-xs text-destructive font-medium">{errors.phoneNumber.message}</p>
					)}
				</div>
			</div>

			{/* Gender, Height & Weight */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div className="space-y-1.5">
					<Label className="text-foreground">
						{tForm("genderLabel")} <span className="text-destructive">*</span>
					</Label>
					<Controller
						control={control}
						name="gender"
						render={({ field }) => (
							<RadioGroup
								onValueChange={field.onChange}
								value={field.value}
								className="flex p-1 bg-muted rounded-md border border-border h-10"
								disabled={isPending}
							>
								{(["Male", "Female"] as Gender[]).map((g) => {
									const active = field.value === g;
									return (
										<div key={g} className="flex-1">
											<RadioGroupItem value={g} id={`gender-${g}`} className="peer sr-only hidden" />
											<Label
												htmlFor={`gender-${g}`}
												className={cn(
													"flex items-center justify-center h-full text-xs font-medium rounded cursor-pointer transition-all",
													active
														? "bg-background text-foreground shadow-sm"
														: "text-muted-foreground hover:text-foreground"
												)}
											>
												{tGender(g)}
											</Label>
										</div>
									);
								})}
							</RadioGroup>
						)}
					/>
				</div>

				<div className="space-y-1.5">
					<Label className="text-foreground">
						{tForm("heightLabel")} <span className="text-destructive">*</span>
					</Label>
					<Input
						type="number"
						step="0.1"
						{...register("height", { valueAsNumber: true })}
						disabled={isPending}
						className="bg-background text-foreground border-input"
					/>
					{errors.height && (
						<p className="text-xs text-destructive font-medium">{errors.height.message}</p>
					)}
				</div>

				<div className="space-y-1.5">
					<Label className="text-foreground">
						{tForm("weightLabel")} <span className="text-destructive">*</span>
					</Label>
					<Input
						type="number"
						step="0.1"
						{...register("weight", { valueAsNumber: true })}
						disabled={isPending}
						className="bg-background text-foreground border-input"
					/>
					{errors.weight && (
						<p className="text-xs text-destructive font-medium">{errors.weight.message}</p>
					)}
				</div>
			</div>

			{/* Address & City */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div className="space-y-1.5 sm:col-span-2">
					<Label className="text-foreground">
						{tForm("addressLabel")} <span className="text-destructive">*</span>
					</Label>
					<Input
						{...register("address")}
						placeholder={tForm("addressPlaceholder")}
						disabled={isPending}
						className="bg-background text-foreground border-input"
					/>
					{errors.address && (
						<p className="text-xs text-destructive font-medium">{errors.address.message}</p>
					)}
				</div>

				<div className="space-y-1.5">
					<Label className="text-foreground">
						{tForm("cityLabel")} <span className="text-destructive">*</span>
					</Label>
					<Input
						{...register("city")}
						placeholder={tForm("cityPlaceholder")}
						disabled={isPending}
						className="bg-background text-foreground border-input"
					/>
					{errors.city && (
						<p className="text-xs text-destructive font-medium">{errors.city.message}</p>
					)}
				</div>
			</div>

			{/* Actions */}
			<div className="flex justify-end gap-2 pt-4 border-t border-border">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					disabled={isPending}
					className="border-border text-foreground hover:bg-accent"
				>
					{tCommon("cancel")}
				</Button>
				<Button
					type="submit"
					disabled={isPending}
					className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
				>
					{isPending && <Loader2 className="h-4 w-4 animate-spin" />}
					{isEdit ? tForm("updateButton") : tForm("createButton")}
				</Button>
			</div>
		</form>
	);
}