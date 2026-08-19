"use client";

import Image from "next/image";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [rememberMe, setRememberMe] = useState(false);
	const [isLoading] = useState(false);
	const [error] = useState<string | null>(null);

	return (
		<div className="flex w-1/2 flex-col items-center justify-center bg-white px-6 dark:bg-[#0d1117]">
			<div className="w-full max-w-sm">
				{/* Mobile logo */}
				<div className="mb-10 flex items-center gap-3 lg:hidden">
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#39B8FD]">
						<Image
							src="/Background.png"
							alt="RespiraAMS Logo"
							width={36}
							height={36}
							className="h-full w-full object-cover rounded"
						/>
					</div>
					<span className="text-lg font-semibold text-foreground">
						RespiraAMS
					</span>
				</div>

				{/* Heading */}
				<div className="mb-8 space-y-1.5">
					<h2 className="text-3xl font-semibold tracking-tight text-foreground">
						Welcome Back
					</h2>
					<p className="text-[15px] text-muted-foreground">
						Please enter your credentials to access the system.
					</p>
				</div>

				{/* Error banner */}
				{error && (
					<div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/30">
						<div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
						<p className="text-[15px] text-red-700 dark:text-red-400">
							{error}
						</p>
					</div>
				)}

				{/* Form — UI only */}
				<form className="space-y-5">
					{/* Email */}
					<div className="space-y-2">
						<Label
							htmlFor="login-email"
							className="text-[15px] font-semibold"
						>
							Email Address
						</Label>
						<div className="relative">
							<Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
							<Input
								id="login-email"
								type="email"
								autoComplete="email"
								placeholder="name@respira.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="h-12 rounded-xl pl-10 text-[15px] border-[1.5px] border-slate-300 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500/60"
							/>
						</div>
					</div>

					{/* Password */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label
								htmlFor="login-password"
								className="text-[15px] font-semibold"
							>
								Password
							</Label>
							<Button
								type="button"
								variant="link"
								size="sm"
								className="h-auto p-0 text-sm font-semibold text-cyan-600 hover:text-cyan-500 dark:text-cyan-400"
							>
								Forgot Password?
							</Button>
						</div>
						<div className="relative">
							<Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
							<Input
								id="login-password"
								type={showPassword ? "text" : "password"}
								autoComplete="current-password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="h-12 rounded-xl pl-10 pr-12 text-[15px] border-[1.5px] border-slate-300 focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500/60"
							/>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								tabIndex={-1}
								onClick={() => setShowPassword((v) => !v)}
								className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg text-muted-foreground/60 hover:text-foreground"
							>
								{showPassword ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</Button>
						</div>
					</div>

					{/* Remember me + Submit */}
					<div className="flex items-center justify-between pt-1">
						<div className="flex items-center gap-2">
							<Checkbox
								id="remember-me"
								checked={rememberMe}
								onCheckedChange={(checked) =>
									setRememberMe(checked === true)
								}
								className="border-2 border-slate-400"
							/>
							<Label
								htmlFor="remember-me"
								className="text-sm font-normal text-muted-foreground cursor-pointer"
							>
								Remember me
							</Label>
						</div>

						<Button
							type="submit"
							disabled={isLoading}
							className="gap-2 rounded-2xl bg-cyan-600 text-white hover:bg-cyan-500 px-8 h-10"
						>
							{isLoading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<ArrowRight className="h-4 w-4" />
							)}
							Sign in
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
