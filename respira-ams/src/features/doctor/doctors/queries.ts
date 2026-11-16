import { useQuery } from "@tanstack/react-query";
import { getDoctorDetail, getSubordinateDoctors } from "./api";
import { DoctorSubordinatesParams } from "./types";

export const doctorKeys = {
    all: ["doctors"] as const,
    subordinates: () => [...doctorKeys.all, "subordinates"] as const,
    subordinateList: (params: DoctorSubordinatesParams) =>
        [...doctorKeys.subordinates(), params] as const,
    details: () => [...doctorKeys.all, "detail"] as const,
    detail: (doctorId: string) => [...doctorKeys.details(), doctorId] as const,
};

export function useSubordinateDoctors(params: DoctorSubordinatesParams) {
    return useQuery({
        queryKey: doctorKeys.subordinateList(params),
        queryFn: () => getSubordinateDoctors(params),
    });
}

export function useDoctorDetailModal(
    doctorId: string | null,
    options?: { enabled?: boolean }
) {
    return useQuery({
        queryKey: doctorKeys.detail(doctorId || ""),
        queryFn: () => getDoctorDetail(doctorId as string),
        enabled: (options?.enabled ?? true) && !!doctorId,
    });
}