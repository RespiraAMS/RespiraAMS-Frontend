// src/features/manager/antibiotics/components/AntibioticsView.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { TableTitle } from "@/features/manager/components/TableTitle"; // Đảm bảo component này có tồn tại
import { AntibioticsTable } from "./AntibioticsTable";
import { AntibioticForm } from "./AntibioticForm";
import { type AntibioticItem, type CreateAntibioticRequest } from "../types";
import { useAntibioticMutations } from "../queries";

type ActiveView = "create" | "update" | "delete" | null;

export function AntibioticsView() {
    const t = useTranslations("manager.antibiotics");
    const tCommon = useTranslations("common");

    const [activeView, setActiveView] = useState<ActiveView>(null);
    const [selected, setSelected] = useState<AntibioticItem | null>(null);

    const { createMutation, updateMutation, deleteMutation } = useAntibioticMutations();

    const openView = (view: ActiveView, item?: AntibioticItem) => {
        setSelected(item ?? null);
        setActiveView(view);
    };

    const closeView = () => {
        setActiveView(null);
        setSelected(null);
    };

    const handleFormSubmit = (data: CreateAntibioticRequest) => {
        if (activeView === "create") {
            createMutation.mutate(data, { onSuccess: closeView });
        } else if (activeView === "update" && selected) {
            updateMutation.mutate({ id: selected.id, data }, { onSuccess: closeView });
        }
    };

    const handleDelete = () => {
        if (selected) {
            deleteMutation.mutate(selected.id, { onSuccess: closeView });
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <>
            <TableTitle
                title={t("title")}
                description={t("description")}
                buttonLabel={t("addButton")}
                onClick={() => openView("create")}
            />

            <AntibioticsTable
                onEdit={(item) => openView("update", item)}
                onDelete={(item) => openView("delete", item)}
            />

            {/* Modal Create / Update */}
            <Dialog open={activeView === "create" || activeView === "update"} onOpenChange={(open) => { if (!open && !isPending) closeView(); }}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-popover text-popover-foreground border-border">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">
                            {activeView === "create" ? t("dialog.createTitle") : t("dialog.updateTitle")}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            {activeView === "create" ? t("dialog.createDesc") : t("dialog.updateDesc")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-2">
                        {(activeView === "create" || (activeView === "update" && selected)) && (
                            <AntibioticForm
                                initialData={activeView === "update" ? selected : null}
                                onSubmit={handleFormSubmit}
                                onCancel={closeView}
                                isPending={isPending}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Sheet Delete */}
            <Sheet open={activeView === "delete"} onOpenChange={(open) => { if (!open && !deleteMutation.isPending) closeView(); }}>
                <SheetContent side="right" className="bg-popover text-popover-foreground border-border">
                    <SheetHeader>
                        <SheetTitle className="text-foreground">{t("sheet.deleteTitle")}</SheetTitle>
                        <SheetDescription className="text-muted-foreground">{t("sheet.deleteDesc")}</SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 flex flex-col gap-4 px-1">
                        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
                            {t("sheet.deleteConfirmMsg", { name: selected?.name ?? "" })}
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={closeView} disabled={deleteMutation.isPending} className="border-border text-foreground hover:bg-accent">
                                {tCommon("cancel")}
                            </Button>
                            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
                                {deleteMutation.isPending ? "..." : tCommon("confirmDelete")}
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}