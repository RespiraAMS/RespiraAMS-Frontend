import { type ParsedDiagnosis } from "../../types";
import { translateSeverity, translateSite } from "../treatment-plan-utils";

interface PlanProtocolsCardProps {
    protocols: ParsedDiagnosis["protocols"];
}

export function PlanProtocolsCard({ protocols }: PlanProtocolsCardProps) {
    if (!protocols?.length) return null;

    return (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Phác đồ hệ thống khuyến cáo ({protocols.length})
            </h4>

            <div className="space-y-3">
                {protocols.map((proto, idx) => (
                    <div
                        key={proto.id}
                        className="p-3 rounded-lg border border-border bg-muted/20 space-y-2"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-semibold text-xs text-foreground">
                                Nhóm phác đồ #{idx + 1} - {translateSeverity(proto.severity)} (
                                {translateSite(proto.treatmentSite)})
                            </span>
                            {proto.criteria.length > 0 && (
                                <span className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                                    Tiêu chí: {proto.criteria.map((c) => c.name).join("; ")}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {proto.medicines.map((combo, cIdx) => (
                                <span
                                    key={cIdx}
                                    className="inline-flex items-center px-2 py-1 rounded bg-background border border-border text-xs font-medium"
                                >
                                    {combo.map((m) => m.name).join(" + ")}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}