import { CriteriaDetail } from "@/features/manager/criteria/components/CriteriaDetail";
import { use } from "react";

export default function ClinicalVariableDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    const cleanId = decodeURIComponent(unwrappedParams.id);

    return (
        <div className="p-6">
            <CriteriaDetail id={cleanId} />
        </div>
    );
}