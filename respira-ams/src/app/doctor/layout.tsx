import { DoctorSidebar } from '@/features/doctor/components/DoctorSidebar';
import { getSession } from '@/lib/session';



export default async function DoctorLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await getSession();
    const isHeadDepartmentDoctor = session.role?.toLowerCase()==="headdepartmentdoctor";

    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            <DoctorSidebar role={isHeadDepartmentDoctor ? "HeadDepartmentDoctor" : "Doctor"}/>
            <div className="flex flex-1 flex-col overflow-hidden">
                <main className="flex-1 overflow-auto bg-background text-foreground">
                    {children}
                </main>
            </div>
        </div>
    );
}
