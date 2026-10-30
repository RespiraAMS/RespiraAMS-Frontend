"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { INITIAL_PATIENTS } from "../mockData";
import { Patient, StatFilter } from "../types";
import { PatientStatsCards } from "./PatientStatsCards";
import { PatientSearchBar } from "./PatientSearchBar";
import { PatientsTable } from "./PatientsTable";
import { PatientDialog } from "./PatientDialog";
import { PatientDetailsDialog } from "./PatientDetailsDialog";
import { DeletePatientDialog } from "./DeletePatientDialog";

export function PatientsView() {
	const router = useRouter();
	const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
	const [searchQuery, setSearchQuery] = useState("");
	const [activeFilter, setActiveFilter] = useState<StatFilter>("all");
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 8;

	// Dialog states
	const [isAddEditOpen, setIsAddEditOpen] = useState(false);
	const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

	// Stats counts
	const stats = useMemo(() => {
		const total = patients.length;
		const attention = patients.filter((p) => p.risk === "attention").length;
		const highRisk = patients.filter((p) => p.risk === "high").length;
		return { total, attention, highRisk };
	}, [patients]);

	// Filtered & Searched patients
	const filteredPatients = useMemo(() => {
		return patients.filter((p) => {
			// Filter by Stat card
			if (activeFilter === "attention" && p.risk !== "attention") return false;
			if (activeFilter === "high" && p.risk !== "high") return false;

			// Filter by Search Query
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase().trim();
				const matchName = p.name.toLowerCase().includes(q);
				const matchCode = p.code.toLowerCase().includes(q);
				if (!matchName && !matchCode) return false;
			}

			return true;
		});
	}, [patients, activeFilter, searchQuery]);

	// Pagination
	const totalPages = Math.max(1, Math.ceil(filteredPatients.length / pageSize));
	const paginatedPatients = useMemo(() => {
		const start = (currentPage - 1) * pageSize;
		return filteredPatients.slice(start, start + pageSize);
	}, [filteredPatients, currentPage, pageSize]);

	// Handlers
	const handleFilterChange = (filter: StatFilter) => {
		setActiveFilter(filter);
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

	const handleEditPatient = (patient: Patient) => {
		setEditingPatient(patient);
		setIsAddEditOpen(true);
	};

	const handleViewDetails = (patient: Patient) => {
		router.push(`/doctor/patients/${patient.id}`);
	};

	const handleDeletePatient = (patient: Patient) => {
		setPatientToDelete(patient);
		setIsDeleteOpen(true);
	};

	const handleSavePatient = (saved: Patient) => {
		setPatients((prev) => {
			const index = prev.findIndex((p) => p.id === saved.id);
			if (index >= 0) {
				const next = [...prev];
				next[index] = saved;
				return next;
			}
			return [saved, ...prev];
		});
	};

	const handleConfirmDelete = (id: string) => {
		setPatients((prev) => prev.filter((p) => p.id !== id));
	};

	return (
		<div className="p-6 max-w-[1300px] mx-auto">
			{/* Top 3 Summary Stats Cards */}
			<PatientStatsCards
				total={stats.total}
				attention={stats.attention}
				highRisk={stats.highRisk}
				activeFilter={activeFilter}
				onFilterChange={handleFilterChange}
			/>

			{/* Search input with Ctrl+K & Add Patient button */}
			<PatientSearchBar
				searchQuery={searchQuery}
				onSearchChange={handleSearchChange}
				onAddPatient={handleAddPatient}
			/>

			{/* Main Patients Table with actions & pagination */}
			<PatientsTable
				patients={paginatedPatients}
				totalCount={filteredPatients.length}
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

			{/* View Details Modal */}
			<PatientDetailsDialog
				open={isDetailsOpen}
				onOpenChange={setIsDetailsOpen}
				patient={selectedPatient}
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
