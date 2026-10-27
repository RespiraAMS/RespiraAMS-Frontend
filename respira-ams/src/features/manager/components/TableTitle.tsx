"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TableTitleProps {
	title: string;
	description?: string;
	buttonLabel?: string;
	onClick: () => void;
}

export function TableTitle({
	title,
	description,
	buttonLabel,
	onClick,
}: TableTitleProps) {
	const t = useTranslations("common");

	return (
		<div className="flex items-center justify-between mb-6">
			<div>
				<h1 className="text-2xl font-bold text-foreground">{title}</h1>
				{description && (
					<p className="text-sm text-muted-foreground mt-1">{description}</p>
				)}
			</div>
			<Button
				onClick={onClick}
				className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
				id="table-title-add-btn"
			>
				<Plus className="h-4 w-4" />
				{buttonLabel ?? t("add")}
			</Button>
		</div>
	);
}