"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Settings, User } from "lucide-react";
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

export const MOCK_DOCTOR_USER: UserInfo = {
	name: "BS.CKII Lê Hoàng Minh",
	title: "Bác sĩ Chuyên khoa II",
	department: "Hồi sức Tích cực",
	hospital: "BV TW",
	email: "minh.le@respira.com",
	initials: "HM",
};

export interface AccountSectionProps {
	user?: UserInfo;
	collapsed?: boolean;
	className?: string;
}

export function AccountSection({
	user = MOCK_DOCTOR_USER,
	collapsed = false,
	className,
}: AccountSectionProps) {
	const router = useRouter();

	const handleLogout = (e: React.MouseEvent) => {
		e.stopPropagation();
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
									className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#E0F2FE] text-[#0EA5E9] font-bold text-[11px] hover:ring-2 hover:ring-sky-300 transition-all mx-auto cursor-pointer"
									id="doctor-account-trigger-collapsed"
								>
									<span>{user.initials}</span>
									<span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-[#22C55E] ring-2 ring-white" />
								</button>
							</DropdownMenuTrigger>
						</TooltipTrigger>
						<TooltipContent side="right">
							<p className="font-semibold text-xs">{user.name}</p>
							<p className="text-[10px] text-muted-foreground">
								{user.department} - {user.hospital}
							</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<DropdownMenuContent align="end" side="right" className="w-52 text-xs">
					<DropdownMenuLabel className="font-normal">
						<div className="flex flex-col gap-0.5">
							<p className="text-xs font-semibold">{user.name}</p>
							<p className="text-[10px] text-muted-foreground">
								{user.department} - {user.hospital}
							</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem asChild>
						<Link href="/profile" className="flex items-center gap-2 cursor-pointer text-xs">
							<User className="h-3.5 w-3.5" />
							Thông tin cá nhân
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link href="/settings" className="flex items-center gap-2 cursor-pointer text-xs">
							<Settings className="h-3.5 w-3.5" />
							Cài đặt
						</Link>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={handleLogout}
						className="text-destructive focus:text-destructive cursor-pointer flex items-center gap-2 text-xs"
					>
						<LogOut className="h-3.5 w-3.5" />
						Đăng xuất
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
						id="doctor-account-trigger"
					>
						{/* Avatar Circle with Online Dot */}
						<div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E0F2FE] text-[#0EA5E9] font-bold text-[11px] select-none">
							<span>{user.initials}</span>
							<span
								className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-[#22C55E] ring-2 ring-white"
								title="Đang trực tuyến"
							/>
						</div>

						{/* Doctor Name and Department */}
						<div className="min-w-0 flex-1">
							<p className="truncate text-[11.5px] font-bold text-slate-800 leading-tight">
								{user.name}
							</p>
							<p className="truncate text-[9.5px] text-slate-400 font-medium leading-tight mt-0.5">
								{user.department} - {user.hospital}
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
							{user.department} - {user.hospital}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/profile" className="flex items-center gap-2 cursor-pointer text-xs">
						<User className="h-3.5 w-3.5" />
						Thông tin cá nhân
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/settings" className="flex items-center gap-2 cursor-pointer text-xs">
						<Settings className="h-3.5 w-3.5" />
						Cài đặt
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={handleLogout}
					className="text-destructive focus:text-destructive cursor-pointer flex items-center gap-2 text-xs"
				>
					<LogOut className="h-3.5 w-3.5" />
					Đăng xuất
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default AccountSection;
