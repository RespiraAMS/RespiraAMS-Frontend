import { LoginUserPanel } from "@/features/auth/components/LoginUserPanel";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
	return (
		<div className="flex min-h-screen w-full font-sans">
			<LoginUserPanel />
			<LoginForm />
		</div>
	);
}
