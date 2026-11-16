"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
	AlertCircle,
	ArrowRight,
	CheckCircle2,
	Eye,
	EyeOff,
	Key,
	Loader2,
	Lock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "../api";

export function ResetPasswordForm() {
	const t = useTranslations("auth.reset");
	const searchParams = useSearchParams();
	const token = searchParams.get("token") || "";
	const submitLock = useRef(false);

	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (submitLock.current) return;

		setError(null);

		if (!token) {
			setError(t("missingToken"));
			return;
		}

		if (newPassword.length < 6) {
			setError(t("passwordTooShort"));
			return;
		}

		if (newPassword !== confirmPassword) {
			setError(t("passwordMismatch"));
			return;
		}

		submitLock.current = true;
		setIsSubmitting(true);

		try {
			await resetPassword({ token, newPassword, confirmPassword });
			setIsSuccess(true);
			setNewPassword("");
			setConfirmPassword("");
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : t("errorFallback"));
		} finally {
			submitLock.current = false;
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-10 font-sans">
			<div className="w-full max-w-md space-y-6 rounded-[24px] border border-border-default bg-surface p-8 shadow-lg shadow-primary/5">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/30">
						R.
					</div>
					<span className="text-lg font-bold text-text-primary">
						Respira<span className="text-primary">AMS</span>
					</span>
				</div>

				<div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-primary/10 text-primary">
					<Key className="h-5 w-5" />
				</div>

				<div className="space-y-1.5">
					<h1 className="text-2xl font-bold tracking-tight text-text-primary">
						{t("title")}
					</h1>
					<p className="text-xs leading-relaxed text-text-secondary">
						{t("subtitle")}
					</p>
				</div>

				{error && (
					<div className="flex items-start gap-2.5 rounded-[16px] border border-error/30 bg-error/10 px-4 py-3 text-xs text-error">
						<AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
						<p className="flex-1 font-medium">{error}</p>
					</div>
				)}

				{isSuccess && (
					<div className="flex items-start gap-2.5 rounded-[16px] border border-success/30 bg-success/10 px-4 py-3 text-xs text-success">
						<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
						<p className="flex-1 font-medium">{t("success")}</p>
					</div>
				)}

				{!isSuccess && !token && (
					<div className="flex items-start gap-2.5 rounded-[16px] border border-warning/30 bg-warning/10 px-4 py-3 text-xs text-warning">
						<AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
						<p className="flex-1 font-medium">{t("invalidLink")}</p>
					</div>
				)}

				{!isSuccess && (
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="new-password" className="text-xs font-semibold text-text-primary">
								{t("newPasswordLabel")}
							</Label>
							<div className="relative">
								<Key className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
								<Input
									id="new-password"
									type={showNewPassword ? "text" : "password"}
									placeholder={t("passwordPlaceholder")}
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									disabled={isSubmitting || !token}
									required
									className="h-12 rounded-[16px] border-border-default bg-surface pl-11 pr-11 text-xs shadow-2xs transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
								/>
								<button
									type="button"
									onClick={() => setShowNewPassword(!showNewPassword)}
									tabIndex={-1}
									aria-label={showNewPassword ? t("hidePassword") : t("showPassword")}
									className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-text-tertiary transition-colors hover:text-text-secondary"
								>
									{showNewPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>

						<div className="space-y-1.5">
							<Label
								htmlFor="confirm-password"
								className="text-xs font-semibold text-text-primary"
							>
								{t("confirmPasswordLabel")}
							</Label>
							<div className="relative">
								<Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
								<Input
									id="confirm-password"
									type={showConfirmPassword ? "text" : "password"}
									placeholder={t("passwordPlaceholder")}
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									disabled={isSubmitting || !token}
									required
									className="h-12 rounded-[16px] border-border-default bg-surface pl-11 pr-11 text-xs shadow-2xs transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									tabIndex={-1}
									aria-label={showConfirmPassword ? t("hidePassword") : t("showPassword")}
									className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-text-tertiary transition-colors hover:text-text-secondary"
								>
									{showConfirmPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>

						<Button
							type="submit"
							disabled={isSubmitting || !token}
							className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[16px] bg-primary text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90"
						>
							{isSubmitting ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<>
									<span>{t("submit")}</span>
									<ArrowRight className="h-4 w-4" />
								</>
							)}
						</Button>
					</form>
				)}

				<Button
					asChild
					variant="outline"
					className="h-12 w-full cursor-pointer rounded-[16px] border-border-default text-xs font-semibold text-text-primary hover:bg-surface-secondary"
				>
					<Link href="/login">{t("backToLogin")}</Link>
				</Button>
			</div>
		</div>
	);
}

export default ResetPasswordForm;
