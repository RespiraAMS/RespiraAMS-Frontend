"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { DoctorsTable } from "./DoctorsTable";
import { DoctorDetailModal } from "./DoctorDetailModal";
import { DoctorSubordinateItem } from "../types";
import { formatDoctorFullName } from "../constants";
import { doctorKeys } from "../queries";
import { useAnalysisMutations } from "../../analysis/queries";
import { CreateAnalysisReportRequest } from "../../analysis/types";
import { CreateAnalysisReportForm } from "../../analysis/components/CreateAnalysisReportForm";

import { UserFormDialog } from "@/features/admin/users/components/UserFormDialog";
import { DeleteUserDialog } from "@/features/admin/users/components/DeleteUserDialog";
import {
	CreateUserPayload,
	UpdateUserPayload,
	UserItem,
} from "@/features/admin/users/types";
import {
	createUser,
	deleteUser,
	updateUser,
} from "@/features/admin/users/api";

function mapDoctorToUserItem(doctor: DoctorSubordinateItem): UserItem {
	const normalizedStatus =
		doctor.accountStatus === "InActive" || doctor.accountStatus === "Inactive"
			? "Inactive"
			: "Active";

	return {
		id: doctor.accountId,
		doctorId: doctor.id,
		email: doctor.email ?? "",
		phone: doctor.phone ?? "",
		firstName: doctor.firstName,
		lastName: doctor.lastName,
		role: (doctor.accountRole || doctor.role || "Doctor") as UserItem["role"],
		status: normalizedStatus,
		gender: (doctor.gender || "Male") as UserItem["gender"],
		citizenIdentificationNumber: doctor.citizenIdentificationNumber ?? "",
		dateOfBirth: doctor.dateOfBirth ?? "",
		address: doctor.address ?? "",
		degrees: (doctor.degrees ?? []) as UserItem["degrees"],
		academicTitle: (doctor.academicTitle || "None") as UserItem["academicTitle"],
		position: (doctor.position || "StaffDoctor") as UserItem["position"],
		mediaId: doctor.mediaId ?? undefined,
		avatarUrl: doctor.avatarUrl ?? undefined,
		createdAt: doctor.createdAt,
		isEmailConfirmed: true,
	};
}

export function DoctorsView() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const t = useTranslations("doctor.doctors");

	// Detail & Analysis Report modal states
	const [detailDoctor, setDetailDoctor] = useState<DoctorSubordinateItem | null>(null);
	const [reportDoctor, setReportDoctor] = useState<DoctorSubordinateItem | null>(null);

	// Create / Update / Delete dialog states
	const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<UserItem | null>(null);
	const [isSubmittingForm, setIsSubmittingForm] = useState(false);

	const [deleteTargetUser, setDeleteTargetUser] = useState<UserItem | null>(null);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const { createMutation } = useAnalysisMutations();

	const formatName = (doc: {
		firstName: string;
		lastName: string;
		academicTitle?: string;
	}) => formatDoctorFullName(doc, (key) => t(`prefixes.${key}`));

	const invalidateDoctorQueries = () => {
		void queryClient.invalidateQueries({ queryKey: doctorKeys.subordinates() });
		void queryClient.invalidateQueries({ queryKey: doctorKeys.details() });
		void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
	};

	// Create doctor
	const handleCreateUser = async (payload: CreateUserPayload) => {
		setIsSubmittingForm(true);
		try {
			const result = await createUser(payload);
			setIsFormDialogOpen(false);

			const displayName =
				[payload.lastName, payload.firstName].filter(Boolean).join(" ") ||
				payload.email;
			toast.success(t("toast.created", { name: displayName }));

			if (!result.emailSent) {
				toast.warning(t("toast.emailFailed"));
			}

			invalidateDoctorQueries();
		} catch (error) {
			console.error("Error creating doctor:", error);
			toast.error(
				error instanceof Error ? error.message : t("toast.createError")
			);
		} finally {
			setIsSubmittingForm(false);
		}
	};

	// Update doctor
	const handleUpdateUser = async (payload: UpdateUserPayload) => {
		setIsSubmittingForm(true);
		try {
			await updateUser(payload);
			setIsFormDialogOpen(false);
			setEditingUser(null);
			toast.success(t("toast.updated"));

			invalidateDoctorQueries();
		} catch (error) {
			console.error("Error updating doctor:", error);
			toast.error(
				error instanceof Error ? error.message : t("toast.updateError")
			);
		} finally {
			setIsSubmittingForm(false);
		}
	};

	// Delete doctor
	const handleConfirmDelete = async (user: UserItem) => {
		setIsDeleting(true);
		try {
			await deleteUser(user.id, user.doctorId, user.mediaId);
			setIsDeleteOpen(false);
			setDeleteTargetUser(null);

			toast.success(
				t("toast.deleted", {
					name: `${user.lastName} ${user.firstName}`.trim() || user.email,
				})
			);

			invalidateDoctorQueries();
		} catch (error) {
			console.error("Error deleting doctor:", error);
			toast.error(
				error instanceof Error ? error.message : t("toast.deleteError")
			);
		} finally {
			setIsDeleting(false);
		}
	};

	// Create analysis report for doctor
	const handleCreateReportSubmit = (payload: CreateAnalysisReportRequest) => {
		createMutation.mutate(payload, {
			onSuccess: (createdReport) => {
				toast.success(
					t("toast.createReportSuccess", {
						name: reportDoctor
							? formatName(reportDoctor)
							: t("toast.defaultDoctorName"),
					})
				);
				setReportDoctor(null);
				if (createdReport?.analysisId) {
					router.push(`/doctor/analysis/${createdReport.analysisId}`);
				}
			},
			onError: (error) => {
				toast.error(t("toast.createReportError", { error: error.message }));
			},
		});
	};

	return (
		<div className="space-y-6 text-foreground">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold tracking-tight text-foreground">
						{t("title")}
					</h2>
					<p className="text-muted-foreground mt-1">{t("subtitle")}</p>
				</div>

				<Button
					onClick={() => {
						setEditingUser(null);
						setIsFormDialogOpen(true);
					}}
					className="bg-primary text-primary-foreground hover:bg-primary/90 self-start sm:self-auto"
				>
					<Plus className="mr-2 h-4 w-4" />
					{t("actions.createDoctor")}
				</Button>
			</div>

			{/* Table */}
			<div className="rounded-xl border border-border bg-card text-card-foreground p-4 shadow-sm overflow-x-auto">
				<DoctorsTable
					onViewDetail={(doctor) => setDetailDoctor(doctor)}
					onCreateReport={(doctor) => setReportDoctor(doctor)}
					onEditDoctor={(doctor) => {
						setEditingUser(mapDoctorToUserItem(doctor));
						setIsFormDialogOpen(true);
					}}
					onDeleteDoctor={(doctor) => {
						setDeleteTargetUser(mapDoctorToUserItem(doctor));
						setIsDeleteOpen(true);
					}}
				/>
			</div>

			{/* Detail Modal */}
			<DoctorDetailModal
				doctorItem={detailDoctor}
				isOpen={!!detailDoctor}
				onClose={() => setDetailDoctor(null)}
				onCreateReport={(doctor) => setReportDoctor(doctor)}
			/>

			{/* Create Analysis Report Dialog */}
			<Dialog
				open={!!reportDoctor}
				onOpenChange={(open) => !open && setReportDoctor(null)}
			>
				<DialogContent className="sm:max-w-lg border-border bg-popover text-popover-foreground">
					<DialogHeader>
						<DialogTitle className="text-xl text-foreground">
							{t("createReportDialog.title")}
						</DialogTitle>
					</DialogHeader>
					{reportDoctor && (
						<CreateAnalysisReportForm
							doctorId={reportDoctor.id}
							doctorName={formatName(reportDoctor)}
							onSubmit={handleCreateReportSubmit}
							onCancel={() => setReportDoctor(null)}
							isPending={createMutation.isPending}
						/>
					)}
				</DialogContent>
			</Dialog>

			{/* Create / Update Doctor Dialog */}
			<UserFormDialog
				isOpen={isFormDialogOpen}
				onClose={() => {
					setIsFormDialogOpen(false);
					setEditingUser(null);
				}}
				editingUser={editingUser}
				onSubmitCreate={handleCreateUser}
				onSubmitUpdate={handleUpdateUser}
				isSubmitting={isSubmittingForm}
				isHeadpartmentDoctor
			/>

			{/* Delete Doctor Dialog */}
			<DeleteUserDialog
				user={deleteTargetUser}
				isOpen={isDeleteOpen}
				onClose={() => {
					setIsDeleteOpen(false);
					setDeleteTargetUser(null);
				}}
				onConfirmDelete={handleConfirmDelete}
				isDeleting={isDeleting}
			/>
		</div>
	);
}