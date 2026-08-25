import { DoctorSidebar } from "@/features/doctor/components/sidebar"
import { DoctorHeader } from "@/features/doctor/components/header"

export default function DoctorLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex">
      <DoctorSidebar />
      <div className="flex flex-1 flex-col min-h-screen">
        <DoctorHeader />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
