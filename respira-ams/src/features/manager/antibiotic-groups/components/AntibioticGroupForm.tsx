"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Loader2, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { useAntibioticGroupsDropdown } from "../queries";
import { type AntibioticGroupItem, type CreateAntibioticGroupRequest, type UpdateAntibioticGroupRequest } from "../types";

interface AntibioticGroupFormProps {
    initialData?: AntibioticGroupItem | null;
    onSubmit: (data: CreateAntibioticGroupRequest | UpdateAntibioticGroupRequest) => void;
    onCancel: () => void;
    isPending?: boolean;
}

export function AntibioticGroupForm({ initialData, onSubmit, onCancel, isPending }: AntibioticGroupFormProps) {
    const t = useTranslations("manager.antibioticGroups");
    const tVal = useTranslations("manager.antibioticGroups.validation");
    const tCommon = useTranslations("common");

    const isEdit = !!initialData;
    const { data: dropdownData, isLoading: isDropdownLoading } = useAntibioticGroupsDropdown();

    const [openCombobox, setOpenCombobox] = useState(false);

    const availableParents = dropdownData?.antibioticGroups?.filter(g => g.id !== initialData?.id) || [];

    const groupSchema = useMemo(() => {
        return z.object({
            name: z.string().trim().min(1, tVal("nameRequired")),
            parentId: z.string().nullable().optional(),
            description: z.string().trim().min(1, tVal("descriptionRequired")),
        });
    }, [tVal]);

    type FormValues = z.infer<typeof groupSchema>;

    const defaultValues: FormValues = useMemo(() => {
        if (!initialData) return { name: "", parentId: "", description: "" };
        return {
            name: initialData.name,
            parentId: initialData.parentId || "",
            description: initialData.description || "",
        };
    }, [initialData]);

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(groupSchema),
        defaultValues,
    });

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    const handleValidSubmit = (data: FormValues) => {
        const payload = {
            name: data.name,
            parentId: data.parentId === "" ? null : data.parentId,
            description: data.description,
        };
        onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-4 text-foreground">
            {/* Group Name */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                    {t("form.nameLabel")} <span className="text-destructive">*</span>
                </label>
                <Input
                    {...register("name")}
                    disabled={isPending}
                    placeholder={t("form.namePlaceholder")}
                    className="bg-background text-foreground border-input placeholder:text-muted-foreground"
                />
                {errors.name && <p className="text-sm text-destructive font-medium">{errors.name.message}</p>}
            </div>

            {/* Parent Group*/}
            <div className="space-y-2 flex flex-col">
                <label className="text-sm font-medium text-foreground">{t("form.parentLabel")}</label>
                <Controller
                    name="parentId"
                    control={control}
                    render={({ field }) => (
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox} modal={true}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCombobox}
                                    disabled={isPending || isDropdownLoading}
                                    className={cn(
                                        "w-full justify-between bg-background border-input font-normal text-left",
                                        !field.value && "text-muted-foreground"
                                    )}
                                >
                                    {field.value
                                        ? availableParents.find((group) => group.id === field.value)?.name
                                        : t("form.noParentOption")}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                <Command>
                                    <CommandInput placeholder={t("form.searchParentPlaceholder") || "Tìm kiếm nhóm cha..."} />
                                    <CommandList>
                                        <CommandEmpty>{t("form.noParentFound") || "Không tìm thấy nhóm cha nào."}</CommandEmpty>
                                        <CommandGroup>
                                            <CommandItem
                                                value="none_option"
                                                onSelect={() => {
                                                    field.onChange("");
                                                    setOpenCombobox(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        field.value === "" || field.value === null ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {t("form.noParentOption")}
                                            </CommandItem>
                                            {availableParents.map((group) => (
                                                <CommandItem
                                                    key={group.id}
                                                    value={`${group.name} ${group.id}`} 
                                                    onSelect={() => {
                                                        field.onChange(group.id);
                                                        setOpenCombobox(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            field.value === group.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {group.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    )}
                />
            </div>

            {/* Description */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t("form.descriptionLabel")}</label>
                <Textarea
                    {...register("description")}
                    disabled={isPending}
                    rows={4}
                    placeholder={t("form.descriptionPlaceholder")}
                    className="bg-background text-foreground border-input placeholder:text-muted-foreground resize-none"
                />
                {errors.description && <p className="text-sm text-destructive font-medium">{errors.description.message}</p>}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-border mt-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isPending}
                    className="border-border text-foreground hover:bg-accent"
                >
                    {tCommon("cancel")}
                </Button>
                <Button type="submit" disabled={isPending} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isEdit ? tCommon("update") : tCommon("create")}
                </Button>
            </div>
        </form>
    );
}