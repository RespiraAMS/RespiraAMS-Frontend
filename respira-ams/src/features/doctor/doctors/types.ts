export type DoctorGender = "Male" | "Female";

export type AcademicTitle = "None" | "AssociateProfessor" | "Professor";

export type DoctorPosition =
    | "StaffDoctor"
    | "SeniorDoctor"
    | "DepartmentDeputyHead"
    | "HeadOfDepartment"
    | "DeputyDirector"
    | "Director";

export type DoctorRole = "HeadDepartmentDoctor" | "Doctor";

export type AccountStatus = "Active" | "InActive";

export type DoctorDegree =
    | "Professor"
    | "Doctor"
    | "Master"
    | "Bachelor"
    | "Associate"
    | "Undergraduate"
    | "Graduate"
    | "PhD"
    | "PostDoc";

export interface DoctorSubordinateItem {
    id: string;
    accountId: string;
    role: DoctorRole | string;
    firstName: string;
    lastName: string;
    degrees: (DoctorDegree | string)[];
    academicTitle: AcademicTitle | string;
    position: DoctorPosition | string;
    gender: DoctorGender | string;
    citizenIdentificationNumber: string;
    dateOfBirth: string | null;
    address: string;
    mediaId: string | null;
    createdAt: string;
    email: string | null;
    phone: string | null;
    accountRole: string | null;
    accountStatus: AccountStatus | string | null;
    avatarUrl: string | null;
}

export interface PaginatedDoctors {
    metadata: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        totalItemCount: number;
        pageCount: number;
        currentPage: number;
        pageSize: number;
    };
    items: DoctorSubordinateItem[];
}

export interface DoctorDetail {
    id: string;
    accountId: string;
    role: DoctorRole | string;
    firstName: string;
    lastName: string;
    degrees: (DoctorDegree | string)[];
    academicTitle: AcademicTitle | string;
    position: DoctorPosition | string;
    gender: DoctorGender | string;
    citizenIdentificationNumber: string;
    dateOfBirth: string | null;
    address: string;
    mediaId: string | null;
    createdAt: string;
}

export interface DoctorSubordinatesParams {
    page: number;
    pageSize: number;
    searchTerm?: string;
    gender?: DoctorGender | null;
    academicTitle?: AcademicTitle | null;
    position?: DoctorPosition | null;
}