"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteDosageDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	isDeleting?: boolean;
}

export function DeleteDosageDialog({
	isOpen,
	onClose,
	onConfirm,
	isDeleting = false,
}: DeleteDosageDialogProps) {
	const t = useTranslations("manager.antibiotics.deleteDosageModal");
	const tCommon = useTranslations("common");

	return (
		<AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<AlertDialogContent className="border-border bg-card text-card-foreground shadow-lg">
				<AlertDialogHeader>
					<AlertDialogTitle className="text-destructive font-semibold">
						{t("title")}
					</AlertDialogTitle>
					<AlertDialogDescription className="text-muted-foreground">
						{t("desc")}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter className="mt-4">
					<Button
						variant="outline"
						onClick={onClose}
						disabled={isDeleting}
						className="border-border text-foreground hover:bg-accent"
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