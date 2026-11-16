"use client";

import Link from "next/link";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PatientDetail } from "@/features/doctor/patients/types";
import { calculateAge } from "../validation";

interface PatientContextHeaderProps {
    patient: PatientDetail | null;
    patientId: string;
    isLoadingPatient?: boolean;
    hasPreviousDiagnosis?: boolean;
}

export function PatientContextHeader({
    patient,
    patientId,
    isLoadingPatient,
    hasPreviousDiagnosis,
}: PatientContextHeaderProps) {
    const age = calculateAge(patient?.dateOfBirth);

    return (
        <div className="mb-5 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                            Hồ sơ bệnh nhân điều trị
                        </span>
                        {hasPreviousDiagnosis && (
                            <Badge variant="secondary" className="text-[11px]">
                                Đã tham chiếu chỉ số từ lần điều trị gần nhất
                            </Badge>
                        )}
                    </div>

                    {isLoadingPatient ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Đang tải thông tin bệnh nhân...</span>
                        </div>
                    ) : (
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base font-bold text-foreground">
                                {patient?.fullName || `Mã bệnh nhân: ${patientId}`}
                            </h2>
                            {patient?.medicalRecordCode && (
                                <Badge variant="secondary">{patient.medicalRecordCode}</Badge>
                            )}
                            {age !== undefined && <Badge variant="outline">{age} tuổi</Badge>}
                            {patient?.gender && (
                                <Badge variant="outline">
                                    {patient.gender === "Male" ? "Nam" : "Nữ"}
                                </Badge>
                            )}
                            {patient?.height !== undefined && patient?.weight !== undefined && (
                                <Badge variant="outline">
                                    {patient.height} cm • {patient.weight} kg
                                </Badge>
                            )}
                        </div>
                    )}
                </div>

                {patientId && (
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/doctor/patients/${patientId}`} className="gap-1.5">
                            <FileText className="h-3.5 w-3.5" />
                            Xem hồ sơ bệnh nhân
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}