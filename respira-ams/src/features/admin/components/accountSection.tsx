"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logout, getStoredUser, getStoredAccessToken, parseJwt } from "@/features/auth/api";
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

	const storedUser = getStoredUser();
	let tokenUser = null;
	const token = getStoredAccessToken();
	if (token) {
		tokenUser = parseJwt(token);
	}

	const active = storedUser || tokenUser;
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
									className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#E0F2FE] text-[#0EA5E9] font-bold text-[11px] hover:ring-2 hover:ring-sky-300 transition-all mx-auto cursor-pointer overflow-hidden"
									id="admin-account-trigger-collapsed"
								>
									{currentUser.avatarUrl ? (
										<img
											src={currentUser.avatarUrl}
											alt={currentUser.name}
											className="h-full w-full object-cover"
										/>
									) : (
										<span>{currentUser.initials}</span>
									)}
									<span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-[#22C55E] ring-2 ring-white" />
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
							<p className="text-xs font-semibold text-slate-900">{currentUser.name}</p>
							<p className="text-[10px] text-muted-foreground truncate">
								{currentUser.email ? `${currentUser.role} • ${currentUser.email}` : currentUser.role}
							</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={handleLogout}
						className="text-destructive focus:text-destructive cursor-pointer flex items-center gap-2 text-xs text-red-600 focus:text-red-600"
					>
						<LogOut className="h-3.5 w-3.5 text-red-500" />
						<span>Đăng xuất</span>
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
						className="flex items-center gap-2 min-w-0 text-left flex-1 cursor-pointer focus:outline-hidden"
						id="admin-account-trigger"
					>
						{/* Avatar Circle with Online Dot */}
						<div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E0F2FE] text-[#0EA5E9] font-bold text-[11px] select-none overflow-hidden">
							{currentUser.avatarUrl ? (
								<img
									src={currentUser.avatarUrl}
									alt={currentUser.name}
									className="h-full w-full object-cover"
								/>
							) : (
								<span>{currentUser.initials}</span>
							)}
							<span
								className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-[#22C55E] ring-2 ring-white"
								title="Đang trực tuyến"
							/>
						</div>

						{/* Admin Name and Role / Email */}
						<div className="min-w-0 flex-1">
							<p className="truncate text-[11.5px] font-bold text-slate-800 leading-tight">
								{currentUser.name}
							</p>
							<p className="truncate text-[9.5px] text-slate-400 font-medium leading-tight mt-0.5">
								{currentUser.email || currentUser.role}
							</p>
						</div>
					</button>
				</DropdownMenuTrigger>

				{/* Logout / Action Button */}
				<button
					type="button"
					onClick={handleLogout}
					title="Đăng xuất"
					aria-label="Đăng xuất"
					className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
					id="admin-logout-button"
				>
					<LogOut className="h-3.5 w-3.5" />
				</button>
			</div>

			<DropdownMenuContent align="end" className="w-52 mb-2 rounded-[12px] text-xs">
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col gap-0.5">
						<p className="text-xs font-semibold text-slate-900">{currentUser.name}</p>
						<p className="text-[10px] text-muted-foreground truncate">
							{currentUser.email ? `${currentUser.role} • ${currentUser.email}` : currentUser.role}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={handleLogout}
					className="text-destructive focus:text-destructive cursor-pointer flex items-center gap-2 text-xs text-red-600 focus:text-red-600"
				>
					<LogOut className="h-3.5 w-3.5 text-red-500" />
					<span>Đăng xuất</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default AdminAccountSection;

