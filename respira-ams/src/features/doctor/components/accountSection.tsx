"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { LogOut, Settings, User } from "lucide-react";
import { logout, getUser } from "@/lib/auth";
import { getStoredDoctorProfile, fetchCurrentDoctorProfile } from "@/features/profile/api";
import { getDoctorDisplayName, POSITION_LABELS, DoctorProfile } from "@/features/profile/types";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface UserInfo {
	name: string;
	title?: string;
	department?: string;
	hospital?: string;
	email?: string;
	avatarUrl?: string;
	initials: string;
}

function buildUserInfo(profile?: DoctorProfile | null, authUser?: { name?: string; email?: string } | null): UserInfo {
	if (profile && (profile.firstName || profile.lastName)) {
		const name = getDoctorDisplayName(profile);
		const initial = (profile.firstName || profile.lastName || "B").trim().charAt(0).toUpperCase();
		const positionText = POSITION_LABELS[profile.position] || "Bác sĩ điều trị";
		return {
			name,
			title: positionText,
			department: profile.email || authUser?.email || "Respira AMS",
			hospital: "",
			email: profile.email || authUser?.email || "",
			avatarUrl: profile.avatarUrl || profile.mediaUrl,
			initials: initial,
		};
	}

	if (authUser?.name || authUser?.email) {
		const displayName = authUser.name || authUser.email?.split("@")[0] || "Bác sĩ";
		const initial = displayName.charAt(0).toUpperCase();
		return {
			name: `BS. ${displayName}`,
			title: "Bác sĩ",
			department: authUser.email || "Respira AMS",
			hospital: "",
			email: authUser.email || "",
			initials: initial,
		};
	}

	return {
		name: "Bác sĩ",
		title: "Bác sĩ",
		department: "Respira AMS",
		hospital: "",
		email: "",
		initials: "BS",
	};
}

export interface AccountSectionProps {
	user?: UserInfo;
	collapsed?: boolean;
	className?: string;
}

export function AccountSection({
	user: initialUser,
	collapsed = false,
	className,
}: AccountSectionProps) {
	const router = useRouter();
	const t = useTranslations("doctor.account");
	const [mounted, setMounted] = useState(false);

	// Khởi tạo đồng nhất trên SSR và Client để ngăn lỗi Hydration Mismatch
	const [currentUserInfo, setCurrentUserInfo] = useState<UserInfo>(() => {
		if (initialUser) return initialUser;
		return buildUserInfo(null, null);
	});

	const applyDoctorProfile = useCallback((profile: DoctorProfile) => {
		const storedUser = getUser();
		const authUser = storedUser
			? {
					name: [storedUser.firstName, storedUser.lastName].filter(Boolean).join(" "),
					email: storedUser.email,
			  }
			: null;
		const info = buildUserInfo(profile, authUser);
		setCurrentUserInfo(info);
	}, []);

	// Đồng bộ thông tin cá nhân từ Backend sau khi client đã mount
	useEffect(() => {
		setMounted(true);

		// 1. Kiểm tra cache có sẵn
		const cached = getStoredDoctorProfile();
		const storedUser = getUser();
		if (cached && (cached.firstName || cached.lastName)) {
			applyDoctorProfile(cached);
		} else if (storedUser) {
			setCurrentUserInfo(
				buildUserInfo(null, {
					name: [storedUser.firstName, storedUser.lastName].filter(Boolean).join(" "),
					email: storedUser.email,
				})
			);
		}

		// 2. Luôn chủ động fetch mới nhất từ backend
		fetchCurrentDoctorProfile()
			.then((latest) => {
				if (latest && (latest.firstName || latest.lastName)) {
					applyDoctorProfile(latest);
				}
			})
			.catch((err) => {
				console.warn("[AccountSection] Could not sync doctor profile:", err);
			});

		// 3. Lắng nghe event phát ra khi profile thay đổi hoặc lưu
		const handleProfileUpdate = (e: Event) => {
			const customEvent = e as CustomEvent<DoctorProfile>;
			if (customEvent.detail) {
				applyDoctorProfile(customEvent.detail);
			} else {
				const updated = getStoredDoctorProfile();
				if (updated) applyDoctorProfile(updated);
			}
		};

		window.addEventListener("respira:profile-updated", handleProfileUpdate);
		window.addEventListener("storage", handleProfileUpdate);

		return () => {
			window.removeEventListener("respira:profile-updated", handleProfileUpdate);
			window.removeEventListener("storage", handleProfileUpdate);
		};
	}, [applyDoctorProfile]);

	const user = currentUserInfo;
	const activeAvatarUrl = mounted ? user.avatarUrl : undefined;

	const handleLogout = async (e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			await logout();
		} catch (error) {
			console.error("Logout error:", error);
		}
		router.push("/login");
	};

	if (collapsed) {
		return (
			<DropdownMenu>
				<TooltipProvider delayDuration={0}>
					<Tooltip>
						<TooltipTrigger asChild>
							<DropdownMenuTrigger asChild>
								<button
									type="button"
									suppressHydrationWarning
									className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#E0F2FE] text-[#0EA5E9] font-bold text-[11px] hover:ring-2 hover:ring-sky-300 transition-all mx-auto cursor-pointer"
									id="doctor-account-trigger-collapsed"
								>
									<div className="h-full w-full rounded-full overflow-hidden flex items-center justify-center">
										{activeAvatarUrl ? (
											<img
												src={activeAvatarUrl}
												alt={user.name}
												className="h-full w-full object-cover"
											/>
										) : (
											<span suppressHydrationWarning>{user.initials}</span>
										)}
									</div>
									<span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#22C55E] ring-2 ring-white dark:ring-slate-900 z-10 pointer-events-none" />
								</button>
							</DropdownMenuTrigger>
						</TooltipTrigger>
						<TooltipContent side="right">
							<p className="font-semibold text-xs">{user.name}</p>
							<p className="text-[10px] text-muted-foreground">
								{user.title} {user.email ? `• ${user.email}` : ""}
							</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<DropdownMenuContent align="end" side="right" className="w-52 text-xs">
					<DropdownMenuLabel className="font-normal">
						<div className="flex flex-col gap-0.5">
							<p className="text-xs font-semibold">{user.name}</p>
							<p className="text-[10px] text-muted-foreground">
								{user.title} {user.email ? `• ${user.email}` : ""}
							</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem asChild>
						<Link href="/doctor/profile" className="flex items-center gap-2 cursor-pointer text-xs">
							<User className="h-3.5 w-3.5" />
							{t("profile")}
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link href="/doctor/settings" className="flex items-center gap-2 cursor-pointer text-xs">
							<Settings className="h-3.5 w-3.5" />
							{t("settings")}
						</Link>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={handleLogout}
						className="text-destructive focus:text-destructive cursor-pointer flex items-center gap-2 text-xs"
					>
						<LogOut className="h-3.5 w-3.5" />
						{t("logout")}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}

	return (
		<DropdownMenu>
			<div
				className={cn(
					"group flex items-center justify-between gap-2 p-1.5 rounded-[12px] border border-slate-200/80 bg-white hover:border-slate-300 shadow-2xs transition-all",
					className
				)}
			>
				{/* Avatar & Info */}
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						suppressHydrationWarning
						className="flex items-center gap-2 min-w-0 text-left flex-1 cursor-pointer focus:outline-hidden"
						id="doctor-account-trigger"
					>
						{/* Avatar Circle with Online Dot */}
						<div
							suppressHydrationWarning
							className="relative shrink-0"
						>
							<div
								suppressHydrationWarning
								className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E0F2FE] text-[#0EA5E9] font-bold text-[11px] select-none overflow-hidden"
							>
								{activeAvatarUrl ? (
									<img
										src={activeAvatarUrl}
										alt={user.name}
										className="h-full w-full object-cover"
									/>
								) : (
									<span suppressHydrationWarning>{user.initials}</span>
								)}
							</div>
							<span
								className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#22C55E] ring-2 ring-white dark:ring-slate-900 z-10"
								title={t("online")}
							/>
						</div>

						{/* Doctor Name and Position */}
						<div className="min-w-0 flex-1" suppressHydrationWarning>
							<p
								suppressHydrationWarning
								className="truncate text-[11.5px] font-bold text-slate-800 leading-tight"
							>
								{user.name}
							</p>
							<p
								suppressHydrationWarning
								className="truncate text-[9.5px] text-slate-400 font-medium leading-tight mt-0.5"
							>
								{user.title} {user.email ? `• ${user.email}` : ""}
							</p>
						</div>
					</button>
				</DropdownMenuTrigger>

				{/* Logout / Action Button */}
				<button
					type="button"
					onClick={handleLogout}
					title={t("logout")}
					aria-label={t("logout")}
					className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
					id="doctor-logout-button"
				>
					<LogOut className="h-3.5 w-3.5" />
				</button>
			</div>

			<DropdownMenuContent align="end" className="w-52 mb-2 rounded-[12px] text-xs">
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col gap-0.5">
						<p className="text-xs font-semibold text-slate-900">{user.name}</p>
						<p className="text-[10px] text-muted-foreground">
							{user.title} {user.email ? `• ${user.email}` : ""}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/doctor/profile" className="flex items-center gap-2 cursor-pointer text-xs">
						<User className="h-3.5 w-3.5" />
						{t("profile")}
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/doctor/settings" className="flex items-center gap-2 cursor-pointer text-xs">
						<Settings className="h-3.5 w-3.5" />
						{t("settings")}
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={handleLogout}
					className="text-destructive focus:text-destructive cursor-pointer flex items-center gap-2 text-xs"
				>
					<LogOut className="h-3.5 w-3.5" />
					{t("logout")}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default AccountSection;
