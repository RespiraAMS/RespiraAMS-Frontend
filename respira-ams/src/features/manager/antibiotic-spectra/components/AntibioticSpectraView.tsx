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
import { AntibioticSpectraTable } from "./AntibioticSpectraTable";
import { CreateAntibioticSpectrumForm } from "./CreateAntibioticSpectrumForm";
import { UpdateAntibioticSpectrumForm } from "./UpdateAntibioticSpectrumForm";
import { type AntibioticSpectrumItem } from "../types";

type ActiveView = "create" | "update" | "delete" | null;

export function AntibioticSpectraView() {
	const [activeView, setActiveView] = useState<ActiveView>(null);
	const [selected, setSelected] = useState<AntibioticSpectrumItem | null>(
		null
	);

	const openView = (view: ActiveView, item?: AntibioticSpectrumItem) => {
		setSelected(item ?? null);
		setActiveView(view);
	};

	const closeView = () => {
		setActiveView(null);
		setSelected(null);
	};

	return (
		<>
			{/* Header */}
			<TableTitle
				title="Phổ kháng sinh"
				description="Quản lý danh sách phổ kháng sinh trong hệ thống."
				buttonLabel="Thêm phổ"
				onClick={() => openView("create")}
			/>

			{/* Table */}
			<AntibioticSpectraTable
				onEdit={(item) => openView("update", item)}
				onDelete={(item) => openView("delete", item)}
			/>

			{/* Create / Update Dialog */}
			<Dialog
				open={activeView === "create" || activeView === "update"}
				onOpenChange={(open) => {
					if (!open) closeView();
				}}
			>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>
							{activeView === "create" && "Tạo mới Phổ kháng sinh"}
							{activeView === "update" && "Cập nhật Phổ kháng sinh"}
						</DialogTitle>
						<DialogDescription>
							{activeView === "create" &&
								"Điền thông tin để tạo phổ kháng sinh mới."}
							{activeView === "update" &&
								"Chỉnh sửa thông tin phổ kháng sinh hiện tại."}
						</DialogDescription>
					</DialogHeader>

					<div className="py-2">
						{activeView === "create" && (
							<CreateAntibioticSpectrumForm
								onSubmit={closeView}
								onCancel={closeView}
							/>
						)}
						{activeView === "update" && selected && (
							<UpdateAntibioticSpectrumForm
								initialValues={selected}
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
				onOpenChange={(open) => {
					if (!open) closeView();
				}}
			>
				<SheetContent side="right">
					<SheetHeader>
						<SheetTitle>Xóa Phổ kháng sinh</SheetTitle>
						<SheetDescription>
							Xác nhận xóa phổ kháng sinh{" "}
							<strong className="text-red-600">{selected?.name}</strong>. Thao
							tác này không thể hoàn tác.
						</SheetDescription>
					</SheetHeader>

					<div className="mt-6 flex flex-col gap-4 px-1">
						<div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
							Bạn có chắc chắn muốn xóa{" "}
							<span className="font-bold">{selected?.name}</span> không?
						</div>
						<div className="flex gap-2 justify-end">
							<Button
								variant="outline"
								onClick={closeView}
								id="delete-spectrum-cancel"
							>
								Hủy
							</Button>
							<Button
								variant="destructive"
								onClick={closeView}
								id="delete-spectrum-confirm"
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
