export const metadata = {
	title: "Tra cứu thông tin | RespiraAMS",
	description: "Tra cứu phổ kháng sinh, phác đồ điều trị và tác nhân gây bệnh.",
};

export default function InfoPage() {
	return (
		<div className="container mx-auto px-6 py-8">
			<header className="mb-8">
				<h1 className="text-3xl font-bold text-foreground">
					Tra cứu thông tin
				</h1>
				<p className="text-muted-foreground mt-2">
					Tra cứu chi tiết về Kháng sinh, Tác nhân gây bệnh, Bệnh truyền nhiễm và Phác đồ điều trị.
				</p>
			</header>
			<div className="rounded-xl border bg-card p-8 text-center text-muted-foreground shadow-sm">
				<p className="text-base">Giao diện Tra cứu sẽ được cập nhật tiếp theo.</p>
			</div>
		</div>
	);
}
