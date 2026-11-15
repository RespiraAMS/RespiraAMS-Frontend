"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
	const searchParams = useSearchParams();
	const token = searchParams.get("token") || "";

	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!token) {
			setError("Liên kết đặt lại mật khẩu thiếu mã token. Vui lòng mở lại liên kết trong email.");
			return;
		}

		if (newPassword.length < 6) {
			setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
			return;
		}

		if (newPassword !== confirmPassword) {
			setError("Mật khẩu xác nhận không khớp.");
			return;
		}

		setIsSubmitting(true);

		try {
			await resetPassword({ token, newPassword, confirmPassword });
			setIsSuccess(true);
			setNewPassword("");
			setConfirmPassword("");
		} catch (err: unknown) {
			setError(
				err instanceof Error
					? err.message
					: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn."
			);
		} finally {
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
						Tạo mật khẩu mới
					</h1>
					<p className="text-xs leading-relaxed text-text-secondary">
						Chọn mật khẩu mạnh để bảo vệ thông tin bệnh nhân và phiên làm việc của bạn.
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
						<p className="flex-1 font-medium">
							Mật khẩu đã được cập nhật thành công! Vui lòng đăng nhập lại.
						</p>
					</div>
				)}

				{!isSuccess && !token && (
					<div className="flex items-start gap-2.5 rounded-[16px] border border-warning/30 bg-warning/10 px-4 py-3 text-xs text-warning">
						<AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
						<p className="flex-1 font-medium">
							Liên kết không hợp lệ. Vui lòng yêu cầu lại liên kết đặt lại mật khẩu từ
							trang đăng nhập.
						</p>
					</div>
				)}

				{!isSuccess && (
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-1.5">
							<Label htmlFor="new-password" className="text-xs font-semibold text-text-primary">
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
									disabled={isSubmitting || !token}
									required
									className="h-12 rounded-[16px] border-border-default bg-surface pl-11 pr-11 text-xs shadow-2xs transition-all focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
								/>
								<button
									type="button"
									onClick={() => setShowNewPassword(!showNewPassword)}
									tabIndex={-1}
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
								Nhập lại mật khẩu mới
							</Label>
							<div className="relative">
								<Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
								<Input
									id="confirm-password"
									type={showConfirmPassword ? "text" : "password"}
									placeholder="••••••••••••••••"
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
									<span>Đổi mật khẩu</span>
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
					<Link href="/login">Quay lại đăng nhập</Link>
				</Button>
			</div>
		</div>
	);
}

export default ResetPasswordForm;
