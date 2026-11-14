export function LoginUserPanel() {
	return (
		<div
			className="relative hidden lg:flex w-1/2 shrink-0 flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground select-none"
			style={{
				backgroundColor: "var(--primary)",
				backgroundImage:
					"radial-gradient(ellipse 90% 80% at 20% 10%, color-mix(in srgb, var(--primary-foreground) 18%, transparent) 0%, transparent 60%)",
			}}
		>
			{/* Top Brand Logo */}
			<div className="relative z-10 flex items-center gap-3">
				<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-primary-foreground/15 text-primary-foreground font-bold text-lg shadow-lg shadow-primary/35">
					R.
				</div>
				<div className="flex flex-col">
					<div className="flex items-center text-xl font-bold tracking-tight">
						<span className="text-primary-foreground">Respira</span>
						<span className="text-primary-foreground/80 ml-1">AMS</span>
					</div>
					<span className="text-[10px] font-semibold text-primary-foreground/70 tracking-wider uppercase mt-0.5">
						CLINICAL WORKSPACE FOR RESPIRATORY CARE
					</span>
				</div>
			</div>

			{/* Description in center-top */}
			<div className="relative z-10 max-w-lg mt-8">
				<p className="text-sm text-primary-foreground/85 leading-relaxed font-normal">
					Hệ thống hỗ trợ ra quyết định lâm sàng trong quản lý sử dụng kháng sinh cho bệnh nhân viêm phổi mắc phải cộng đồng
				</p>
			</div>

			{/* Bottom spacer / aesthetic gradient */}
			<div className="relative z-10 mt-auto" />
		</div>
	);
}

export default LoginUserPanel;
