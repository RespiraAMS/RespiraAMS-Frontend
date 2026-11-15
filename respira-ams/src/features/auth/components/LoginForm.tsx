"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	User,
	Lock,
	Eye,
	EyeOff,
	ArrowRight,
	Loader2,
	CheckCircle2,
	AlertCircle,
	CreditCard,
	ShieldCheck,
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
	const searchParams = useSearchParams();

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
		const remembered = getRememberedEmail();
		if (remembered) {
			setEmail(remembered);
			setRememberMe(true);
		}
	}, []);

	// Auto check token from email link
	useEffect(() => {
		if (verifyToken) {
			const handleConfirm = async () => {
				setIsConfirmingToken(true);
				setError(null);
				try {
					await confirmEmailVerification(verifyToken);
					setSuccessMessage("Xác thực tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.");
				} catch (err: unknown) {
					setError(
						err instanceof Error
							? err.message
							: "Liên kết xác thực không hợp lệ hoặc đã hết hạn."
					);
				} finally {
					setIsConfirmingToken(false);
				}
			};
			handleConfirm();
		}
	}, [verifyToken]);

	// Xử lý đăng nhập
	const handleLoginSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSuccessMessage(null);

		const trimmedEmail = email.trim();
		if (!trimmedEmail) {
			setError("Vui lòng nhập email hoặc mã nhân viên y tế.");
			return;
		}

		if (!password) {
			setError("Vui lòng nhập mật khẩu.");
			return;
		}

		setIsLoading(true);

		try {
			const user = await login({
				email: trimmedEmail,
				password: password,
			});

			setRememberedEmail(trimmedEmail, rememberMe);

			const role = (user.role || "").toLowerCase();

			// Xóa cache cũ để tránh hiển thị nhầm thông tin của tài khoản trước đó
			if (typeof window !== "undefined") {
				localStorage.removeItem("respira_doctor_profile_v1");
			}

			// Nếu đăng nhập vai trò Bác sĩ, tự động đồng bộ hồ sơ thực tế từ Backend
			if (role === "doctor" || role === "headdepartmentdoctor") {
				await fetchCurrentDoctorProfile().catch(() => {});
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
			setError(
				err instanceof Error
					? err.message
					: "Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin."
			);
		} finally {
			setIsLoading(false);
		}
	};

	// Xử lý gửi liên kết đặt lại mật khẩu qua email
	const handleSendVerifySubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSuccessMessage(null);

		const trimmedEmail = forgotEmail.trim();
		if (!trimmedEmail) {
			setError("Vui lòng nhập email công việc hoặc mã nhân viên.");
			return;
		}

		setIsSendingVerify(true);

		try {
			await forgotPassword(trimmedEmail);
			setMode("login");
			setSuccessMessage(
				"Đã gửi liên kết đặt lại mật khẩu. Vui lòng kiểm tra hộp thư email của bạn."
			);
		} catch (err: unknown) {
			setError(
				err instanceof Error
					? err.message
					: "Không thể gửi liên kết đặt lại mật khẩu. Vui lòng thử lại sau."
			);
		} finally {
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
						<span>Đang xác nhận liên kết kích hoạt tài khoản...</span>
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

				{/* -------------------- MÀN HÌNH 1: ĐĂNG NHẬP (ẢNH 1) -------------------- */}
				{mode === "login" && (
					<div className="space-y-6">
						{/* Title */}
						<div className="space-y-1">
							<h2 className="text-3xl font-bold tracking-tight text-text-primary">
								Đăng nhập
							</h2>
							<p className="text-xs text-text-secondary leading-relaxed">
								Tiếp tục vào không gian làm việc y tế lâm sàng RespiraAMS.
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
									Email hoặc mã nhân viên y tế
								</Label>
								<div className="relative">
									<User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
									<Input
										id="login-email"
										type="text"
										placeholder="bs.minh@respira.vn"
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
									Mật khẩu
								</Label>
								<div className="relative">
									<Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
									<Input
										id="login-password"
										type={showPassword ? "text" : "password"}
										placeholder="SecuredPass123!#"
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
										Ghi nhớ phiên làm việc trên máy này
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
										Quên mật khẩu?
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
										<span>Đăng nhập</span>
										<ArrowRight className="h-4 w-4" />
									</>
								)}
							</Button>

							{/* Phân cách: hoặc */}
							<div className="relative my-4 flex items-center justify-center">
								<div className="w-full border-t border-border-subtle" />
								<span className="absolute bg-surface px-3 text-[11px] text-text-tertiary">
									hoặc
								</span>
							</div>

							{/* Nút dùng mã nhân viên / thẻ bệnh viện */}
							<button
								type="button"
								className="w-full h-12 rounded-[16px] border border-primary text-primary hover:bg-primary/10 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
							>
								<CreditCard className="h-4 w-4 text-primary" />
								<span>Dùng mã nhân viên / Thẻ bệnh viện</span>
							</button>

							{/* Box Phiên đăng nhập an toàn */}
							<div className="rounded-[20px] bg-background border border-border-subtle p-4.5 flex items-start gap-3.5 mt-5">
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
									<ShieldCheck className="h-4 w-4" />
								</div>
								<div className="space-y-0.5">
									<h4 className="text-xs font-bold text-text-primary">
										Phiên đăng nhập an toàn
									</h4>
									<p className="text-[11px] text-text-secondary leading-relaxed">
										Tự động khóa sau 15 phút không thao tác nhằm bảo vệ bí mật y khoa và quyền hạn chỉ định dược lâm sàng.
									</p>
								</div>
							</div>

							{/* Tài khoản mẫu thử nghiệm phân quyền */}
							<div className="rounded-[16px] border border-border-default/80 bg-surface-secondary/70 p-3.5 space-y-2 mt-3">
								<div className="flex items-center justify-between">
									<p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
										Tài khoản mẫu thử nghiệm
									</p>
									<span className="text-[10px] text-text-tertiary">Click để điền nhanh</span>
								</div>
								<div className="grid grid-cols-3 gap-2">
									<button
										type="button"
										onClick={() => {
											setEmail("doctor@respira.ams");
											setPassword("Admin@123");
											setError(null);
										}}
										className="rounded-[10px] border border-primary/30 bg-surface p-2 text-left hover:border-primary hover:bg-primary/10 transition-all cursor-pointer shadow-2xs"
									>
										<p className="text-[11px] font-bold text-primary">Bác sĩ</p>
										<p className="text-[9.5px] text-text-secondary truncate">doctor@respira.ams</p>
									</button>

									<button
										type="button"
										onClick={() => {
											setEmail("admin@respira.ams");
											setPassword("Admin@123");
											setError(null);
										}}
										className="rounded-[10px] border border-warning/30 bg-surface p-2 text-left hover:border-warning hover:bg-warning/10 transition-all cursor-pointer shadow-2xs"
									>
										<p className="text-[11px] font-bold text-warning">Admin</p>
										<p className="text-[9.5px] text-text-secondary truncate">admin@respira.ams</p>
									</button>

									<button
										type="button"
										onClick={() => {
											setEmail("manager@respira.ams");
											setPassword("Admin@123");
											setError(null);
										}}
										className="rounded-[10px] border border-success/30 bg-surface p-2 text-left hover:border-success hover:bg-success/10 transition-all cursor-pointer shadow-2xs"
									>
										<p className="text-[11px] font-bold text-success">Quản lý</p>
										<p className="text-[9.5px] text-text-secondary truncate">manager@respira.ams</p>
									</button>
								</div>
							</div>
						</form>
					</div>
				)}

				{/* -------------------- MÀN HÌNH 2: QUÊN MẬT KHẨU (ẢNH 2) -------------------- */}
				{mode === "forgot-email" && (
					<div className="space-y-6">
						{/* Icon Key Header */}
						<div>
							<div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-primary/10 text-primary mb-4">
								<Key className="h-5 w-5" />
							</div>
							<h2 className="text-2xl font-bold tracking-tight text-text-primary">
								Quên mật khẩu?
							</h2>
							<p className="text-xs text-text-secondary mt-2 leading-relaxed">
								Nhập email công việc đã đăng ký. Hệ thống sẽ gửi một liên kết để bạn tạo mật khẩu mới cho tài khoản.
							</p>
						</div>

						{/* Form */}
						<form onSubmit={handleSendVerifySubmit} className="space-y-4">
							<div className="space-y-1.5">
								<Label
									htmlFor="forgot-email"
									className="text-xs font-semibold text-text-primary"
								>
									Email công việc <span className="text-error">*</span>
								</Label>
								<div className="relative">
									<AtSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
									<Input
										id="forgot-email"
										type="email"
										placeholder="bs.minh@respira.vn"
										value={forgotEmail}
										onChange={(e) => setForgotEmail(e.target.value)}
										disabled={isSendingVerify}
										required
										className="h-12 pl-11 pr-4 text-xs rounded-[16px] border-border-default bg-surface shadow-2xs focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
									/>
								</div>
								<p className="text-[11px] text-text-tertiary">
									Được cấp bởi Ban Công nghệ Thông tin Bệnh viện tiếp nhận dịch vụ.
								</p>
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
										<span>Gửi liên kết đặt lại</span>
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
								Quay lại đăng nhập
							</button>

							{/* Box Không nhận được email */}
							<div className="rounded-[20px] bg-background border border-border-subtle p-4.5 flex items-start gap-3.5 mt-5">
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-warning/10 text-warning">
									<HelpCircle className="h-4 w-4" />
								</div>
								<div className="space-y-0.5">
									<h4 className="text-xs font-bold text-text-primary">
										Không nhận được email?
									</h4>
									<p className="text-[11px] text-text-secondary leading-relaxed">
										Kiểm tra thư rác (Spam) hoặc liên hệ trực tiếp <span className="font-semibold text-text-primary">Quản trị viên CNTT Bệnh viện</span> để được hỗ trợ xác minh danh tính và cấp lại tài khoản nhân viên y tế khẩn cấp.
									</p>
								</div>
							</div>
						</form>
					</div>
				)}

			</div>

			{/* Footer Copyright */}
			<div className="w-full text-center space-y-1 pt-6 text-[10.5px] text-text-tertiary">
				<p>
					Cần hỗ trợ? Liên hệ Quản trị viên CNTT Bệnh viện qua tổng đài nội bộ hoặc Hotline:{" "}
					<span className="font-semibold text-text-secondary">1900 6868</span>
				</p>
				<p className="text-[10px] text-text-tertiary/80">
					&copy; 2025 RespiraAMS Healthcare Technology. Bản quyền thuộc về Bộ Y tế &amp; Viện Vi sinh.
				</p>
			</div>
		</div>
	);
}

export default LoginForm;
