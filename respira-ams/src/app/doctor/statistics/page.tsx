export const metadata = {
	title: "Thống kê lâm sàng | RespiraAMS",
	description: "Thống kê tỷ lệ kê đơn kháng sinh, ca bệnh và xu hướng sử dụng thuốc.",
};

export default function StatisticsPage() {
	return (
		<div className="container mx-auto px-6 py-8">
			<header className="mb-8">
				<h1 className="text-3xl font-bold text-foreground">
					Thống kê lâm sàng
				</h1>
				<p className="text-muted-foreground mt-2">
					Báo cáo và phân tích chỉ số sử dụng kháng sinh của bác sĩ và khoa phòng.
				</p>
			</header>
			<div className="rounded-xl border bg-card p-8 text-center text-muted-foreground shadow-sm">
				<p className="text-base">Giao diện Thống kê sẽ được cập nhật tiếp theo.</p>
			</div>
		</div>
	);
}
