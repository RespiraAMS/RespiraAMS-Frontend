import { cn } from "@/lib/utils";

interface DiagnoseStepperProps {
	currentStep: 1 | 2;
	onStepChange: (step: 1 | 2) => void;
}

const STEPS: { step: 1 | 2; label: string }[] = [
	{ step: 1, label: "Clinical Observations" },
	{ step: 2, label: "Antibiotic Allergies" },
];

export function DiagnoseStepper({ currentStep, onStepChange }: DiagnoseStepperProps) {
	return (
		<div className="flex gap-2.5 mb-5 flex-col sm:flex-row">
			{STEPS.map(({ step, label }) => {
				const active = currentStep === step;
				return (
					<button
						key={step}
						type="button"
						onClick={() => onStepChange(step)}
						className={cn(
							"flex-1 flex items-center gap-2.5 px-4 py-3 rounded-xl border font-bold text-sm text-left transition-all cursor-pointer",
							active
								? "border-[#0EA5E9] bg-[#F0F9FF] text-[#0284C7] shadow-xs"
								: "border-slate-200 bg-white text-slate-500 hover:border-[#0EA5E9]/50"
						)}
					>
						<span
							className={cn(
								"h-5 w-5 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0",
								active ? "bg-[#0EA5E9] text-white" : "bg-slate-200 text-slate-500"
							)}
						>
							{step}
						</span>
						<span>{label}</span>
					</button>
				);
			})}
		</div>
	);
}

