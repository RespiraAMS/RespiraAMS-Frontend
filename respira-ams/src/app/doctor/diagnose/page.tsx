export const metadata = {
	title: "Chẩn đoán lâm sàng | RespiraAMS",
	description: "Đánh giá ban đầu và hỗ trợ ra quyết định kháng sinh cho bác sĩ.",
};

export default function DiagnosePage() {
	return (
		<div className="container mx-auto px-6 py-8">
			<header className="mb-8">
				<p className="text-primary text-sm font-semibold uppercase tracking-widest">
					Đánh giá ban đầu
				</p>
				<h1 className="text-3xl font-bold mt-2 text-foreground">
					Mẫu Thông tin Bệnh nhân & Chẩn đoán
				</h1>
				<p className="text-muted-foreground mt-2">
					Hệ thống hỗ trợ bác sĩ đánh giá lâm sàng và chỉ định kháng sinh hợp lý.
				</p>
			</header>
			<div className="rounded-xl border bg-card p-8 text-center text-muted-foreground shadow-sm">
				<p className="text-base">Giao diện Chẩn đoán sẽ được cập nhật tiếp theo.</p>
			</div>
		</div>
	);
}
