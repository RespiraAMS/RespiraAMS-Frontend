export function SeverityBadge({ severity }: { severity: string }) {
	const s = severity?.toLowerCase() ?? "";
	if (s === "mild")
		return (
			<span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize bg-primary/10 text-primary">
				{severity}
			</span>
		);
	if (s === "moderate")
		return (
			<span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
				{severity}
			</span>
		);
	if (s === "severe")
		return (
			<span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
				{severity}
			</span>
		);
	return (
		<span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize bg-muted text-muted-foreground">
			{severity}
		</span>
	);
}

export function AwareBadge({ category }: { category: string }) {
	const cat = category?.toLowerCase() ?? "";
	if (cat === "access")
		return (
			<span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
				{category}
			</span>
		);
	if (cat === "accesswatch")
		return (
			<span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
				{category}
			</span>
		);
	if (cat === "watch")
		return (
			<span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
				{category}
			</span>
		);
	if (cat === "reserve")
		return (
			<span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
				{category}
			</span>
		);
	return (
		<span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize bg-muted text-muted-foreground">
			{category}
		</span>
	);
}
