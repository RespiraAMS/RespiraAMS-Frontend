import Image from "next/image";
import { Shield } from "lucide-react";

export function LoginUserPanel() {
	return (
		<div
			className="relative flex w-1/2 shrink-0 flex-col justify-between overflow-hidden bg-[#0a1628] p-10"
			style={{
				backgroundImage: "url('/Hospital Interior.png')",
				backgroundSize: "cover",
				backgroundPosition: "center",
			}}
		>
			{/* Gradient overlays */}
			<div
				className="absolute inset-0"
				style={{
					background:
						"linear-gradient(to bottom right, rgba(8,47,73,0.6), rgba(10,22,40,0.7), rgba(23,37,84,0.6))",
				}}
			/>
			<div
				className="absolute inset-0"
				style={{
					background:
						"radial-gradient(ellipse at top left, rgba(56,189,248,0.08), transparent 60%)",
				}}
			/>
			<div
				className="absolute bottom-0 left-0 right-0 h-1/2"
				style={{
					background:
						"linear-gradient(to top, #0a1628, rgba(10,22,40,0.8), transparent)",
				}}
			/>

			{/* Grid texture (decorative, hidden) */}
			<div
				className="absolute inset-0 hidden"
				style={{
					opacity: 0.03,
					backgroundImage:
						"linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
					backgroundSize: "48px 48px",
				}}
			/>

			{/* Ambient blobs (decorative, hidden) */}
			<div
				className="absolute left-12 top-32 h-64 w-64 animate-pulse rounded-full blur-3xl hidden"
				style={{ backgroundColor: "rgba(6,182,212,0.05)" }}
			/>
			<div
				className="absolute bottom-32 right-8 h-48 w-48 animate-pulse rounded-full blur-3xl hidden"
				style={{
					backgroundColor: "rgba(59,130,246,0.05)",
					animationDelay: "1s",
				}}
			/>

			{/* Logo */}
			<div className="relative z-10">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#39B8FD]">
						<Image
							src="/Background.png"
							alt="RespiraAMS Logo"
							width={60}
							height={60}
							className="h-full w-full object-cover rounded"
						/>
					</div>
					<span className="text-xl font-semibold tracking-tight text-white">
						Clinic Precision
					</span>
				</div>
			</div>

			{/* Security badges */}
			<div className="relative z-10">
				<div className="flex items-center gap-5 pt-2">
					<div className="flex items-center gap-2 text-xs text-slate-500">
						<Shield className="h-3.5 w-3.5 text-cyan-500/70" />
						<span>256-bit Encrypted</span>
					</div>
					<div className="flex items-center gap-2 text-xs text-slate-500">
						<div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
						<span>System Online</span>
					</div>
				</div>
			</div>

			{/* Tagline */}
			<div className="relative z-10 max-w-[65%] space-y-4">
				<h1 className="text-4xl font-semibold leading-tight tracking-tight text-white">
					Advancing Care through
					<br />
					Clinical Excellence.
				</h1>
				<p className="text-sm leading-relaxed text-slate-300">
					Secure access for authorized healthcare administrators and
					medical personnel only. Experience the next generation of
					hospital management systems.
				</p>
				<p className="text-xs text-slate-600">
					&copy; {new Date().getFullYear()} RespiraAMS Platform. All
					rights reserved.
				</p>
			</div>
		</div>
	);
}
