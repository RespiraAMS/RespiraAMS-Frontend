"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Popup kiểu thẻ trắng bo góc, nền mờ (blur).
 * Không có thanh cuộn riêng: nếu nội dung dài, cả màn hình (lớp overlay) sẽ cuộn bằng chuột.
 */
export function AdminDialogContent({
	className,
	children,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
	return (
		<DialogPrimitive.Portal>
			<DialogPrimitive.Overlay className="fixed inset-0 z-50 overflow-y-auto bg-black/35 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0">
				<div className="flex min-h-full items-start justify-center p-4 sm:p-8 py-8 sm:py-12">
					<DialogPrimitive.Content
						style={{ borderRadius: "18px" }}
						className={cn(
							"my-auto relative w-full rounded-[18px] bg-white p-6 sm:p-8 text-sm shadow-2xl outline-none border-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
							className
						)}
						{...props}
					>
						{children}
						<DialogPrimitive.Close
							className="absolute top-4 right-4 rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
							aria-label="Đóng"
						>
							<XIcon className="h-4 w-4" />
						</DialogPrimitive.Close>
					</DialogPrimitive.Content>
				</div>
			</DialogPrimitive.Overlay>
		</DialogPrimitive.Portal>
	);
}

