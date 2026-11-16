import { ClinicalVariableDetail } from "@/features/manager/clinical-variables/components/ClinicalVariableDetail";
import { use } from "react";

export default function ClinicalVariableDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    const cleanId = decodeURIComponent(unwrappedParams.id);

    return (
        <div className="p-6">
            <ClinicalVariableDetail id={cleanId} />
        </div>
    );
}