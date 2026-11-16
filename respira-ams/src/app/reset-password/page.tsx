import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export default function ResetPasswordPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen w-full items-center justify-center bg-background">
					<div className="h-8 w-8 animate-spin rounded-full border-2 border-border-default border-t-primary" />
				</div>
			}
		>
			<ResetPasswordForm />
		</Suspense>
	);
}
