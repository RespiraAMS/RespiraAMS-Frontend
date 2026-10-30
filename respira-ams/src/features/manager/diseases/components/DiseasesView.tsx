"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { TableTitle } from "@/features/manager/components/TableTitle";
import { DiseasesTable } from "./DiseasesTable";
import { DiseaseForm } from "./DiseaseForm";
import { type DiseaseItem, type CreateDiseaseRequest } from "../types";

type ActiveView = "create" | "update" | "delete" | "detail" | null;

// ─── DiseasesView ─────────────────────────────────────────────────────────────

export function DiseasesView() {
	const [activeView, setActiveView] = useState<ActiveView>(null);
	const [selected, setSelected] = useState<DiseaseItem | null>(null);

	const openView = (view: ActiveView, item?: DiseaseItem) => {
		setSelected(item ?? null);
		setActiveView(view);
	};

	const closeView = () => {
		setActiveView(null);
		setSelected(null);
	};

	const handleView = (item: DiseaseItem) => {
		setSelected(item);
		setActiveView("detail");
	};

	// UI-only: simulate submit
	const handleSubmit = (_data: CreateDiseaseRequest) => {
		closeView();
	};

	return (
		<>
			<TableTitle
				title="Bệnh truyền nhiễm"
				description="Quản lý danh sách bệnh truyền nhiễm đường hô hấp và tiêu chí nhập ICU."
				buttonLabel="Thêm bệnh"
				onClick={() => openView("create")}
			/>

			<DiseasesTable
				onView={handleView}
				onEdit={(item) => openView("update", item)}
				onDelete={(item) => openView("delete", item)}
			/>

			{/* Create / Update Dialog */}
			<Dialog
				open={activeView === "create" || activeView === "update"}
				onOpenChange={(open) => { if (!open) closeView(); }}
			>
				<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{activeView === "create" && "Tạo mới Bệnh truyền nhiễm"}
							{activeView === "update" && "Cập nhật Bệnh truyền nhiễm"}
						</DialogTitle>
						<DialogDescription>
							{activeView === "create" && "Điền thông tin để tạo bệnh mới."}
							{activeView === "update" && "Chỉnh sửa thông tin bệnh truyền nhiễm."}
						</DialogDescription>
					</DialogHeader>

					<div className="py-2">
						{(activeView === "create" || (activeView === "update" && selected)) && (
							<DiseaseForm
								initialData={activeView === "update" ? selected : null}
								onSubmit={handleSubmit}
								onCancel={closeView}
							/>
						)}
					</div>
				</DialogContent>
			</Dialog>

			{/* Detail Dialog */}
			<Dialog
				open={activeView === "detail"}
				onOpenChange={(open) => { if (!open) closeView(); }}
			>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle className="text-xl text-primary font-bold">
							{selected?.name}
						</DialogTitle>
						<DialogDescription>Chi tiết thông tin bệnh truyền nhiễm</DialogDescription>
					</DialogHeader>

					{selected && (
						<div className="space-y-4 py-2">
							<div>
								<h4 className="text-sm font-semibold text-muted-foreground mb-1">Mô tả</h4>
								<p className="text-sm text-foreground bg-muted/40 p-3 rounded-md leading-relaxed whitespace-normal">
									{selected.description}
								</p>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="rounded-lg border border-blue-200/80 bg-blue-50/50 p-3 dark:border-blue-800/40 dark:bg-blue-950/20">
									<span className="text-xs font-medium text-blue-700 dark:text-blue-300">
										Tiêu chí ICU chính
									</span>
									<p className="text-2xl font-bold text-blue-700 dark:text-blue-200 mt-1">
										{selected.requiredIcuMainCriteria}
									</p>
								</div>

								<div className="rounded-lg border border-amber-200/80 bg-amber-50/50 p-3 dark:border-amber-800/40 dark:bg-amber-950/20">
									<span className="text-xs font-medium text-amber-700 dark:text-amber-300">
										Tiêu chí ICU phụ
									</span>
									<p className="text-2xl font-bold text-amber-700 dark:text-amber-200 mt-1">
										{selected.requiredIcuSecondaryCriteria}
									</p>
								</div>
							</div>

							<div className="flex justify-end gap-2 pt-2 border-t">
								<Button variant="outline" onClick={closeView}>
									Đóng
								</Button>
								<Button onClick={() => openView("update", selected)}>
									Chỉnh sửa
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Delete Sheet */}
			<Sheet
				open={activeView === "delete"}
				onOpenChange={(open) => { if (!open) closeView(); }}
			>
				<SheetContent side="right">
					<SheetHeader>
						<SheetTitle>Xóa Bệnh truyền nhiễm</SheetTitle>
						<SheetDescription>
							Xác nhận xóa bệnh{" "}
							<strong className="text-red-600">{selected?.name}</strong>. Thao tác này
							không thể hoàn tác.
						</SheetDescription>
					</SheetHeader>

					<div className="mt-6 flex flex-col gap-4 px-1">
						<div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-300">
							Bạn có chắc chắn muốn xóa bệnh{" "}
							<span className="font-bold">{selected?.name}</span> không?
						</div>
						<div className="flex gap-2 justify-end">
							<Button
								variant="outline"
								onClick={closeView}
								id="delete-disease-cancel"
							>
								Hủy
							</Button>
							<Button
								variant="destructive"
								onClick={closeView}
								id="delete-disease-confirm"
							>
								Xác nhận Xóa
							</Button>
						</div>
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
}
