export interface ErrorModalState {
	isOpen: boolean;
	title: string;
	message: string;
	details: string[];
}

interface DiagnoseErrorModalProps {
	state: ErrorModalState;
	onClose: () => void;
}

export function DiagnoseErrorModal({ state, onClose }: DiagnoseErrorModalProps) {
	if (!state.isOpen) return null;

	return (
		<div
			className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
			onMouseDown={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div
				className="bg-white rounded-2xl max-w-[440px] w-full p-6 shadow-2xl border-t-4 border-red-500 animate-in zoom-in-95 duration-150"
				style={{ zoom: 1.15 }}
			>
				<h3 className="flex items-center gap-2 text-red-600 font-extrabold text-base mb-2">
					<svg
						className="w-5 h-5 shrink-0"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<circle cx="12" cy="12" r="10" />
						<line x1="12" y1="8" x2="12" y2="12" />
						<line x1="12" y1="16" x2="12.01" y2="16" />
					</svg>
					{state.title}
				</h3>

				<p className="text-sm text-slate-800 break-words mb-4">{state.message}</p>

				{state.details.length > 0 && (
					<ul className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700 list-disc pl-7 space-y-1 max-h-40 overflow-y-auto">
						{state.details.map((msg, i) => (
							<li key={i}>{msg}</li>
						))}
					</ul>
				)}

				<div className="flex justify-end">
					<button
						type="button"
						onClick={onClose}
						className="px-6 py-2 rounded-lg bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-bold text-sm shadow-sm transition-colors cursor-pointer"
					>
						Đã hiểu
					</button>
				</div>
			</div>
		</div>
	);
}
