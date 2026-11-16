import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type ParsedDiagnosis } from "../../types";

interface PlanPathogensCardProps {
    heavySuspected?: ParsedDiagnosis["heavySuspected"];
    worthSuspected?: ParsedDiagnosis["worthSuspected"];
}

export function PlanPathogensCard({
    heavySuspected,
    worthSuspected,
}: PlanPathogensCardProps) {
    return (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tác nhân gây bệnh nghi ngờ
            </h4>

            {heavySuspected && heavySuspected.length > 0 && (
                <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Nguy cơ cao:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {heavySuspected.map((p) => (
                            <span
                                key={p.id}
                                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30"
                            >
                                {p.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {worthSuspected && worthSuspected.length > 0 && (
                <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-medium text-muted-foreground block">
                        Tác nhân nghi ngờ khác (Worth Suspected):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {worthSuspected.map((p) => (
                            <Badge key={p.id} variant="outline" className="font-normal text-xs">
                                {p.name}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}