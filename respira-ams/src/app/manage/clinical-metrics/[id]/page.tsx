import { ClinicalMetricDetail } from "@/features/manager/clinical-metrics/components/ClinicalMetricDetail";
import { use } from "react";

export default function AntibioticDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    const cleanId = decodeURIComponent(unwrappedParams.id);

    return (
        <div className="p-6">
            <ClinicalMetricDetail id={cleanId}/>
        </div>
    );
}