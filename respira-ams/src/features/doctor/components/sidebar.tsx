"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
  Stethoscope,
  History,
  BarChart3,
  BookOpen,
} from "lucide-react"
import AccountSection from "@/features/doctor/components/accountSection"
import { useSidebarStore } from "@/features/doctor/components/sidebarStore"

interface NavItem {
  icon: LucideIcon
  label: string
  href: string
  badge?: number
}

interface NavItemProps {
  item: NavItem
  collapsed: boolean
  active: boolean
}

const NAV_ITEMS: NavItem[] = [
  { icon: Stethoscope, label: "Chẩn đoán", href: "/doctor/diagnose" },
  { icon: BookOpen, label: "Tra cứu", href: "/doctor/info" },
  { icon: History, label: "Lịch sử", href: "/doctor/history" },
  { icon: BarChart3, label: "Thống kê", href: "/doctor/statistics" },
]

// Mock user – no API calls
const MOCK_USER = {
  name: "Bác sĩ Demo",
  email: "doctor@respira.com",
  initials: "BD",
}

function NavItemLink({ item, collapsed, active }: NavItemProps) {
  const { icon: Icon, label, href, badge } = item

  const linkContent = (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
        "transition-all duration-150 group relative",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      <Icon
        className={cn(
          "shrink-0 h-4.5 w-4.5 transition-colors",
          active
            ? "text-primary-foreground"
            : "text-muted-foreground group-hover:text-foreground"
        )}
      />

      {!collapsed && <span className="truncate leading-none">{label}</span>}

      {!collapsed && badge != null && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/15 px-1.5 text-[11px] font-semibold text-primary">
          {badge}
        </span>
      )}

      {collapsed && badge != null && (
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
      )}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {label}
          {badge != null && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/15 px-1.5 text-[11px] font-semibold text-primary">
              {badge}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    )
  }

  return linkContent
}

export function DoctorSidebar() {
  const collapsed = useSidebarStore((state) => state.collapsed)
  const collapse = useSidebarStore((state) => state.collapse)
  const expand = useSidebarStore((state) => state.expand)
  const pathname = usePathname()
  const [logoError, setLogoError] = useState(false)

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "sticky top-0 flex flex-col h-screen border-r bg-background",
          "transition-[width] duration-300 ease-in-out",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <div
          className={cn(
            "flex items-center h-16 px-3 border-b shrink-0 overflow-hidden",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          <Link
            href="/"
            className="flex items-center gap-2.5 min-w-0 overflow-hidden"
          >
            <div className="relative h-8 w-8 shrink-0">
              {logoError && (
                <span className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                  R
                </span>
              )}
              <Image
                src="/logo.png"
                alt="RespiraAMS logo"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={cn(
                  "rounded-lg object-cover",
                  logoError ? "hidden" : "block"
                )}
                onError={() => setLogoError(true)}
              />
            </div>

            <span
              className={cn(
                "overflow-hidden transition-all duration-300",
                collapsed ? "max-w-0 opacity-0" : "max-w-40 opacity-100"
              )}
            >
              <span className="font-semibold text-sm truncate block">
                RespiraAMS
              </span>
            </span>
          </Link>

          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={collapse}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        {collapsed && (
          <div className="absolute -right-3 top-13 z-10">
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6 rounded-full bg-background shadow-md border"
              onClick={expand}
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        )}

        <nav
          aria-label="Main navigation"
          className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-0.5"
        >
          {NAV_ITEMS.map((item) => (
            <NavItemLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              active={pathname === item.href || pathname.startsWith(item.href + "/")}
            />
          ))}
        </nav>

        <div className="border-t px-2 py-3 shrink-0">
          <AccountSection user={MOCK_USER} collapsed={collapsed} />
        </div>
      </aside>
    </TooltipProvider>
  )
}
