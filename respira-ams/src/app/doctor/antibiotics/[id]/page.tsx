import { use } from "react";
import { AntibioticDetail } from "@/features/manager/antibiotics/components/AntibioticDetail";

export default function AntibioticDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    const cleanId = decodeURIComponent(unwrappedParams.id);

    return (
        <div className="p-6">
            <AntibioticDetail id={cleanId} />
        </div>
    );
}