import { AnalysisReportDetail } from "@/features/doctor/analysis/components/AnalysisReportDetail";
import { use } from "react";

export default function AntibioticDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    const cleanId = decodeURIComponent(unwrappedParams.id);

    return (
        <div className="p-6">
            <AnalysisReportDetail analysisId={cleanId}/>
        </div>
    );
}