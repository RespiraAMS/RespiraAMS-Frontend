export function LoginUserPanel() {
	return (
		<div
			className="relative hidden lg:flex w-1/2 shrink-0 flex-col justify-between overflow-hidden p-12 select-none"
			style={{
				background:
					"radial-gradient(ellipse 90% 80% at 20% 10%, rgba(14, 165, 233, 0.18) 0%, transparent 60%), linear-gradient(175deg, #051a30 0%, #031122 55%, #020b18 100%)",
			}}
		>
			{/* Top Brand Logo */}
			<div className="relative z-10 flex items-center gap-3">
				<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#0EA5E9] text-white font-bold text-lg shadow-[0_4px_14px_rgba(14,165,233,0.35)]">
					R.
				</div>
				<div className="flex flex-col">
					<div className="flex items-center text-xl font-bold tracking-tight">
						<span className="text-white">Respira</span>
						<span className="text-[#0EA5E9] ml-1">AMS</span>
					</div>
					<span className="text-[10px] font-semibold text-slate-300 tracking-wider uppercase mt-0.5">
						CLINICAL WORKSPACE FOR RESPIRATORY CARE
					</span>
				</div>
			</div>

			{/* Description in center-top */}
			<div className="relative z-10 max-w-lg mt-8">
				<p className="text-sm text-slate-300/90 leading-relaxed font-normal">
					Hệ thống hỗ trợ ra quyết định lâm sàng trong quản lý sử dụng kháng sinh cho bệnh nhân viêm phổi mắc phải cộng đồng
				</p>
			</div>

			{/* Bottom spacer / aesthetic gradient */}
			<div className="relative z-10 mt-auto" />
		</div>
	);
}

export default LoginUserPanel;
