"use client";

import { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

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

const formSchema = z.object({
    lastName: z.string().trim().min(1, "Bắt buộc nhập họ"),
    firstName: z.string().trim().min(1, "Bắt buộc nhập tên"),
    phoneNumber: z
        .string()
        .trim()
        .min(1, "Bắt buộc nhập số điện thoại")
        .regex(VN_PHONE_REGEX, "Số điện thoại Việt Nam không hợp lệ (vd: 0912345678)"),
    dateOfBirth: z
        .string()
        .min(1, "Bắt buộc chọn ngày sinh")
        .regex(RFC3339_DATE_REGEX, "Ngày sinh sai định dạng"),
    gender: z.enum(["Male", "Female"]),
    height: z
        .number({ error: "Chiều cao phải là số" })
        .min(1, "Chiều cao phải lớn hơn 0")
        .max(300, "Chiều cao không hợp lệ"),
    weight: z
        .number({ error: "Cân nặng phải là số" })
        .min(1, "Cân nặng phải lớn hơn 0")
        .max(500, "Cân nặng không hợp lệ"),
    medicalRecordCode: z.string().trim().min(1, "Bắt buộc nhập mã bệnh án"),
    healthInsuranceCard: z
        .string()
        .trim()
        .regex(INSURANCE_CARD_REGEX, "Mã thẻ BHYT phải bao gồm đúng 10 chữ số"),
    address: z.string().trim().min(1, "Bắt buộc nhập địa chỉ"),
    city: z.string().trim().min(1, "Bắt buộc nhập tỉnh/thành phố"),
});

type FormValues = z.infer<typeof formSchema>;

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
    const isEdit = !!initialData;

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
        <form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>
                        Họ <span className="text-destructive">*</span>
                    </Label>
                    <Input {...register("lastName")} placeholder="Ví dụ: Nguyễn" disabled={isPending} />
                    {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label>
                        Tên đệm & Tên <span className="text-destructive">*</span>
                    </Label>
                    <Input {...register("firstName")} placeholder="Ví dụ: Văn An" disabled={isPending} />
                    {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>
                        Mã bệnh án <span className="text-destructive">*</span>
                    </Label>
                    <Input {...register("medicalRecordCode")} placeholder="Ví dụ: BA-12345-122" disabled={isPending} />
                    {errors.medicalRecordCode && (
                        <p className="text-xs text-destructive">{errors.medicalRecordCode.message}</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <Label>
                        Số thẻ BHYT <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        {...register("healthInsuranceCard")}
                        placeholder="0123456789"
                        maxLength={10}
                        disabled={isPending}
                    />
                    {errors.healthInsuranceCard && (
                        <p className="text-xs text-destructive">{errors.healthInsuranceCard.message}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>
                        Ngày sinh <span className="text-destructive">*</span>
                    </Label>
                    <Input type="date" {...register("dateOfBirth")} disabled={isPending} />
                    {errors.dateOfBirth && <p className="text-xs text-destructive">{errors.dateOfBirth.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label>
                        Số điện thoại <span className="text-destructive">*</span>
                    </Label>
                    <Input {...register("phoneNumber")} placeholder="0912345678" disabled={isPending} />
                    {errors.phoneNumber && <p className="text-xs text-destructive">{errors.phoneNumber.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                    <Label>
                        Giới tính <span className="text-destructive">*</span>
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
                                                {g === "Male" ? "Nam" : "Nữ"}
                                            </Label>
                                        </div>
                                    );
                                })}
                            </RadioGroup>
                        )}
                    />
                </div>

                <div className="space-y-1.5">
                    <Label>
                        Chiều cao (cm) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        type="number"
                        step="0.1"
                        {...register("height", { valueAsNumber: true })}
                        disabled={isPending}
                    />
                    {errors.height && <p className="text-xs text-destructive">{errors.height.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label>
                        Cân nặng (kg) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        type="number"
                        step="0.1"
                        {...register("weight", { valueAsNumber: true })}
                        disabled={isPending}
                    />
                    {errors.weight && <p className="text-xs text-destructive">{errors.weight.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                    <Label>
                        Địa chỉ <span className="text-destructive">*</span>
                    </Label>
                    <Input {...register("address")} placeholder="Ví dụ: Cái Răng" disabled={isPending} />
                    {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label>
                        Tỉnh / Thành phố <span className="text-destructive">*</span>
                    </Label>
                    <Input {...register("city")} placeholder="Ví dụ: Cần Thơ" disabled={isPending} />
                    {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                    Hủy
                </Button>
                <Button type="submit" disabled={isPending} className="gap-2 bg-primary">
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isEdit ? "Cập nhật bệnh nhân" : "Thêm bệnh nhân"}
                </Button>
            </div>
        </form>
    );
}