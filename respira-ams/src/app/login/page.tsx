import { Suspense } from "react";
import { LoginUserPanel } from "@/features/auth/components/LoginUserPanel";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
	return (
		<div className="flex min-h-screen w-full font-sans">
			<LoginUserPanel />
			<Suspense fallback={<div className="flex w-1/2 items-center justify-center bg-surface" />}>
				<LoginForm />
			</Suspense>
		</div>
	);
}
