"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteAntibioticSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    antibioticName: string;
    isDeleting?: boolean;
}

export function DeleteAntibioticSheet({
    isOpen,
    onClose,
    onConfirm,
    antibioticName,
    isDeleting = false,
}: DeleteAntibioticSheetProps) {
    const t = useTranslations("manager.antibiotics.sheet");
    const tCommon = useTranslations("common");

    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent className="border-border bg-card text-card-foreground">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-destructive">
                        {t("deleteTitle")}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                        {t("deleteDesc")}
                        <br />
                        <br />
                        <span className="font-medium text-foreground">
                            {t("deleteConfirmMsg", { name: antibioticName })}
                        </span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                
                <AlertDialogFooter className="mt-4">
                    <Button 
                        variant="outline" 
                        onClick={onClose} 
                        disabled={isDeleting}
                    >
                        {tCommon("cancel")}
                    </Button>
                    <Button 
                        variant="destructive" 
                        onClick={onConfirm} 
                        disabled={isDeleting}
                        className="gap-2"
                    >
                        {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                        {tCommon("delete")}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}