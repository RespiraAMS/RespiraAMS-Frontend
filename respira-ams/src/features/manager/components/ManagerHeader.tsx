"use client";

import { usePathname } from "next/navigation";
import { SearchInput } from "./SearchInput";
import { AccountSection } from "./AccountSection";

// Các path không hiển thị search bar
const HIDE_SEARCH_PATHS = ["/manage/dashboard", "/manager/diseases/"];

export function ManagerHeader() {
	const pathname = usePathname();
	const showSearch = !HIDE_SEARCH_PATHS.some((path) =>
		pathname.startsWith(path)
	);

	return (
		<header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6 justify-between">
			{showSearch && <SearchInput placeholder="Tìm kiếm..." />}

			<div className={`flex items-center gap-2 ${showSearch ? "" : "ml-auto"}`}>
				<AccountSection />
			</div>
		</header>
	);
}
