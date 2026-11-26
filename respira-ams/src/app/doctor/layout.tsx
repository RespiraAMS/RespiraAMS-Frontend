import { redirect } from 'next/navigation';
import { DoctorSidebar } from '@/features/doctor/components/DoctorSidebar';
import { canAccessArea, getDefaultDashboard, normalizeRole, ROLE_HEAD_DEPARTMENT_DOCTOR } from '@/lib/roles';
import { getSession } from '@/lib/session';



export default async function DoctorLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await getSession();

    if (!canAccessArea(session.role, 'doctor')) {
        redirect(getDefaultDashboard(session.role));
    }

    const isHeadDepartmentDoctor = normalizeRole(session.role) === ROLE_HEAD_DEPARTMENT_DOCTOR;

    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground min-h-dvh flex-col lg:flex-row">
            <DoctorSidebar role={isHeadDepartmentDoctor ? "HeadDepartmentDoctor" : "Doctor"}/>
            <div className="flex flex-1 flex-col overflow-hidden">
                <main className="flex-1 overflow-auto bg-background text-foreground">
                    {children}
                </main>
            </div>
        </div>
    );
}
