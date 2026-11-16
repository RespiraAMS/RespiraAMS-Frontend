"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { type NextOfKinItem, type NextOfKinRequest } from "../types";

const VN_PHONE_REGEX = /^(0|\+84)(3|5|7|8|9)\d{8}$/;

function normalizePhone(phone: string): string {
    const cleaned = phone.trim().replace(/\s+/g, "");
    if (cleaned.startsWith("+84")) {
        return "0" + cleaned.slice(3);
    }
    return cleaned;
}

interface NextOfKinFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: NextOfKinItem | null;
    existingKins: NextOfKinItem[];
    onSubmit: (data: NextOfKinRequest) => void;
    isPending?: boolean;
}

export function NextOfKinFormDialog({
    open,
    onOpenChange,
    initialData,
    existingKins,
    onSubmit,
    isPending,
}: NextOfKinFormDialogProps) {
    const isEdit = !!initialData;

    const schema = useMemo(() => {
        return z.object({
            fullName: z.string().trim().min(1, "Bắt buộc nhập họ và tên người thân"),
            phoneNumber: z
                .string()
                .trim()
                .min(1, "Bắt buộc nhập số điện thoại")
                .regex(VN_PHONE_REGEX, "Số điện thoại Việt Nam không hợp lệ (vd: 0789456123)")
                .refine(
                    (val) => {
                        const normalizedInput = normalizePhone(val);
                        return !existingKins.some(
                            (kin) =>
                                kin.id !== initialData?.id &&
                                normalizePhone(kin.phoneNumber) === normalizedInput
                        );
                    },
                    { message: "Số điện thoại này đã được đăng ký cho người thân khác của bệnh nhân" }
                ),
            relationship: z.string().trim().min(1, "Bắt buộc nhập mối quan hệ"),
        });
    }, [existingKins, initialData?.id]);

    type FormValues = z.infer<typeof schema>;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            fullName: "",
            phoneNumber: "",
            relationship: "",
        },
    });

    useEffect(() => {
        if (open) {
            reset({
                fullName: initialData?.fullName ?? "",
                phoneNumber: initialData?.phoneNumber ?? "",
                relationship: initialData?.relationship ?? "",
            });
        }
    }, [open, initialData, reset]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md border-border bg-popover text-popover-foreground">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Cập nhật Người thân liên hệ" : "Thêm Người thân liên hệ"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label>
                            Họ và tên <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            {...register("fullName")}
                            placeholder="Ví dụ: Nguyễn Văn An"
                            disabled={isPending}
                        />
                        {errors.fullName && (
                            <p className="text-xs text-destructive">{errors.fullName.message}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label>
                            Số điện thoại <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            {...register("phoneNumber")}
                            placeholder="Ví dụ: 0789456123"
                            disabled={isPending}
                        />
                        {errors.phoneNumber && (
                            <p className="text-xs text-destructive">{errors.phoneNumber.message}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label>
                            Mối quan hệ <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            {...register("relationship")}
                            placeholder="Ví dụ: Con cả, Vợ/Chồng, Cha/Mẹ..."
                            disabled={isPending}
                        />
                        {errors.relationship && (
                            <p className="text-xs text-destructive">{errors.relationship.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-border">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isPending} className="bg-primary">
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEdit ? "Lưu thay đổi" : "Thêm người thân"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}