"use client";

import { Button } from "@/components/ui/button";

interface DeletePanelProps {
	doctorName: string;
	onConfirm: () => void;
	onCancel: () => void;
	isPending?: boolean;
}

export function DeletePanel({
	doctorName,
	onConfirm,
	onCancel,
	isPending = false,
}: DeletePanelProps) {
	return (
		<div className="flex flex-col gap-4 px-1">
			<div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
				Bạn có chắc chắn muốn xóa hồ sơ bác sĩ{" "}
				<span className="font-bold">{doctorName}</span>? Thao tác này sẽ thu hồi
				quyền truy cập của họ vào hệ thống.
			</div>

			<div className="flex gap-2 justify-end">
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					disabled={isPending}
					id="delete-panel-cancel"
				>
					Hủy
				</Button>
				<Button
					type="button"
					variant="destructive"
					onClick={onConfirm}
					disabled={isPending}
					id="delete-panel-confirm"
				>
					{isPending ? "Đang xóa..." : "Xác nhận Xóa"}
				</Button>
			</div>
		</div>
	);
}
