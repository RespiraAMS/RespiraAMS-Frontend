export function AwareBadge({ classification }: { classification: string }) {
    switch (classification) {
        case "Access":
            return (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    Access
                </span>
            );
        case "Watch":
            return (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                    Watch
                </span>
            );
        case "Reserve":
            return (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                    Reserve
                </span>
            );
        default:
            return (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {classification}
                </span>
            );
    }
}

export function translateSeverity(severity: string) {
    switch (severity) {
        case "Mild":
            return "Nhẹ";
        case "Moderate":
            return "Trung bình";
        case "Severe":
            return "Nặng";
        default:
            return severity;
    }
}

export function translateSite(site: string) {
    switch (site) {
        case "Outpatient":
            return "Ngoại trú";
        case "Inpatient":
            return "Nội trú";
        case "ICU":
            return "Hồi sức tích cực";
        default:
            return site;
    }
}