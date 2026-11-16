import { Metadata } from "next";
import { AdminAuditLogsView } from "@/features/admin/audit-logs/components/AdminAuditLogsView";

export const metadata: Metadata = {
	title: "Nhật ký kiểm toán & Bảo mật | RespiraAMS Admin",
	description:
		"Theo dõi toàn diện các giao dịch phân tán, hoạt động đăng nhập, chỉnh sửa phác đồ và truy cập dữ liệu y tế trên hệ thống RespiraAMS.",
};

export default function AdminAuditLogsPage() {
	return <AdminAuditLogsView />;
}
