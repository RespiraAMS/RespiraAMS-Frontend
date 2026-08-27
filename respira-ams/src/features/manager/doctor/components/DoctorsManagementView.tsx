"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
} from "@/components/ui/sheet";
import { DoctorsTable } from "./DoctorsTable";
import { DoctorForm } from "./DoctorForm";
import { DeletePanel } from "./DeletePanel";
import { type DoctorItem } from "../types";

type ActiveView = "create" | "delete" | null;

export function DoctorsManagementView() {
	const [activeView, setActiveView] = useState<ActiveView>(null);
	const [selectedDoctor, setSelectedDoctor] = useState<DoctorItem | null>(null);

	const openView = (view: ActiveView, item?: DoctorItem) => {
		setSelectedDoctor(item ?? null);
		setActiveView(view);
	};

	const closeView = () => {
		setActiveView(null);
		setSelectedDoctor(null);
	};

	return (
		<div className="container mx-auto pb-10 space-y-6 animate-in fade-in duration-300">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-primary">Quản lý Bác sĩ</h1>
					<p className="text-sm text-zinc-500 mt-1">
						Quản lý hồ sơ, tài khoản và quyền truy cập hệ thống của bác sĩ.
					</p>
				</div>
				<Button
					onClick={() => openView("create")}
					className="gap-2 bg-primary hover:bg-primary/90"
					id="add-doctor-btn"
				>
					<Plus className="h-4 w-4" /> Thêm Bác sĩ
				</Button>
			</div>

			{/* Table */}
			<DoctorsTable onDelete={(doc) => openView("delete", doc)} />

			{/* Create Doctor Dialog */}
			<Dialog
				open={activeView === "create"}
				onOpenChange={(open) => { if (!open) closeView(); }}
			>
				<DialogContent className="p-0 border-none bg-transparent shadow-none [&>button]:hidden max-w-2xl lg:max-w-4xl">
					{/* Hidden for a11y */}
					<div className="hidden">
						<DialogHeader>
							<DialogTitle>Tạo tài khoản Bác sĩ</DialogTitle>
							<DialogDescription>Modal tạo bác sĩ mới</DialogDescription>
						</DialogHeader>
					</div>

					<div className="max-h-[90vh] overflow-hidden rounded-md flex flex-col bg-white">
						<div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
							<h2 className="text-lg font-bold text-gray-700">
								Tạo tài khoản Bác sĩ
							</h2>
							<p className="text-xs text-zinc-500 mt-1">
								Điền đầy đủ thông tin để tạo hồ sơ bác sĩ mới.
							</p>
						</div>
						<div className="p-6 overflow-y-auto">
							<DoctorForm
								onSubmit={() => {
									// UI-only: đóng dialog sau khi "submit"
									closeView();
								}}
								onCancel={closeView}
							/>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Delete Doctor Sheet */}
			<Sheet
				open={activeView === "delete"}
				onOpenChange={(open) => { if (!open) closeView(); }}
			>
				<SheetContent side="right">
					<SheetHeader>
						<SheetTitle>Xóa hồ sơ Bác sĩ</SheetTitle>
						<SheetDescription>
							Xác nhận xóa bác sĩ khỏi hệ thống. Thao tác này không thể hoàn
							tác.
						</SheetDescription>
					</SheetHeader>

					<div className="py-4 mt-4">
						{activeView === "delete" && selectedDoctor && (
							<DeletePanel
								doctorName={`${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
								onConfirm={closeView} // UI-only: đóng sheet
								onCancel={closeView}
							/>
						)}
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}
