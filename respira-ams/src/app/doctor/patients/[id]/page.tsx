import { PatientDetail } from "@/features/doctor/patients/components/PatientDetail";
import { use } from "react";

export default function ClinicalVariableDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    const cleanId = decodeURIComponent(unwrappedParams.id);

    return (
        <div className="p-6">
			<PatientDetail id={cleanId} isHeadDepartmentDoctor/>
        </div>
    );
}