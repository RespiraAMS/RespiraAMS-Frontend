"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
	const [patients, setPatients] = useState<Patient[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [totalPages, setTotalPages] = useState(1);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);

	const [stats, setStats] = useState({ total: 0, male: 0, female: 0 });
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [activeFilter, setActiveFilter] = useState<StatFilter>("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [reloadKey, setReloadKey] = useState(0);

	// Dialog states
	const [isAddEditOpen, setIsAddEditOpen] = useState(false);
	const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

	const reload = useCallback(() => setReloadKey((k) => k + 1), []);

	// Debounce search input
	useEffect(() => {
		const timer = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 350);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Summary counts (use page size 1 and read the total from pagination metadata)
	useEffect(() => {
		let cancelled = false;
		Promise.all([
			fetchPatients({ page: 1, size: 1 }),
			fetchPatients({ page: 1, size: 1, gender: "Male" }),
			fetchPatients({ page: 1, size: 1, gender: "Female" }),
		])
			.then(([all, male, female]) => {
				if (cancelled) return;
				setStats({
					total: all.totalCount,
					male: male.totalCount,
					female: female.totalCount,
				});
			})
			.catch(() => {
				// Stat cards are informational; list loading reports errors.
			});
		return () => {
			cancelled = true;
		};
	}, [reloadKey]);

	// Patients list (server-side pagination, filter & search)
	useEffect(() => {
		let cancelled = false;
		setIsLoading(true);
		setLoadError(null);

		const request = debouncedQuery
			? searchPatients({
					page: currentPage,
					size: PAGE_SIZE,
					searchTerm: debouncedQuery,
				})
			: fetchPatients({
					page: currentPage,
					size: PAGE_SIZE,
					gender: activeFilter === "all" ? undefined : activeFilter,
				});

		request
			.then((result) => {
				if (cancelled) return;
				setPatients(result.items);
				setTotalCount(result.totalCount);
				setTotalPages(result.totalPages);
			})
			.catch((err) => {
				if (cancelled) return;
				setPatients([]);
				setTotalCount(0);
				setTotalPages(1);
				setLoadError(errorText(err));
			})
			.finally(() => {
				if (!cancelled) setIsLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [currentPage, debouncedQuery, activeFilter, reloadKey]);

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
		setActionError(null);
		try {
			// List items only carry summary data, load the full record for editing
			setEditingPatient(await fetchPatientById(patient.id));
			setIsAddEditOpen(true);
		} catch (err) {
			setActionError(errorText(err));
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
		if (id) {
			await updatePatient(id, payload);
		} else {
			await createPatient(payload);
			setCurrentPage(1);
		}
		reload();
	};

	const handleConfirmDelete = async (id: string) => {
		await deletePatient(id);
		// Move back a page if the last item of the last page was removed
		if (patients.length === 1 && currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
		reload();
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

			{actionError && (
				<p className="mt-4 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-[10px] px-3.5 py-2.5">
					{actionError}
				</p>
			)}

			{/* Main Patients Table with actions & pagination */}
			<PatientsTable
				patients={patients}
				totalCount={totalCount}
				pageSize={PAGE_SIZE}
				isLoading={isLoading}
				errorMessage={loadError}
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={setCurrentPage}
				onViewDetails={handleViewDetails}
				onEditPatient={handleEditPatient}
				onDeletePatient={handleDeletePatient}
			/>

			{/* Add/Edit Modal */}
			<PatientDialog
				open={isAddEditOpen}
				onOpenChange={setIsAddEditOpen}
				initialData={editingPatient}
				onSave={handleSavePatient}
			/>

			{/* Confirm Delete Modal */}
			<DeletePatientDialog
				open={isDeleteOpen}
				onOpenChange={setIsDeleteOpen}
				patient={patientToDelete}
				onConfirmDelete={handleConfirmDelete}
			/>
		</div>
	);
}
