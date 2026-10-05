export const metadata = {
	title: "Lịch sử điều trị | RespiraAMS",
	description: "Xem lại lịch sử các ca bệnh và quyết định sử dụng kháng sinh của bác sĩ.",
};

export default function HistoryPage() {
	return (
		<div className="container mx-auto px-6 py-8">
			<header className="mb-8">
				<h1 className="text-3xl font-bold text-foreground">
					Lịch sử điều trị
				</h1>
				<p className="text-muted-foreground mt-2">
					Theo dõi danh sách các quyết định điều trị và hồ sơ bệnh nhân đã thực hiện.
				</p>
			</header>
			<div className="rounded-xl border bg-card p-8 text-center text-muted-foreground shadow-sm">
				<p className="text-base">Giao diện Lịch sử điều trị sẽ được cập nhật tiếp theo.</p>
			</div>
		</div>
	);
}
