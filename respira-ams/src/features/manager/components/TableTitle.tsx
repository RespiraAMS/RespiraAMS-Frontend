"use client";

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
	buttonLabel = "Thêm",
	onClick,
}: TableTitleProps) {
	return (
		<div className="flex items-center justify-between mb-6">
			<div>
				<h1 className="text-2xl font-bold text-primary">{title}</h1>
				{description && (
					<p className="text-sm text-zinc-500 mt-1">{description}</p>
				)}
			</div>
			<Button onClick={onClick} className="gap-2" id="table-title-add-btn">
				<Plus className="h-4 w-4" />
				{buttonLabel}
			</Button>
		</div>
	);
}
