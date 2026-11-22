"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
	User,
	Lock,
	Eye,
	EyeOff,
	ArrowRight,
	Loader2,
	CheckCircle2,
	AlertCircle,
	Key,
	AtSign,
	HelpCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
	confirmEmailVerification,
	forgotPassword,
	getRememberedEmail,
	setRememberedEmail,
} from "../api";
import { login } from "@/lib/auth";
import { fetchCurrentDoctorProfile } from "@/features/profile/api";

type AuthMode = "login" | "forgot-email";

// Backend đã hỗ trợ đặt lại mật khẩu qua liên kết trong email.
const ENABLE_PASSWORD_RESET = true;

export function LoginForm() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const tLogin = useTranslations("auth.login");
	const tForgot = useTranslations("auth.forgot");

	// Ô khóa chống double-submit (bấm nhanh 2 lần trước khi state kịp cập nhật).
	const loginLock = useRef(false);
	const forgotLock = useRef(false);

	// Modes
	const [mode, setMode] = useState<AuthMode>("login");

	// Login states
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	// Forgot Password states
	const [forgotEmail, setForgotEmail] = useState("");
	const [isSendingVerify, setIsSendingVerify] = useState(false);

	// Query token verification
	const verifyToken = searchParams.get("token");
	const [isConfirmingToken, setIsConfirmingToken] = useState(false);

	// Load remembered email
	useEffect(() => {
		void Promise.resolve().then(() => {
			const remembered = getRememberedEmail();
			if (remembered) {
				setEmail(remembered);
				setRememberMe(true);
			}
		});
	}, []);

	// Auto check token from email link
	useEffect(() => {
		if (!verifyToken) return;

		let cancelled = false;

		const handleConfirm = async () => {
			setIsConfirmingToken(true);
			setError(null);
			try {
				await confirmEmailVerification(verifyToken);
				if (cancelled) return;
				setSuccessMessage(tLogin("tokenSuccess"));
				// Token is single-use; drop it from the URL so a reload does not retry.
				router.replace(pathname);
			} catch (err: unknown) {
				if (cancelled) return;
				setError(err instanceof Error ? err.message : tLogin("tokenError"));
			} finally {
				if (!cancelled) setIsConfirmingToken(false);
			}
		};

		void handleConfirm();

		return () => {
			cancelled = true;
		};
	}, [verifyToken, router, pathname, tLogin]);

	// Xử lý đăng nhập
	const handleLoginSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (loginLock.current) return;

		setError(null);
		setSuccessMessage(null);

		const trimmedEmail = email.trim();
		if (!trimmedEmail) {
			setError(tLogin("emailRequired"));
			return;
		}

		if (!password) {
			setError(tLogin("passwordRequired"));
			return;
		}

		loginLock.current = true;
		setIsLoading(true);

		try {
			const user = await login({
				email: trimmedEmail,
				password: password,
			});

			setRememberedEmail(trimmedEmail, rememberMe);

			const role = (user.role || "").toLowerCase();

			// Nếu đăng nhập vai trò Bác sĩ, tự động đồng bộ hồ sơ thực tế từ Backend
			if (role === "doctor" || role === "headdepartmentdoctor") {
				await fetchCurrentDoctorProfile().catch(() => { });
			}

			const redirectParam = searchParams.get("redirect");

			// Phân quyền điều hướng thông minh & an toàn
			let target = "/doctor/patients";
			if (role === "admin") {
				target = "/admin/dashboard";
				if (redirectParam && redirectParam.startsWith("/")) {
					target = redirectParam;
				}
			} else if (role === "manager" || role === "medicalregulationreviewer") {
				target = "/manage/dashboard";
				if (redirectParam && redirectParam.startsWith("/manage")) {
					target = redirectParam;
				}
			} else {
				// Doctor / HeadDepartmentDoctor
				target = "/doctor/patients";
				if (
					redirectParam &&
					(redirectParam.startsWith("/doctor") || redirectParam.startsWith("/profile"))
				) {
					target = redirectParam === "/profile" ? "/doctor/profile" : redirectParam;
				}
			}

			router.push(target);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : tLogin("loginError"));
		} finally {
			loginLock.current = false;
			setIsLoading(false);
		}
	};

	// Xử lý gửi liên kết đặt lại mật khẩu qua email
	const handleSendVerifySubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (forgotLock.current) return;

		setError(null);
		setSuccessMessage(null);

		const trimmedEmail = forgotEmail.trim();
		if (!trimmedEmail) {
			setError(tForgot("emailRequired"));
			return;
		}

		forgotLock.current = true;
		setIsSendingVerify(true);

		try {
			await forgotPassword(trimmedEmail);
			setMode("login");
			setSuccessMessage(tForgot("success"));
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : tForgot("errorFallback"));
		} finally {
			forgotLock.current = false;
			setIsSendingVerify(false);
		}
	};

	return (
		<div className="flex w-full lg:w-1/2 flex-col justify-between bg-surface px-8 py-10 min-h-screen select-none">
			{/* Mobile logo header */}
			<div className="mb-6 flex items-center gap-3 lg:hidden">
				<div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/30">
					R.
				</div>
				<span className="text-lg font-bold text-text-primary">
					Respira<span className="text-primary">AMS</span>
				</span>
			</div>

			{/* Center Form Container */}
			<div className="w-full max-w-md mx-auto my-auto py-4">
				{/* Token loading state */}
				{isConfirmingToken && (
					<div className="mb-5 flex items-center gap-2.5 rounded-[16px] border border-primary/30 bg-primary/10 px-4 py-3 text-xs text-primary">
						<Loader2 className="h-4 w-4 animate-spin text-primary" />
						<span>{tLogin("tokenChecking")}</span>
					</div>
				)}

				{/* Error Banner */}
				{error && (
					<div className="mb-5 flex items-start gap-2.5 rounded-[16px] border border-error/30 bg-error/10 px-4 py-3 text-xs text-error">
						<AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
						<p className="flex-1 font-medium">{error}</p>
					</div>
				)}

				{/* Success Banner */}
				{successMessage && (
					<div className="mb-5 flex items-start gap-2.5 rounded-[16px] border border-success/30 bg-success/10 px-4 py-3 text-xs text-success">
						<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
						<p className="flex-1 font-medium">{successMessage}</p>
					</div>
				)}

				{/* -------------------- MÀN HÌNH 1: ĐĂNG NHẬP -------------------- */}
				{mode === "login" && (
					<div className="space-y-6">
						{/* Title */}
						<div className="space-y-1">
							<h2 className="text-3xl font-bold tracking-tight text-text-primary">
								{tLogin("title")}
							</h2>
							<p className="text-xs text-text-secondary leading-relaxed">
								{tLogin("subtitle")}
							</p>
						</div>

						{/* Form */}
						<form onSubmit={handleLoginSubmit} className="space-y-4">
							{/* Email / Mã nhân viên */}
							<div className="space-y-1.5">
								<Label
									htmlFor="login-email"
									className="text-xs font-semibold text-text-primary"
								>
									{tLogin("emailLabel")}
								</Label>
								<div className="relative">
									<User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
									<Input
										id="login-email"
										type="text"
										placeholder={tLogin("emailPlaceholder")}
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										disabled={isLoading}
										required
										className="h-12 pl-11 pr-4 text-xs rounded-[16px] border-border-default bg-surface shadow-2xs focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
									/>
								</div>
							</div>

							{/* Mật khẩu */}
							<div className="space-y-1.5">
								<Label
									htmlFor="login-password"
									className="text-xs font-semibold text-text-primary"
								>
									{tLogin("passwordLabel")}
								</Label>
								<div className="relative">
									<Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
									<Input
										id="login-password"
										type={showPassword ? "text" : "password"}
										placeholder={tLogin("passwordPlaceholder")}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										disabled={isLoading}
										required
										className="h-12 pl-11 pr-11 text-xs rounded-[16px] border-border-default bg-surface shadow-2xs focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										tabIndex={-1}
										aria-label={showPassword ? tLogin("hidePassword") : tLogin("showPassword")}
										className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
							</div>

							{/* Ghi nhớ & Quên mật khẩu */}
							<div className="flex items-center justify-between pt-1">
								<div className="flex items-center gap-2">
									<Checkbox
										id="remember-session"
										checked={rememberMe}
										onCheckedChange={(checked) => setRememberMe(checked === true)}
										className="border-border-default data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-[5px] cursor-pointer"
									/>
									<Label
										htmlFor="remember-session"
										className="text-xs text-text-secondary cursor-pointer font-normal select-none"
									>
										{tLogin("remember")}
									</Label>
								</div>
								{ENABLE_PASSWORD_RESET && (
									<button
										type="button"
										onClick={() => {
											setMode("forgot-email");
											setForgotEmail(email);
											setError(null);
											setSuccessMessage(null);
										}}
										className="text-xs font-medium text-primary hover:underline cursor-pointer"
									>
										{tLogin("forgot")}
									</button>
								)}
							</div>

							{/* Nút Đăng nhập */}
							<Button
								type="submit"
								disabled={isLoading}
								className="w-full h-12 rounded-[16px] bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-lg shadow-primary/30 transition-all cursor-pointer flex items-center justify-center gap-2"
							>
								{isLoading ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<>
										<span>{tLogin("submit")}</span>
										<ArrowRight className="h-4 w-4" />
									</>
								)}
							</Button>
						</form>
					</div>
				)}

				{/* -------------------- MÀN HÌNH 2: QUÊN MẬT KHẨU -------------------- */}
				{mode === "forgot-email" && (
					<div className="space-y-6">
						{/* Icon Key Header */}
						<div>
							<div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-primary/10 text-primary mb-4">
								<Key className="h-5 w-5" />
							</div>
							<h2 className="text-2xl font-bold tracking-tight text-text-primary">
								{tForgot("title")}
							</h2>
							<p className="text-xs text-text-secondary mt-2 leading-relaxed">
								{tForgot("subtitle")}
							</p>
						</div>

						{/* Form */}
						<form onSubmit={handleSendVerifySubmit} className="space-y-4">
							<div className="space-y-1.5">
								<Label
									htmlFor="forgot-email"
									className="text-xs font-semibold text-text-primary"
								>
									{tForgot("emailLabel")} <span className="text-error">*</span>
								</Label>
								<div className="relative">
									<AtSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
									<Input
										id="forgot-email"
										type="email"
										placeholder={tForgot("emailPlaceholder")}
										value={forgotEmail}
										onChange={(e) => setForgotEmail(e.target.value)}
										disabled={isSendingVerify}
										required
										className="h-12 pl-11 pr-4 text-xs rounded-[16px] border-border-default bg-surface shadow-2xs focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
									/>
								</div>
							</div>

							{/* Nút gửi liên kết đặt lại */}
							<Button
								type="submit"
								disabled={isSendingVerify}
								className="w-full h-12 rounded-[16px] bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-lg shadow-primary/30 transition-all cursor-pointer flex items-center justify-center gap-2"
							>
								{isSendingVerify ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<>
										<span>{tForgot("submit")}</span>
										<ArrowRight className="h-4 w-4" />
									</>
								)}
							</Button>

							{/* Nút quay lại */}
							<button
								type="button"
								onClick={() => {
									setMode("login");
									setError(null);
									setSuccessMessage(null);
								}}
								className="w-full h-12 rounded-[16px] bg-surface-secondary hover:bg-surface-tertiary text-text-primary text-xs font-semibold transition-colors flex items-center justify-center cursor-pointer"
							>
								{tForgot("back")}
							</button>

							{/* Box Không nhận được email */}
							<div className="rounded-[20px] bg-background border border-border-subtle p-4.5 flex items-start gap-3.5 mt-5">
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-warning/10 text-warning">
									<HelpCircle className="h-4 w-4" />
								</div>
								<div className="space-y-0.5">
									<h4 className="text-xs font-bold text-text-primary">
										{tForgot("notReceivedTitle")}
									</h4>
									<p className="text-[11px] text-text-secondary leading-relaxed">
										{tForgot("notReceivedHint")}
									</p>
								</div>
							</div>
						</form>
					</div>
				)}

			</div>

			{/* Footer Copyright */}
			<div className="w-full text-center space-y-1 pt-6 text-[10.5px] text-text-tertiary">
				<p className="text-[10px] text-text-tertiary/80">
					&copy; 2026 RespiraAMS
				</p>
			</div>
		</div>
	);
}

export default LoginForm;
