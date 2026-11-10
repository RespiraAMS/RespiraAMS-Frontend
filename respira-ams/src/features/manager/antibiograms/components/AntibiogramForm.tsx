"use client";

import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Check, ChevronsUpDown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";
import { 
    CreateAntibiogramRequest, 
    UpdateAntibiogramRequest, 
    AntibiogramItem, 
    MicCategory 
} from "../types";
import { useAntibioticsDropdown, usePathogensDropdown } from "../queries";

const formSchema = z.object({
    micCategory: z.enum(["Susceptible", "Intermediate", "Resistant"]),
    pathogenId: z.string().min(1, "Bắt buộc chọn mầm bệnh"),
    antibioticIds: z.array(z.string()).min(1, "Bắt buộc chọn ít nhất một kháng sinh"),
});

type FormValues = z.infer<typeof formSchema>;

interface AntibiogramFormProps {
    initialData?: AntibiogramItem | null;
    onSubmit: (data: CreateAntibiogramRequest | UpdateAntibiogramRequest) => void;
    onCancel: () => void;
    isPending?: boolean;
}

export function AntibiogramForm({ initialData, onSubmit, onCancel, isPending }: AntibiogramFormProps) {
    const isEdit = !!initialData;
    const [openPathogenCombo, setOpenPathogenCombo] = useState(false);
    const [openAntibioticCombo, setOpenAntibioticCombo] = useState(false);

    const { data: pathogensData, isLoading: isLoadingPathogens } = usePathogensDropdown();
    const pathogens = pathogensData?.pathogens || [];

    const { data: antibioticsData, isLoading: isLoadingAntibiotics } = useAntibioticsDropdown();
    const antibiotics = antibioticsData?.antibiotics || [];

    const defaultValues: FormValues = useMemo(() => {
        if (!initialData) {
            return { micCategory: "Susceptible", pathogenId: "", antibioticIds: [] };
        }
        return {
            micCategory: initialData.micCategory,
            pathogenId: initialData.pathogen.id,
            antibioticIds: initialData.antibiotics.map((a) => a.id),
        };
    }, [initialData]);

    const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    const selectedAntibioticIds = watch("antibioticIds");

    const toggleAntibiotic = (id: string) => {
        const currentIds = selectedAntibioticIds || [];
        if (currentIds.includes(id)) {
            setValue("antibioticIds", currentIds.filter((cid) => cid !== id), { shouldValidate: true });
        } else {
            setValue("antibioticIds", [...currentIds, id], { shouldValidate: true });
        }
    };

    const handleValidSubmit = (data: FormValues) => {
        const payload = {
            micCategory: data.micCategory as MicCategory,
            pathogenId: data.pathogenId,
            antibioticIds: data.antibioticIds,
        };
        onSubmit(payload);
    };

    const getMicCategoryColor = (category: MicCategory) => {
        switch (category) {
            case "Susceptible": return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800";
            case "Intermediate": return "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800";
            case "Resistant": return "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800";
            default: return "text-foreground bg-muted border-border";
        }
    };

    return (
        <form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-6">
            
            <div className="space-y-2">
                <Label>Mức độ nhạy cảm <span className="text-destructive">*</span></Label>
                <Controller
                    control={control}
                    name="micCategory"
                    render={({ field }) => (
                        <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex p-1 bg-muted rounded-md border border-border"
                            disabled={isPending}
                        >
                            {(["Susceptible", "Intermediate", "Resistant"] as MicCategory[]).map((category) => {
                                const isSelected = field.value === category;
                                return (
                                    <div key={category} className="flex-1 relative">
                                        <RadioGroupItem value={category} id={`mic-${category}`} className="peer sr-only hidden" />
                                        <Label
                                            htmlFor={`mic-${category}`}
                                            className={cn(
                                                "flex items-center justify-center py-2 px-3 text-sm font-medium rounded cursor-pointer transition-all border",
                                                isSelected 
                                                    ? getMicCategoryColor(category) + " shadow-sm z-10" 
                                                    : "text-muted-foreground border-transparent hover:bg-background/50 hover:text-foreground"
                                            )}
                                        >
                                            {category === "Susceptible" && "Nhạy cảm (S)"}
                                            {category === "Intermediate" && "Trung gian (I)"}
                                            {category === "Resistant" && "Kháng thuốc (R)"}
                                        </Label>
                                    </div>
                                );
                            })}
                        </RadioGroup>
                    )}
                />
            </div>

            <div className="space-y-2 flex flex-col">
                <Label>Tác nhân <span className="text-destructive">*</span></Label>
                <Controller
                    control={control}
                    name="pathogenId"
                    render={({ field }) => (
                        <Popover open={openPathogenCombo} onOpenChange={setOpenPathogenCombo} modal={true}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openPathogenCombo}
                                    className={cn("justify-between font-normal w-full", !field.value && "text-muted-foreground", errors.pathogenId && "border-destructive")}
                                    disabled={isPending || isLoadingPathogens}
                                >
                                    <span className="truncate">
                                        {field.value
                                            ? pathogens.find((p) => p.id === field.value)?.name
                                            : (isLoadingPathogens ? "Đang tải..." : "Chọn mầm bệnh...")}
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                <Command>
                                    <CommandInput placeholder="Tìm kiếm mầm bệnh..." />
                                    <CommandEmpty>Không tìm thấy mầm bệnh.</CommandEmpty>
                                    <CommandList>
                                        <CommandGroup>
                                            {pathogens.map((p) => (
                                                <CommandItem
                                                    key={p.id}
                                                    value={p.name}
                                                    onSelect={() => {
                                                        field.onChange(p.id);
                                                        setOpenPathogenCombo(false);
                                                    }}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", field.value === p.id ? "opacity-100" : "opacity-0")} />
                                                    {p.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    )}
                />
                {errors.pathogenId && <p className="text-xs text-destructive">{errors.pathogenId.message}</p>}
            </div>

            <div className="space-y-2 flex flex-col">
                <Label>Kháng sinh <span className="text-destructive">*</span></Label>
                
                <Popover open={openAntibioticCombo} onOpenChange={setOpenAntibioticCombo} modal={true}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openAntibioticCombo}
                            className={cn("justify-between font-normal w-full", errors.antibioticIds && "border-destructive")}
                            disabled={isPending || isLoadingAntibiotics}
                        >
                            <span className="text-muted-foreground">
                                {isLoadingAntibiotics ? "Đang tải..." : "Thêm kháng sinh..."}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                        <Command>
                            <CommandInput placeholder="Tìm kiếm kháng sinh..." />
                            <CommandEmpty>Không tìm thấy kháng sinh.</CommandEmpty>
                            <CommandList>
                                <CommandGroup>
                                    {antibiotics.map((a) => (
                                        <CommandItem
                                            key={a.id}
                                            value={a.name}
                                            onSelect={() => {
                                                toggleAntibiotic(a.id);
                                            }}
                                        >
                                            <Check className={cn("mr-2 h-4 w-4", selectedAntibioticIds?.includes(a.id) ? "opacity-100" : "opacity-0")} />
                                            {a.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                {selectedAntibioticIds && selectedAntibioticIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 p-3 border rounded-md bg-muted/30">
                        {selectedAntibioticIds.map((id) => {
                            const ab = antibiotics.find(a => a.id === id);
                            if (!ab) return null;
                            return (
                                <Badge key={id} variant="secondary" className="flex items-center gap-1 font-medium bg-background border">
                                    {ab.name}
                                    <button 
                                        type="button" 
                                        onClick={() => toggleAntibiotic(id)} 
                                        className="text-muted-foreground hover:text-foreground ml-1 rounded-full p-0.5 hover:bg-muted"
                                        disabled={isPending}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            );
                        })}
                    </div>
                )}
                {errors.antibioticIds && <p className="text-xs text-destructive">{errors.antibioticIds.message}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>Hủy</Button>
                <Button type="submit" disabled={isPending} className="gap-2 bg-primary">
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isEdit ? "Cập nhật" : "Tạo mới"}
                </Button>
            </div>
        </form>
    );
}