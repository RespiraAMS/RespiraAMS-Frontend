import { ShieldAlert, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type ParsedDiagnosis } from "../../types";
import { translateSeverity, translateSite } from "../treatment-plan-utils";

interface PlanClassificationCardProps {
    diagnosis: ParsedDiagnosis;
}

export function PlanClassificationCard({ diagnosis }: PlanClassificationCardProps) {
    const hasAllergies =
        diagnosis.allergy?.type === "Yes" &&
        diagnosis.allergy.allergicAntibiotics.length > 0;

    return (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-primary" /> Phân loại
            </h4>

            <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-lg bg-muted/50 border border-border">
                    <span className="text-xs text-muted-foreground block">Mức độ nặng</span>
                    <span className="font-bold text-foreground">
                        {translateSeverity(diagnosis.severity)}
                    </span>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/50 border border-border">
                    <span className="text-xs text-muted-foreground block">Nơi điều trị</span>
                    <span className="font-bold text-foreground">
                        {translateSite(diagnosis.treatmentSite)}
                    </span>
                </div>
            </div>

            {hasAllergies && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                        <span className="font-semibold text-rose-700 dark:text-rose-400">
                            Dị ứng kháng sinh:{" "}
                        </span>
                        <span className="text-foreground font-medium">
                            {diagnosis.allergy.allergicAntibiotics
                                .map((a) => a.name)
                                .join(", ")}
                        </span>
                    </div>
                </div>
            )}

            {diagnosis.otherInfections?.length > 0 && (
                <div className="text-xs">
                    <span className="text-muted-foreground block mb-1">
                        Nhiễm trùng kèm theo:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {diagnosis.otherInfections.map((inf) => (
                            <Badge key={inf} variant="secondary" className="text-[11px]">
                                {inf}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}