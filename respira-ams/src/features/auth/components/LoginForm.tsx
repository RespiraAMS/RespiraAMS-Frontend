"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
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
	Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
	sendEmailVerification,
	confirmEmailVerification,
	getRememberedEmail,
	setRememberedEmail,
} from "../api";
import { login } from "@/lib/auth";
import { fetchCurrentDoctorProfile } from "@/features/profile/api";

type AuthMode = "login" | "forgot-email" | "forgot-otp" | "forgot-reset";

// Tạm ẩn luồng quên mật khẩu cho tới khi backend hỗ trợ đặt lại mật khẩu.
const ENABLE_PASSWORD_RESET = false;

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

	// OTP states
	const [otp, setOtp] = useState(["", "", "", "", "", ""]);
	const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
	const [countdown, setCountdown] = useState(60);
	const [canResend, setCanResend] = useState(false);

	// Reset Password states
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

	// Countdown timer for OTP
	useEffect(() => {
		let timer: NodeJS.Timeout;
		if (mode === "forgot-otp" && countdown > 0) {
			timer = setInterval(() => {
				setCountdown((prev) => prev - 1);
			}, 1000);
		} else if (countdown === 0) {
			setCanResend(true);
		}
		return () => clearInterval(timer);
	}, [mode, countdown]);

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

	// Format countdown string mm:ss
	const formatCountdown = (seconds: number) => {
		const m = Math.floor(seconds / 60).toString().padStart(2, "0");
		const s = (seconds % 60).toString().padStart(2, "0");
		return `${m}:${s}`;
	};

	// Mask email: bs.minh@respira.vn -> bs.m***@respira.vn
	const maskEmail = (str: string) => {
		if (!str) return "bs.m***@respira.vn";
		const parts = str.split("@");
		if (parts.length < 2) return str;
		const name = parts[0];
		const domain = parts[1];
		if (name.length <= 4) return `${name.charAt(0)}***@${domain}`;
		return `${name.slice(0, 4)}***@${domain}`;
	};

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

	// Xử lý gửi email xác thực (Forgot Password - Step 1)
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
			await sendEmailVerification(trimmedEmail);
			setMode("forgot-otp");
			setCountdown(60);
			setCanResend(false);
		} catch (err: unknown) {
			setError(
				err instanceof Error
					? err.message
					: "Không thể gửi mã xác thực. Vui lòng thử lại sau."
			);
		} finally {
			setIsSendingVerify(false);
		}
	};

	// Xử lý nhập OTP
	const handleOtpChange = (index: number, value: string) => {
		if (value.length > 1) {
			value = value.slice(-1);
		}
		const newOtp = [...otp];
		newOtp[index] = value;
		setOtp(newOtp);

		// Tự động nhảy ô tiếp theo
		if (value && index < 5) {
			otpRefs.current[index + 1]?.focus();
		}
	};

	const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Backspace" && !otp[index] && index > 0) {
			otpRefs.current[index - 1]?.focus();
		}
	};

	const handleResendOtp = async () => {
		if (!canResend || isSendingVerify) return;
		setIsSendingVerify(true);
		setError(null);
		try {
			await sendEmailVerification(forgotEmail);
			setCountdown(60);
			setCanResend(false);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Không thể gửi lại mã.");
		} finally {
			setIsSendingVerify(false);
		}
	};

	const handleOtpSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const code = otp.join("");
		if (code.length < 6) {
			setError("Vui lòng nhập đủ 6 chữ số mã xác thực.");
			return;
		}
		setError(null);
		setMode("forgot-reset");
	};

	// Xử lý tạo mật khẩu mới
	const handleResetPasswordSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!newPassword || newPassword.length < 6) {
			setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
			return;
		}

		if (newPassword !== confirmPassword) {
			setError("Mật khẩu xác nhận không khớp.");
			return;
		}

		setSuccessMessage("Mật khẩu đã được cập nhật thành công! Vui lòng đăng nhập lại.");
		setMode("login");
		setPassword("");
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
								Nhập email công việc hoặc mã nhân viên y tế đã đăng ký. Hệ thống sẽ gửi mã xác thực gồm 6 chữ số để khôi phục quyền truy cập tài khoản.
							</p>
						</div>

						{/* Form */}
						<form onSubmit={handleSendVerifySubmit} className="space-y-4">
							<div className="space-y-1.5">
								<Label
									htmlFor="forgot-email"
									className="text-xs font-semibold text-text-primary"
								>
									Email công việc hoặc Mã nhân viên <span className="text-error">*</span>
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

							{/* Nút gửi mã */}
							<Button
								type="submit"
								disabled={isSendingVerify}
								className="w-full h-12 rounded-[16px] bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-lg shadow-primary/30 transition-all cursor-pointer flex items-center justify-center gap-2"
							>
								{isSendingVerify ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<>
										<span>Gửi mã xác thực</span>
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

				{/* -------------------- MÀN HÌNH 3: NHẬP MÃ XÁC THỰC OTP (ẢNH 3) -------------------- */}
				{mode === "forgot-otp" && (
					<div className="space-y-6">
						{/* Step Badge */}
						<div className="flex justify-center">
							<span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-[11px] font-semibold text-primary">
								<span className="h-1.5 w-1.5 rounded-full bg-primary" />
								Bước 1/2 · Xác minh danh tính
							</span>
						</div>

						{/* Title */}
						<div className="text-center space-y-1.5">
							<h2 className="text-2xl font-bold tracking-tight text-text-primary">
								Nhập mã xác thực
							</h2>
							<p className="text-xs text-text-secondary leading-relaxed">
								Mã 6 chữ số đã được gửi đến hộp thư công vụ
								<br />
								<span className="font-semibold text-text-primary">{maskEmail(forgotEmail)}</span>
							</p>
						</div>

						{/* OTP Input Fields */}
						<form onSubmit={handleOtpSubmit} className="space-y-5">
							<div className="flex items-center justify-center gap-2 sm:gap-3">
								{otp.map((digit, idx) => (
									<input
										key={idx}
										ref={(el) => {
											otpRefs.current[idx] = el;
										}}
										type="text"
										inputMode="numeric"
										maxLength={1}
										value={digit}
										onChange={(e) => handleOtpChange(idx, e.target.value)}
										onKeyDown={(e) => handleOtpKeyDown(idx, e)}
										className="h-14 w-12 sm:w-13 rounded-[16px] border border-border-default text-center text-xl font-bold text-text-primary shadow-2xs focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
									/>
								))}
							</div>

							{/* Countdown & Gửi lại */}
							<div className="flex items-center justify-between text-xs px-1">
								<div className="flex items-center gap-1.5 text-text-secondary">
									<Clock className="h-3.5 w-3.5" />
									<span>Gửi lại mã sau {formatCountdown(countdown)}</span>
								</div>
								<button
									type="button"
									onClick={handleResendOtp}
									disabled={!canResend || isSendingVerify}
									className="font-semibold text-primary hover:underline disabled:opacity-40 disabled:no-underline cursor-pointer"
								>
									Gửi lại mã
								</button>
							</div>

							{/* Nút Xác nhận */}
							<Button
								type="submit"
								className="w-full h-12 rounded-[16px] bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-lg shadow-primary/30 transition-all cursor-pointer flex items-center justify-center gap-2"
							>
								<span>Xác nhận</span>
								<ArrowRight className="h-4 w-4" />
							</Button>

							{/* Nút Đổi email */}
							<button
								type="button"
								onClick={() => {
									setMode("forgot-email");
									setError(null);
								}}
								className="w-full h-12 rounded-[16px] bg-surface-secondary hover:bg-surface-tertiary text-text-primary text-xs font-semibold transition-colors flex items-center justify-center cursor-pointer"
							>
								Đổi email nhận mã
							</button>

							{/* Box Bảo mật tài khoản */}
							<div className="rounded-[20px] bg-background border border-border-subtle p-4.5 flex items-start gap-3.5 mt-5">
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-success/10 text-success">
									<ShieldCheck className="h-4 w-4" />
								</div>
								<div className="space-y-0.5">
									<h4 className="text-xs font-bold text-text-primary">
										Bảo mật tài khoản
									</h4>
									<p className="text-[11px] text-text-secondary leading-relaxed">
										Không chia sẻ mã xác thực cho bất kỳ ai. Mã sẽ hết hiệu lực sau 10 phút và chỉ dùng một lần duy nhất cho phiên làm việc này.
									</p>
								</div>
							</div>
						</form>
					</div>
				)}

				{/* -------------------- MÀN HÌNH 4: TẠO MẬT KHẨU MỚI (ẢNH 4) -------------------- */}
				{mode === "forgot-reset" && (
					<div className="space-y-6">
						{/* Step Badge */}
						<div className="flex justify-center">
							<span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-[11px] font-semibold text-primary">
								<span className="h-1.5 w-1.5 rounded-full bg-primary" />
								Bước 2/2 · Thiết lập mật khẩu
							</span>
						</div>

						{/* Title */}
						<div className="text-center space-y-1.5">
							<h2 className="text-2xl font-bold tracking-tight text-text-primary">
								Tạo mật khẩu mới
							</h2>
							<p className="text-xs text-text-secondary leading-relaxed">
								Chọn mật khẩu mạnh để bảo vệ thông tin bệnh nhân và phiên làm việc
							</p>
						</div>

						{/* Form */}
						<form onSubmit={handleResetPasswordSubmit} className="space-y-4">
							{/* Mật khẩu mới */}
							<div className="space-y-1.5">
								<Label
									htmlFor="new-password"
									className="text-xs font-semibold text-text-primary"
								>
									Mật khẩu mới
								</Label>
								<div className="relative">
									<Key className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
									<Input
										id="new-password"
										type={showNewPassword ? "text" : "password"}
										placeholder="••••••••••••••••"
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										required
										className="h-12 pl-11 pr-11 text-xs rounded-[16px] border-border-default bg-surface shadow-2xs focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
									/>
									<button
										type="button"
										onClick={() => setShowNewPassword(!showNewPassword)}
										tabIndex={-1}
										className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
									>
										{showNewPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
							</div>

							{/* Nhập lại mật khẩu */}
							<div className="space-y-1.5">
								<Label
									htmlFor="confirm-password"
									className="text-xs font-semibold text-text-primary"
								>
									Mật khẩu
								</Label>
								<div className="relative">
									<Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
									<Input
										id="confirm-password"
										type={showConfirmPassword ? "text" : "password"}
										placeholder="••••••••••••••••"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										required
										className="h-12 pl-11 pr-11 text-xs rounded-[16px] border-border-default bg-surface shadow-2xs focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										tabIndex={-1}
										className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
									>
										{showConfirmPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
							</div>

							{/* Nút Đổi mật khẩu */}
							<Button
								type="submit"
								className="w-full h-12 rounded-[16px] bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-lg shadow-primary/30 transition-all cursor-pointer flex items-center justify-center gap-2"
							>
								<span>Đổi mật khẩu</span>
								<ArrowRight className="h-4 w-4" />
							</Button>

							{/* Nút Hủy và quay lại */}
							<button
								type="button"
								onClick={() => {
									setMode("login");
									setError(null);
								}}
								className="w-full h-12 rounded-[16px] bg-surface-secondary hover:bg-surface-tertiary text-text-primary text-xs font-semibold transition-colors flex items-center justify-center cursor-pointer"
							>
								Hủy và quay lại
							</button>
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
