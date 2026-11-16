import {
    AcademicTitle,
    AccountStatus,
    DoctorDegree,
    DoctorGender,
    DoctorPosition,
    DoctorRole,
} from "./types";

export const GENDER_LABELS: Record<DoctorGender, string> = {
    Male: "Nam",
    Female: "Nữ",
};

export const ACADEMIC_TITLE_LABELS: Record<AcademicTitle, string> = {
    None: "Không",
    AssociateProfessor: "Phó Giáo sư (PGS)",
    Professor: "Giáo sư (GS)",
};

export const POSITION_LABELS: Record<DoctorPosition, string> = {
    StaffDoctor: "Bác sĩ điều trị",
    SeniorDoctor: "Bác sĩ chính / Cao cấp",
    DepartmentDeputyHead: "Phó Trưởng khoa",
    HeadOfDepartment: "Trưởng khoa",
    DeputyDirector: "Phó Giám đốc",
    Director: "Giám đốc",
};

export const ROLE_LABELS: Record<DoctorRole, string> = {
    HeadDepartmentDoctor: "Trưởng khoa (Quản lý)",
    Doctor: "Bác sĩ",
};

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
    Active: "Đang hoạt động",
    InActive: "Ngừng hoạt động",
};

export const DEGREE_LABELS: Record<DoctorDegree, string> = {
    Professor: "Giáo sư",
    Doctor: "Bác sĩ",
    Master: "Thạc sĩ",
    Bachelor: "Cử nhân",
    Associate: "Cao đẳng",
    Undergraduate: "Đại học",
    Graduate: "Sau đại học",
    PhD: "Tiến sĩ",
    PostDoc: "Sau tiến sĩ",
};

export function formatDoctorFullName(doctor: {
    firstName: string;
    lastName: string;
    academicTitle?: string;
}): string {
    const prefix =
        doctor.academicTitle === "Professor"
            ? "GS. "
            : doctor.academicTitle === "AssociateProfessor"
            ? "PGS. "
            : "BS. ";
    return `${prefix}${doctor.lastName} ${doctor.firstName}`.trim();
}