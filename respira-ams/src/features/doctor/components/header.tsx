"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import AccountSection from "@/features/doctor/components/accountSection";

export function DoctorHeader() {
	const [searchValue, setSearchValue] = useState("");

	return (
		<header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6 justify-between sticky top-0 z-20">
			<div className="relative flex-1 max-w-md">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
				<Input
					value={searchValue}
					onChange={(e) => setSearchValue(e.target.value)}
					placeholder="Tìm kiếm thông tin bệnh nhân, ca bệnh, kháng sinh..."
					className="pl-9 pr-9 h-9"
					id="doctor-search-input"
				/>
				{searchValue && (
					<button
						type="button"
						onClick={() => setSearchValue("")}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
						id="doctor-search-clear"
					>
						<X className="h-4 w-4" />
					</button>
				)}
			</div>

			<div className="flex items-center gap-2">
				<AccountSection />
			</div>
		</header>
	);
}

export default DoctorHeader;
