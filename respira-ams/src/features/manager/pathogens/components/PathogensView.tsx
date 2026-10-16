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
import { PathogensTable } from "./PathogensTable";
import { PathogenForm } from "./PathogenForm";
import { type PathogenItem, type CreatePathogenRequest } from "../types";

type ActiveView = "create" | "update" | "delete" | null;

// ─── PathogensView ────────────────────────────────────────────────────────────

export function PathogensView() {
	const [activeView, setActiveView] = useState<ActiveView>(null);
	const [selected, setSelected] = useState<PathogenItem | null>(null);

	const openView = (view: ActiveView, item?: PathogenItem) => {
		setSelected(item ?? null);
		setActiveView(view);
	};

	const closeView = () => {
		setActiveView(null);
		setSelected(null);
	};

	// UI-only: simulate submit (no API call)
	const handleSubmit = (_data: CreatePathogenRequest) => {
		closeView();
	};

	return (
		<>
			<TableTitle
				title="Tác nhân gây bệnh"
				description="Quản lý danh sách tác nhân gây bệnh hô hấp."
				buttonLabel="Thêm tác nhân"
				onClick={() => openView("create")}
			/>

			<PathogensTable
				onEdit={(item) => openView("update", item)}
				onDelete={(item) => openView("delete", item)}
			/>

			{/* Create / Update Dialog */}
			<Dialog
				open={activeView === "create" || activeView === "update"}
				onOpenChange={(open) => { if (!open) closeView(); }}
			>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>
							{activeView === "create" && "Tạo mới Tác nhân gây bệnh"}
							{activeView === "update" && "Cập nhật Tác nhân gây bệnh"}
						</DialogTitle>
						<DialogDescription>
							{activeView === "create" && "Điền thông tin để tạo tác nhân gây bệnh mới."}
							{activeView === "update" && "Chỉnh sửa thông tin tác nhân gây bệnh."}
						</DialogDescription>
					</DialogHeader>

					<div className="py-2">
						{(activeView === "create" || (activeView === "update" && selected)) && (
							<PathogenForm
								initialData={activeView === "update" ? selected : null}
								onSubmit={handleSubmit}
								onCancel={closeView}
							/>
						)}
					</div>
				</DialogContent>
			</Dialog>

			{/* Delete Sheet */}
			<Sheet
				open={activeView === "delete"}
				onOpenChange={(open) => { if (!open) closeView(); }}
			>
				<SheetContent side="right">
					<SheetHeader>
						<SheetTitle>Xóa Tác nhân gây bệnh</SheetTitle>
						<SheetDescription>
							Xác nhận xóa tác nhân{" "}
							<strong className="text-red-600">{selected?.name}</strong>. Thao tác này
							không thể hoàn tác.
						</SheetDescription>
					</SheetHeader>

					<div className="mt-6 flex flex-col gap-4 px-1">
						<div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
							Bạn có chắc chắn muốn xóa tác nhân gây bệnh{" "}
							<span className="font-bold">{selected?.name}</span> không?
						</div>
						<div className="flex gap-2 justify-end">
							<Button
								variant="outline"
								onClick={closeView}
								id="delete-pathogen-cancel"
							>
								Hủy
							</Button>
							<Button
								variant="destructive"
								onClick={closeView}
								id="delete-pathogen-confirm"
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
