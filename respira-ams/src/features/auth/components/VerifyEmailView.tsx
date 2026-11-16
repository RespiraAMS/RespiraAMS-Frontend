"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { confirmEmailVerification } from "../api";

type VerificationState = "idle" | "loading" | "success" | "error";

type VerificationResult = {
	status: "success" | "error";
	message: string;
};

export function VerifyEmailView() {
	const t = useTranslations("auth.verify");
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const [result, setResult] = useState<VerificationResult | null>(null);

	useEffect(() => {
		if (!token) return;

		let cancelled = false;

		confirmEmailVerification(token)
			.then(() => {
				if (cancelled) return;
				setResult({
					status: "success",
					message: t("success"),
				});
				// Token is single-use; drop it from the URL so a reload does not retry.
				router.replace(pathname);
			})
			.catch((err: unknown) => {
				if (cancelled) return;
				setResult({
					status: "error",
					message: err instanceof Error ? err.message : t("errorFallback"),
				});
			});

		return () => {
			cancelled = true;
		};
	}, [token, router, pathname, t]);

	const state: VerificationState = !token ? "error" : result?.status ?? "loading";
	const message = !token ? t("errorMissingToken") : result?.message ?? "";

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
					<MailCheck className="h-5 w-5" />
				</div>

				<div className="space-y-1.5">
					<h1 className="text-2xl font-bold tracking-tight text-text-primary">
						{t("title")}
					</h1>
					<p className="text-xs leading-relaxed text-text-secondary">
						{t("subtitle")}
					</p>
				</div>

				{state === "loading" && (
					<div className="flex items-center gap-2.5 rounded-[16px] border border-primary/30 bg-primary/10 px-4 py-3 text-xs text-primary">
						<Loader2 className="h-4 w-4 animate-spin text-primary" />
						<span>{t("loading")}</span>
					</div>
				)}

				{state === "success" && (
					<div className="flex items-start gap-2.5 rounded-[16px] border border-success/30 bg-success/10 px-4 py-3 text-xs text-success">
						<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
						<p className="flex-1 font-medium">{message}</p>
					</div>
				)}

				{state === "error" && (
					<div className="flex items-start gap-2.5 rounded-[16px] border border-error/30 bg-error/10 px-4 py-3 text-xs text-error">
						<AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
						<p className="flex-1 font-medium">{message}</p>
					</div>
				)}

				<Button
					asChild
					className="h-12 w-full cursor-pointer rounded-[16px] bg-primary text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90"
				>
					<Link href="/login">
						<span>{t("backToLogin")}</span>
						<ArrowRight className="h-4 w-4" />
					</Link>
				</Button>
			</div>
		</div>
	);
}

export default VerifyEmailView;
