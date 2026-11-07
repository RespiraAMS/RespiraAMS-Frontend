// src/features/manager/treatment-protocols/components/TreatmentProtocolForm.tsx
"use client";

import { useMemo, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Trash2, Check, ChevronsUpDown, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { cn } from "@/lib/utils";
import { TreatmentProtocolItem, TreatmentProtocolRequest, SeverityLevel, TreatmentSite } from "../types";
import { useDropdownData } from "../queries";

// --- Schema ---
const formSchema = z.object({
    severity: z.enum(["Mild", "Moderate", "Severe"]),
    treatmentSite: z.enum(["Outpatient", "Inpatient", "IntensiveCareUnit"]),
    version: z.string().optional(),
    publisher: z.string().optional(),
    isApplied: z.boolean().default(true),
    pathogens: z.array(z.string()).optional(),
    criteria: z.array(z.string()).optional(),
    // medicines là mảng chứa các object group, mỗi group chứa mảng antibioticIds
    medicines: z.array(z.object({
        antibioticIds: z.array(z.string()).min(1, "Nhóm phải có ít nhất 1 thuốc")
    })).min(1, "Phải cấu hình ít nhất 1 phác đồ (nhóm) điều trị"),
});

type FormValues = z.infer<typeof formSchema>;

interface TreatmentProtocolFormProps {
    initialData?: TreatmentProtocolItem | null;
    onSubmit: (data: TreatmentProtocolRequest) => void;
    onCancel: () => void;
    isPending?: boolean;
}

export function TreatmentProtocolForm({ initialData, onSubmit, onCancel, isPending }: TreatmentProtocolFormProps) {
    const isEdit = !!initialData;
    const { pathogens, criteria, antibiotics, isLoading: isLoadingDropdowns } = useDropdownData();

    // Dropdown combo states
    const [openPathogenCombo, setOpenPathogenCombo] = useState(false);
    const [openCriteriaCombo, setOpenCriteriaCombo] = useState(false);
    const [openAntibioticComboForGroup, setOpenAntibioticComboForGroup] = useState<number | null>(null);

    const defaultValues: FormValues = useMemo(() => {
        if (!initialData) {
            return {
                severity: "Mild", treatmentSite: "Outpatient", version: "", publisher: "", isApplied: true,
                pathogens: [], criteria: [],
                medicines: [{ antibioticIds: [] }] // Tạo sẵn 1 nhóm rỗng
            };
        }
        return {
            severity: initialData.severity,
            treatmentSite: initialData.treatmentSite,
            version: initialData.version,
            publisher: initialData.publisher,
            isApplied: initialData.isApplied,
            pathogens: initialData.pathogens.map(p => p.id),
            criteria: initialData.criteria.map(c => c.id),
            medicines: initialData.treatments.map(group => ({
                antibioticIds: group.map(ab => ab.id)
            })),
        };
    }, [initialData]);

    const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    const { fields: medicineGroups, append: appendGroup, remove: removeGroup } = useFieldArray({
        control,
        name: "medicines",
    });

    const watchPathogens = watch("pathogens") || [];
    const watchCriteria = watch("criteria") || [];
    const watchMedicines = watch("medicines") || [];

    const toggleArrayItem = (fieldName: "pathogens" | "criteria", id: string) => {
        const currentList = watch(fieldName) || [];
        if (currentList.includes(id)) {
            setValue(fieldName, currentList.filter(cid => cid !== id), { shouldValidate: true });
        } else {
            setValue(fieldName, [...currentList, id], { shouldValidate: true });
        }
    };

    const toggleAntibioticInGroup = (groupIndex: number, antibioticId: string) => {
        const currentGroupList = watchMedicines[groupIndex]?.antibioticIds || [];
        if (currentGroupList.includes(antibioticId)) {
            setValue(`medicines.${groupIndex}.antibioticIds`, currentGroupList.filter(id => id !== antibioticId), { shouldValidate: true });
        } else {
            setValue(`medicines.${groupIndex}.antibioticIds`, [...currentGroupList, antibioticId], { shouldValidate: true });
        }
    };

    const handleValidSubmit = (data: FormValues) => {
        const payload: TreatmentProtocolRequest = {
            severity: data.severity,
            treatmentSite: data.treatmentSite,
            version: data.version || "",
            publisher: data.publisher || "",
            isApplied: data.isApplied,
            pathogens: data.pathogens || [],
            criteria: data.criteria || [],
            medicines: data.medicines.map(group => group.antibioticIds), // Biến đổi lại thành mảng 2 chiều string[][]
        };
        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-6">
            
            {/* Phân loại Bệnh / Cấp độ */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Mức độ nghiêm trọng (Severity) <span className="text-destructive">*</span></Label>
                    <Controller
                        control={control}
                        name="severity"
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn mức độ" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Mild">Nhẹ (Mild)</SelectItem>
                                    <SelectItem value="Moderate">Trung bình (Moderate)</SelectItem>
                                    <SelectItem value="Severe">Nặng (Severe)</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Cơ sở điều trị (Treatment Site) <span className="text-destructive">*</span></Label>
                    <Controller
                        control={control}
                        name="treatmentSite"
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn nơi điều trị" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Outpatient">Ngoại trú (Outpatient)</SelectItem>
                                    <SelectItem value="Inpatient">Nội trú (Inpatient)</SelectItem>
                                    <SelectItem value="IntensiveCareUnit">Hồi sức tích cực (ICU)</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
            </div>

            {/* Thông tin metadata */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Phiên bản / Năm (Version)</Label>
                    <Input {...register("version")} placeholder="Ví dụ: 2024" disabled={isPending} />
                </div>
                <div className="space-y-2">
                    <Label>Tổ chức xuất bản (Publisher)</Label>
                    <Input {...register("publisher")} placeholder="Ví dụ: BYT, IDSA" disabled={isPending} />
                </div>
            </div>

            {/* Cấu hình Chỉ định đặc biệt (Pathogens / Criteria) */}
            <div className="p-4 border rounded-lg bg-muted/20 space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Chỉ định cụ thể (Tùy chọn)</h4>
                <div className="grid grid-cols-2 gap-4">
                    
                    {/* Pathogens Multi-Select */}
                    <div className="space-y-2 flex flex-col">
                        <Label className="text-xs">Mầm bệnh đích (Pathogens)</Label>
                        <Popover open={openPathogenCombo} onOpenChange={setOpenPathogenCombo}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="justify-between font-normal text-muted-foreground" disabled={isLoadingDropdowns || isPending}>
                                    {isLoadingDropdowns ? "Đang tải..." : "Thêm mầm bệnh..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                <Command>
                                    <CommandInput placeholder="Tìm mầm bệnh..." />
                                    <CommandEmpty>Không tìm thấy.</CommandEmpty>
                                    <CommandList>
                                        <CommandGroup>
                                            {pathogens.map((p) => (
                                                <CommandItem key={p.id} value={p.name} onSelect={() => toggleArrayItem("pathogens", p.id)}>
                                                    <Check className={cn("mr-2 h-4 w-4", watchPathogens.includes(p.id) ? "opacity-100" : "opacity-0")} />
                                                    {p.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {watchPathogens.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {watchPathogens.map(id => {
                                    const p = pathogens.find(x => x.id === id);
                                    if (!p) return null;
                                    return (
                                        <Badge key={id} variant="secondary" className="text-xs bg-background">
                                            {p.name}
                                            <X className="w-3 h-3 ml-1 cursor-pointer hover:text-destructive" onClick={() => toggleArrayItem("pathogens", id)} />
                                        </Badge>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Criteria Multi-Select */}
                    <div className="space-y-2 flex flex-col">
                        <Label className="text-xs">Tiêu chí lâm sàng (Criteria)</Label>
                        <Popover open={openCriteriaCombo} onOpenChange={setOpenCriteriaCombo}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="justify-between font-normal text-muted-foreground" disabled={isLoadingDropdowns || isPending}>
                                    {isLoadingDropdowns ? "Đang tải..." : "Thêm tiêu chí..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                <Command>
                                    <CommandInput placeholder="Tìm tiêu chí..." />
                                    <CommandEmpty>Không tìm thấy.</CommandEmpty>
                                    <CommandList>
                                        <CommandGroup>
                                            {criteria.map((c) => (
                                                <CommandItem key={c.id} value={c.name} onSelect={() => toggleArrayItem("criteria", c.id)}>
                                                    <Check className={cn("mr-2 h-4 w-4", watchCriteria.includes(c.id) ? "opacity-100" : "opacity-0")} />
                                                    {c.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {watchCriteria.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {watchCriteria.map(id => {
                                    const c = criteria.find(x => x.id === id);
                                    if (!c) return null;
                                    return (
                                        <Badge key={id} variant="secondary" className="text-xs bg-background max-w-full text-left line-clamp-1" title={c.name}>
                                            <span className="truncate">{c.name}</span>
                                            <X className="w-3 h-3 ml-1 cursor-pointer shrink-0 hover:text-destructive" onClick={() => toggleArrayItem("criteria", id)} />
                                        </Badge>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quản lý Medicines (Nhóm kháng sinh) - Group Cards & Tags */}
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                    <Label className="text-base font-semibold text-foreground">
                        Phác đồ Kháng sinh (Tùy chọn phối hợp) <span className="text-destructive">*</span>
                    </Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendGroup({ antibioticIds: [] })} disabled={isPending}>
                        <Plus className="w-4 h-4 mr-1" /> Thêm lựa chọn (Hoặc)
                    </Button>
                </div>
                
                {errors.medicines?.root && (
                    <p className="text-xs text-destructive font-medium">{errors.medicines.root.message}</p>
                )}

                <div className="space-y-3">
                    {medicineGroups.map((group, index) => {
                        const groupAntibiotics = watchMedicines[index]?.antibioticIds || [];
                        const groupError = errors.medicines?.[index]?.antibioticIds;

                        return (
                            <Card key={group.id} className={cn("relative overflow-visible", groupError && "border-destructive")}>
                                <CardHeader className="py-3 px-4 bg-muted/30 border-b flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                                        <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full inline-flex items-center justify-center text-xs">
                                            {index + 1}
                                        </span>
                                        Lựa chọn phối hợp {index + 1}
                                    </CardTitle>
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                        onClick={() => removeGroup(index)}
                                        disabled={medicineGroups.length === 1 || isPending}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-4 flex flex-col gap-3">
                                    
                                    <Popover 
                                        open={openAntibioticComboForGroup === index} 
                                        onOpenChange={(open) => setOpenAntibioticComboForGroup(open ? index : null)}
                                    >
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="justify-between font-normal text-muted-foreground w-full md:w-1/2" disabled={isLoadingDropdowns || isPending}>
                                                <Plus className="w-4 h-4 mr-2" /> Thêm thuốc vào phác đồ
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] md:w-96 p-0" align="start">
                                            <Command>
                                                <CommandInput placeholder="Tìm kháng sinh..." />
                                                <CommandEmpty>Không tìm thấy thuốc.</CommandEmpty>
                                                <CommandList>
                                                    <CommandGroup>
                                                        {antibiotics.map((a) => (
                                                            <CommandItem 
                                                                key={a.id} 
                                                                value={a.name} 
                                                                onSelect={() => toggleAntibioticInGroup(index, a.id)}
                                                            >
                                                                <Check className={cn("mr-2 h-4 w-4", groupAntibiotics.includes(a.id) ? "opacity-100" : "opacity-0")} />
                                                                <div className="flex flex-col">
                                                                    <span>{a.name}</span>
                                                                    {a.classification && (
                                                                        <span className="text-[10px] text-muted-foreground uppercase">{a.classification}</span>
                                                                    )}
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>

                                    {/* Render Tags (Badges) cho các kháng sinh đã chọn trong Group này */}
                                    <div className="flex flex-wrap gap-2">
                                        {groupAntibiotics.map((abId, i) => {
                                            const ab = antibiotics.find(x => x.id === abId);
                                            if (!ab) return null;
                                            return (
                                                <div key={abId} className="flex items-center gap-1">
                                                    <Badge variant="secondary" className="px-3 py-1.5 text-sm bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                                        {ab.name}
                                                        <X 
                                                            className="w-4 h-4 ml-2 cursor-pointer opacity-70 hover:opacity-100" 
                                                            onClick={() => toggleAntibioticInGroup(index, abId)} 
                                                        />
                                                    </Badge>
                                                    {/* Hiển thị dấu '+' nếu không phải phần tử cuối cùng trong nhóm */}
                                                    {i < groupAntibiotics.length - 1 && (
                                                        <span className="text-muted-foreground font-bold text-lg mx-1">+</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {groupError && <p className="text-xs text-destructive">{groupError.message}</p>}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {isEdit && (
                <div className="flex items-center gap-2 pt-2 border-t">
                    <Controller
                        control={control}
                        name="isApplied"
                        render={({ field }) => (
                            <Checkbox id="isApplied" checked={field.value} onCheckedChange={field.onChange} disabled={isPending} />
                        )}
                    />
                    <Label htmlFor="isApplied" className="cursor-pointer font-medium">Đang áp dụng (Active)</Label>
                </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>Hủy</Button>
                <Button type="submit" disabled={isPending} className="gap-2 bg-primary">
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isEdit ? "Cập nhật" : "Lưu Phác đồ"}
                </Button>
            </div>
        </form>
    );
}