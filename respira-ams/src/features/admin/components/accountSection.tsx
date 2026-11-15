"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { logout, getUser } from "@/lib/auth";
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

export interface AdminUserInfo {
	name: string;
	role: string;
	department?: string;
	email?: string;
	initials: string;
	avatarUrl?: string;
}

function resolveAdminAccount(customUser?: AdminUserInfo): AdminUserInfo {
	if (customUser) return customUser;

	const storedUser = getUser();
	const active = storedUser;
	const email = active?.email || "";
	const role = active?.role || "Admin";

	let name = "";
	let avatarUrl: string | undefined = undefined;

	if (typeof window !== "undefined") {
		try {
			const rawUsers = localStorage.getItem("respira_admin_users_v1");
			if (rawUsers && email) {
				const users = JSON.parse(rawUsers);
				if (Array.isArray(users)) {
					const matched = users.find(
						(u: any) =>
							(u.email && u.email.toLowerCase() === email.toLowerCase()) ||
							(active?.id && (u.id === active.id || u.doctorId === active.id))
					);
					if (matched) {
						if (matched.lastName || matched.firstName) {
							name = `${matched.lastName || ""} ${matched.firstName || ""}`.trim();
						}
						if (matched.avatarUrl) {
							avatarUrl = matched.avatarUrl;
						}
					}
				}
			}
		} catch {
			// ignore
		}
	}

	if (!name) {
		const customName = (active as { name?: string } | null)?.name;
		if (customName) {
			name = customName;
		} else if (email) {
			const prefix = email.split("@")[0];
			name = prefix.charAt(0).toUpperCase() + prefix.slice(1);
		} else {
			name = "Quản trị viên";
		}
	}

	const initials =
		name
			.split(" ")
			.filter(Boolean)
			.slice(-2)
			.map((s) => s.charAt(0).toUpperCase())
			.join("") || "AD";

	return {
		name,
		role: role === "Admin" ? "Quản trị viên" : role,
		department: email,
		email,
		initials: initials.slice(0, 2),
		avatarUrl,
	};
}

export interface AdminAccountSectionProps {
	user?: AdminUserInfo;
	collapsed?: boolean;
	className?: string;
}

export function AdminAccountSection({
	user: propUser,
	collapsed = false,
	className,
}: AdminAccountSectionProps) {
	const router = useRouter();
	const t = useTranslations("admin.account");

	const [currentUser, setCurrentUser] = useState<AdminUserInfo>(() =>
		propUser || {
			name: "Quản trị viên",
			role: "Quản trị viên",
			department: "",
			email: "",
			initials: "AD",
		}
	);

	useEffect(() => {
		setCurrentUser(resolveAdminAccount(propUser));
	}, [propUser]);

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
									className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[11px] hover:ring-2 hover:ring-primary/30 transition-all mx-auto cursor-pointer"
									id="admin-account-trigger-collapsed"
								>
									<div className="h-full w-full rounded-full overflow-hidden flex items-center justify-center">
										{currentUser.avatarUrl ? (
											<img
												src={currentUser.avatarUrl}
												alt={currentUser.name}
												className="h-full w-full object-cover"
											/>
										) : (
											<span>{currentUser.initials}</span>
										)}
									</div>
									<span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-surface dark:ring-border-default pointer-events-none z-10" />
								</button>
							</DropdownMenuTrigger>
						</TooltipTrigger>
						<TooltipContent side="right">
							<p className="font-semibold text-xs">{currentUser.name}</p>
							<p className="text-[10px] text-muted-foreground">
								{currentUser.email || currentUser.role}
							</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<DropdownMenuContent align="end" side="right" className="w-52 text-xs">
					<DropdownMenuLabel className="font-normal">
						<div className="flex flex-col gap-0.5">
							<p className="text-xs font-semibold text-text-primary">{currentUser.name}</p>
							<p className="text-[10px] text-muted-foreground truncate">
								{currentUser.email ? `${currentUser.role} • ${currentUser.email}` : currentUser.role}
							</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={handleLogout}
						className="text-destructive focus:text-destructive cursor-pointer flex items-center gap-2 text-xs text-error focus:text-error"
					>
						<LogOut className="h-3.5 w-3.5 text-error" />
						<span>{t("logout")}</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}

	return (
		<DropdownMenu>
			<div
				className={cn(
					"group flex items-center justify-between gap-2 p-1.5 rounded-[12px] border border-border-default/80 bg-surface hover:border-border-default shadow-2xs transition-all",
					className
				)}
			>
				{/* Avatar & Info */}
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						className="flex items-center gap-2 min-w-0 text-left flex-1 cursor-pointer focus:outline-hidden"
						id="admin-account-trigger"
					>
						{/* Avatar Circle with Online Dot */}
						<div className="relative shrink-0">
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[11px] select-none overflow-hidden">
								{currentUser.avatarUrl ? (
									<img
										src={currentUser.avatarUrl}
										alt={currentUser.name}
										className="h-full w-full object-cover"
									/>
								) : (
									<span>{currentUser.initials}</span>
								)}
							</div>
							<span
								className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-surface dark:ring-border-default z-10"
								title={t("online")}
							/>
						</div>

						{/* Admin Name and Role / Email */}
						<div className="min-w-0 flex-1">
							<p className="truncate text-[11.5px] font-bold text-text-primary leading-tight">
								{currentUser.name}
							</p>
							<p className="truncate text-[9.5px] text-text-tertiary font-medium leading-tight mt-0.5">
								{currentUser.email || currentUser.role}
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
					className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] text-text-tertiary hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
					id="admin-logout-button"
				>
					<LogOut className="h-3.5 w-3.5" />
				</button>
			</div>

			<DropdownMenuContent align="end" className="w-52 mb-2 rounded-[12px] text-xs">
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col gap-0.5">
						<p className="text-xs font-semibold text-text-primary">{currentUser.name}</p>
						<p className="text-[10px] text-muted-foreground truncate">
							{currentUser.email ? `${currentUser.role} • ${currentUser.email}` : currentUser.role}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={handleLogout}
					className="text-destructive focus:text-destructive cursor-pointer flex items-center gap-2 text-xs text-error focus:text-error"
				>
					<LogOut className="h-3.5 w-3.5 text-error" />
					<span>{t("logout")}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default AdminAccountSection;

