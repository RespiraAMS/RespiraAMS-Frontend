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
import { AntibioticsTable } from "./AntibioticsTable";
import { AntibioticForm } from "./AntibioticForm";
import { type AntibioticItem } from "../types";

type ActiveView = "create" | "update" | "delete" | null;

export function AntibioticsView() {
	const [activeView, setActiveView] = useState<ActiveView>(null);
	const [selected, setSelected] = useState<AntibioticItem | null>(null);

	const openView = (view: ActiveView, item?: AntibioticItem) => {
		setSelected(item ?? null);
		setActiveView(view);
	};

	const closeView = () => {
		setActiveView(null);
		setSelected(null);
	};

	return (
		<>
			<TableTitle
				title="Kháng sinh"
				description="Quản lý danh sách kháng sinh theo phổ và phân loại AWaRe."
				buttonLabel="Thêm kháng sinh"
				onClick={() => openView("create")}
			/>

			<AntibioticsTable
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
							{activeView === "create" && "Tạo mới Kháng sinh"}
							{activeView === "update" && "Cập nhật Kháng sinh"}
						</DialogTitle>
						<DialogDescription>
							{activeView === "create" && "Điền thông tin để tạo kháng sinh mới."}
							{activeView === "update" && "Chỉnh sửa thông tin kháng sinh."}
						</DialogDescription>
					</DialogHeader>

					<div className="py-2">
						{(activeView === "create" || (activeView === "update" && selected)) && (
							<AntibioticForm
								initialData={activeView === "update" ? selected : null}
								onSubmit={closeView}
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
						<SheetTitle>Xóa Kháng sinh</SheetTitle>
						<SheetDescription>
							Xác nhận xóa kháng sinh{" "}
							<strong className="text-red-600">{selected?.name}</strong>. Thao
							tác này không thể hoàn tác.
						</SheetDescription>
					</SheetHeader>

					<div className="mt-6 flex flex-col gap-4 px-1">
						<div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
							Bạn có chắc chắn muốn xóa kháng sinh{" "}
							<span className="font-bold">{selected?.name}</span> không?
						</div>
						<div className="flex gap-2 justify-end">
							<Button variant="outline" onClick={closeView} id="delete-antibiotic-cancel">
								Hủy
							</Button>
							<Button variant="destructive" onClick={closeView} id="delete-antibiotic-confirm">
								Xác nhận Xóa
							</Button>
						</div>
					</div>
				</SheetContent>
			</Sheet>
		</>
	);
}
