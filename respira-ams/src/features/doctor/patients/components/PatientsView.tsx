"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Patient, PatientPayload, StatFilter } from "../types";
import {
	createPatient,
	deletePatient,
	fetchPatientById,
	fetchPatients,
	searchPatients,
	updatePatient,
} from "../api";
import { PatientStatsCards } from "./PatientStatsCards";
import { PatientSearchBar } from "./PatientSearchBar";
import { PatientsTable } from "./PatientsTable";
import { PatientDialog } from "./PatientDialog";
import { DeletePatientDialog } from "./DeletePatientDialog";

const PAGE_SIZE = 8;

function errorText(err: unknown): string {
	return err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.";
}

export function PatientsView() {
	const router = useRouter();
	const queryClient = useQueryClient();

	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [activeFilter, setActiveFilter] = useState<StatFilter>("all");
	const [currentPage, setCurrentPage] = useState(1);

	// Dialog states
	const [isAddEditOpen, setIsAddEditOpen] = useState(false);
	const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

	// Debounce search input nhanh (180ms)
	useEffect(() => {
		const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 180);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	// React Query: Summary counts (cache lâu dài, chỉ refetch khi có update/delete)
	const { data: statsData } = useQuery({
		queryKey: ["patients", "stats"],
		queryFn: async () => {
			const [all, male, female] = await Promise.all([
				fetchPatients({ page: 1, size: 1 }),
				fetchPatients({ page: 1, size: 1, gender: "Male" }),
				fetchPatients({ page: 1, size: 1, gender: "Female" }),
			]);
			return {
				total: all.totalCount,
				male: male.totalCount,
				female: female.totalCount,
			};
		},
	});

	const stats = statsData ?? { total: 0, male: 0, female: 0 };

	// React Query: Patients list (server-side pagination, filter & search)
	const {
		data: listData,
		isLoading,
		error: queryError,
	} = useQuery({
		queryKey: [
			"patients",
			"list",
			{ page: currentPage, size: PAGE_SIZE, query: debouncedQuery, filter: activeFilter },
		],
		queryFn: async () => {
			if (debouncedQuery) {
				return await searchPatients({
					page: currentPage,
					size: PAGE_SIZE,
					searchTerm: debouncedQuery,
				});
			}
			return await fetchPatients({
				page: currentPage,
				size: PAGE_SIZE,
				gender: activeFilter === "all" ? undefined : activeFilter,
			});
		},
	});

	const patients = listData?.items ?? [];
	const totalCount = listData?.totalCount ?? 0;
	const totalPages = listData?.totalPages ?? 1;
	const loadError = queryError ? errorText(queryError) : null;

	// Handlers
	const handleFilterChange = (filter: StatFilter) => {
		setActiveFilter(filter);
		setSearchQuery("");
		setDebouncedQuery("");
		setCurrentPage(1);
	};

	const handleSearchChange = (query: string) => {
		setSearchQuery(query);
		setCurrentPage(1);
	};

	const handleAddPatient = () => {
		setEditingPatient(null);
		setIsAddEditOpen(true);
	};

	const handleEditPatient = async (patient: Patient) => {
		try {
			// List items only carry summary data, load the full record for editing
			setEditingPatient(await fetchPatientById(patient.id));
			setIsAddEditOpen(true);
		} catch (err) {
			toast.error(errorText(err));
		}
	};

	const handleViewDetails = (patient: Patient) => {
		router.push(`/doctor/patients/${patient.id}`);
	};

	const handleDeletePatient = (patient: Patient) => {
		setPatientToDelete(patient);
		setIsDeleteOpen(true);
	};

	const handleSavePatient = async (payload: PatientPayload, id?: string) => {
		try {
			if (id) {
				await updatePatient(id, payload);
				toast.success("Cập nhật thông tin bệnh nhân thành công!");
			} else {
				await createPatient(payload);
				toast.success("Thêm mới hồ sơ bệnh nhân thành công!");
				setCurrentPage(1);
			}
			// Chỉ tự động refetch khi có update / create
			await queryClient.invalidateQueries({ queryKey: ["patients"] });
		} catch (err) {
			toast.error(errorText(err));
		}
	};

	const handleConfirmDelete = async (id: string) => {
		try {
			await deletePatient(id);
			toast.success("Đã xóa mềm hồ sơ bệnh nhân thành công!");
			if (patients.length === 1 && currentPage > 1) {
				setCurrentPage(currentPage - 1);
			}
			// Chỉ tự động refetch khi có xóa
			await queryClient.invalidateQueries({ queryKey: ["patients"] });
		} catch (err) {
			const rawMsg = err instanceof Error ? err.message : "";
			if (rawMsg.includes("already received treatments")) {
				toast.error("Bệnh nhân đã có phác đồ điều trị, hệ thống không cho phép xóa để bảo toàn bệnh án.");
			} else {
				toast.error(errorText(err));
			}
			throw err;
		}
	};

	return (
		<div className="p-6 max-w-[1300px] mx-auto">
			{/* Top 3 Summary Stats Cards */}
			<PatientStatsCards
				total={stats.total}
				male={stats.male}
				female={stats.female}
				activeFilter={activeFilter}
				onFilterChange={handleFilterChange}
			/>

			{/* Search input with Ctrl+K & Add Patient button */}
			<PatientSearchBar
				searchQuery={searchQuery}
				onSearchChange={handleSearchChange}
				onAddPatient={handleAddPatient}
			/>

			{/* Patients Table or Empty / Loading State */}
			<PatientsTable
				patients={patients}
				totalCount={totalCount}
				pageSize={PAGE_SIZE}
				totalPages={totalPages}
				currentPage={currentPage}
				isLoading={isLoading}
				errorMessage={loadError}
				onPageChange={setCurrentPage}
				onViewDetails={handleViewDetails}
				onEditPatient={handleEditPatient}
				onDeletePatient={handleDeletePatient}
			/>

			{/* Add / Edit Patient Modal */}
			<PatientDialog
				open={isAddEditOpen}
				initialData={editingPatient}
				onOpenChange={setIsAddEditOpen}
				onSave={handleSavePatient}
			/>

			{/* Confirm Delete Dialog */}
			<DeletePatientDialog
				open={isDeleteOpen}
				patient={patientToDelete}
				onOpenChange={setIsDeleteOpen}
				onConfirmDelete={handleConfirmDelete}
			/>
		</div>
	);
}
