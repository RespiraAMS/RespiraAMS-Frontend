import { PatientDetail } from "@/features/doctor/patients/components/PatientDetail";
import { getSession } from "@/lib/session";

export default async function ClinicalVariableDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = await params;
    const cleanId = decodeURIComponent(unwrappedParams.id);

    const session = await getSession();
    const isHeadDepartmentDoctor = session.role?.toLowerCase()==="headdepartmentdoctor";

    return (
        <div className="p-6">
			<PatientDetail id={cleanId} isHeadDepartmentDoctor={isHeadDepartmentDoctor}/>
        </div>
    );
}