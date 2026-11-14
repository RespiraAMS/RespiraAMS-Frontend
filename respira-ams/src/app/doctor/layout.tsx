import { DoctorSidebar } from '@/features/doctor/components/sidebar';
import { DoctorHeader } from '@/features/doctor/components/header';

export default function DoctorLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            <DoctorSidebar /> 
            <div className="flex flex-1 flex-col overflow-hidden">
                <DoctorHeader />
                <main className="flex-1 overflow-auto bg-background text-foreground">
                    {children}
                </main>
            </div>
        </div>
    );
}
