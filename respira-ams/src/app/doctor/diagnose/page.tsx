import { Suspense } from "react";
import { DiagnoseWorkspace } from "@/features/doctor/diagnose/components/DiagnoseWorkspace";

export default function DiagnosePage() {
    return (
        <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Đang khởi tạo...</div>}>
            <DiagnoseWorkspace />
        </Suspense>
    );
}