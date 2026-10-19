"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // Import Dialog

import { AntibioticsTable } from "./AntibioticsTable";
import { AntibioticForm } from "./AntibioticForm";
import { DeleteAntibioticSheet } from "./DeleteAntibioticSheet";
import { useAntibioticMutations } from "../queries";
import { type AntibioticItem, type CreateAntibioticRequest, type UpdateAntibioticRequest } from "../types";

export function AntibioticsView() {
    const t = useTranslations("manager.antibiotics");
    const tCommon = useTranslations("common");
    const router = useRouter();

    const [modalMode, setModalMode] = useState<"create" | "update" | null>(null);
    const [selected, setSelected] = useState<AntibioticItem | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const { createMutation, updateMutation, deleteMutation } = useAntibioticMutations();

    const openCreate = () => {
        setSelected(null);
        setModalMode("create");
    };

    const openUpdate = (item: AntibioticItem) => {
        setSelected(item);
        setModalMode("update");
    };

    const openDetail = (id: string) => {
        router.push(`/manage/antibiotics/${id}`); 
    };

    const openDelete = (item: AntibioticItem) => {
        setSelected(item);
        setIsDeleteOpen(true);
    };

    const closeModal = () => {
        setModalMode(null);
        setSelected(null);
    };

    const handleFormSubmit = (data: CreateAntibioticRequest | UpdateAntibioticRequest) => {
        if (modalMode === "create") {
            createMutation.mutate(data as CreateAntibioticRequest, { onSuccess: closeModal });
        } else if (modalMode === "update" && selected) {
            updateMutation.mutate({ id: selected.id, data: data as UpdateAntibioticRequest }, { onSuccess: closeModal });
        }
    };

    const handleDelete = () => {
        if (selected) {
            deleteMutation.mutate(selected.id, { onSuccess: () => setIsDeleteOpen(false) });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">{t("title")}</h2>
                    <p className="text-muted-foreground">{t("description")}</p>
                </div>
                <Button onClick={openCreate} className="bg-primary text-primary-foreground">
                    <Plus className="mr-2 h-4 w-4" />
                    {t("addButton")}
                </Button>
            </div>
            
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm overflow-x-auto">
                <AntibioticsTable 
                    onViewDetail={openDetail} 
                    onEdit={openUpdate} 
                    onDelete={openDelete} 
                />
            </div>

            <Dialog open={modalMode !== null} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className="sm:max-w-[600px] border-border bg-card text-card-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            {modalMode === "create" ? t("dialog.createTitle") : t("dialog.updateTitle")}
                        </DialogTitle>
                    </DialogHeader>
                    {modalMode && (
                        <AntibioticForm
                            initialData={selected}
                            onSubmit={handleFormSubmit}
                            onCancel={closeModal}
                            isPending={createMutation.isPending || updateMutation.isPending}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <DeleteAntibioticSheet
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                antibioticName={selected?.name || ""}
                isDeleting={deleteMutation.isPending}
            />
        </div>
    );
}