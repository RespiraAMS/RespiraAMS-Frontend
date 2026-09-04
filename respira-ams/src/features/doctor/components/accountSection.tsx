"use client"

import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { LogOut, Settings, User } from "lucide-react"
import Link from "next/link"

export interface UserInfo {
  name: string
  email: string
  avatarUrl?: string
  initials: string
}

export default function AccountSection({ user, collapsed }: { user: UserInfo; collapsed?: boolean }) {
  const router = useRouter()

  const handleLogout = () => {
    // Mock logout – redirect to login
    router.push("/login")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn(
          "flex items-center rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-accent overflow-hidden",
          collapsed ? "justify-center w-full px-0" : "gap-2.5"
        )}>
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              collapsed ? "max-w-0 opacity-0" : "max-w-40 opacity-100"
            )}
          >
            <div className="text-left w-max">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs text-muted-foreground leading-none mt-1">{user.email}</p>
            </div>
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
            <User className="h-4 w-4" />
            Quản lý tài khoản
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            Cài đặt
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 cursor-pointer text-destructive focus:text-destructive px-2 py-1.5 text-sm"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
