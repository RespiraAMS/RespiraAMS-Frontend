"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchStore } from "../stores/searchStore";

export function SearchInput({
	placeholder = "Tìm kiếm...",
}: {
	placeholder?: string;
}) {
	const [value, setValue] = useState("");
	const setSearchValue = useSearchStore((s) => s.setValue);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") setSearchValue(value);
	};

	return (
		<div className="flex flex-1 max-w-md gap-2">
			<div className="relative flex-1">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					value={value}
					onChange={(e) => setValue(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					className="pl-9"
					id="manager-search-input"
				/>
			</div>
			<Button
				onClick={() => setSearchValue(value)}
				id="manager-search-button"
				className="inline-flex items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-white"
			>
				<Search className="h-4 w-4 mr-1" /> Tìm kiếm
			</Button>
		</div>
	);
}
