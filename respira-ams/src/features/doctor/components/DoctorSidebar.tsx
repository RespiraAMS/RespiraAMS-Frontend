'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Users,
    Stethoscope,
    UserCog,
    BarChart3,
    BookOpen,
    Pill,
    Atom,
    BarChart2,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    type LucideIcon,
    ShieldAlert,
    ClipboardCheck,
    Sliders,
    HelpCircle,
    FolderTree,
    FlaskConical,
    FileText,
} from 'lucide-react';
import { AccountSection } from './accountSection';
import { useSidebarStore } from './sidebarStore';

export type UserRole = 'Doctor' | 'HeadDepartmentDoctor';

export interface NavItemConfig {
    key: string;
    icon: LucideIcon;
    href?: string;
    badge?: number;
    roles?: UserRole[];
    children?: Omit<NavItemConfig, 'children'>[];
}

export const NAV_CONFIGS: NavItemConfig[] = [
    {
        key: 'managePatient',
        icon: Users,
        href: '/doctor/patients',
        roles: ['Doctor', 'HeadDepartmentDoctor'],
    },
    {
        key: 'diagnose',
        icon: Stethoscope,
        href: '/doctor/diagnose',
        roles: ['Doctor', 'HeadDepartmentDoctor'],
    },
    {
        key: 'doctors',
        icon: UserCog,
        href: '/doctor/doctors',
        roles: ['HeadDepartmentDoctor'],
    },
    {
        key: 'statistics',
        icon: BarChart3,
        href: '/doctor/statistics',
        roles: ['HeadDepartmentDoctor'],
    },
    {
        key: 'lookUp',
        icon: BookOpen,
        roles: ['Doctor', 'HeadDepartmentDoctor'],
        children: [
            { key: 'antibioticGroups', icon: FolderTree, href: '/doctor/antibiotic-groups' },
            { key: 'antibiotics', icon: Pill, href: '/doctor/antibiotics' },
            { key: 'pathogens', icon: Atom, href: '/doctor/pathogens' },
            { key: 'antibiograms', icon: FlaskConical, href: '/doctor/antibiograms' },
            { key: 'suspectedCauses', icon: HelpCircle, href: '/doctor/suspected-causes' },
            { key: 'treatments', icon: FileText, href: '/doctor/treatments' },
            { key: 'clinicalVariables', icon: Sliders, href: '/doctor/clinical-variables' },
            { key: 'criteria', icon: ClipboardCheck, href: '/doctor/criteria' },
            { key: 'clinicalMetrics', icon: BarChart2, href: '/doctor/clinical-metrics' },
            { key: 'riskFactors', icon: ShieldAlert, href: '/doctor/risk-factors' },
        ],
    },
];

function isRouteActive(pathname: string, href?: string) {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
}

function NavItemLink({
    item,
    label,
    collapsed,
    active,
    isSubItem = false,
}: {
    item: Omit<NavItemConfig, 'children'>;
    label: string;
    collapsed: boolean;
    active: boolean;
    isSubItem?: boolean;
}) {
    const { icon: Icon, href = '#', badge } = item;

    const linkContent = (
        <Link
            href={href}
            className={cn(
                'flex items-center gap-3 rounded-lg font-medium transition-all duration-150 group relative',
                isSubItem ? 'px-2.5 py-2 text-[13px]' : 'px-3 py-2.5 text-sm',
                active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent',
            )}
        >
            <Icon
                className={cn(
                    'shrink-0 transition-colors',
                    isSubItem ? 'h-3.5 w-3.5' : 'h-4 w-4',
                    active
                        ? 'text-sidebar-primary-foreground'
                        : 'text-muted-foreground group-hover:text-sidebar-foreground',
                )}
            />
            {(!collapsed || isSubItem) && <span className="truncate leading-none">{label}</span>}
            {(!collapsed || isSubItem) && badge != null && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-primary/15 px-1.5 text-[11px] font-semibold text-sidebar-primary">
                    {badge}
                </span>
            )}
            {collapsed && !isSubItem && badge != null && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-sidebar-primary" />
            )}
        </Link>
    );

    if (collapsed && !isSubItem) {
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
        );
    }

    return linkContent;
}

function NavGroupItem({
    item,
    pathname,
    collapsed,
    tNav,
}: {
    item: NavItemConfig;
    pathname: string;
    collapsed: boolean;
    tNav: (key: string) => string;
}) {
    const children = item.children ?? [];
    const hasActiveChild = children.some((child) => isRouteActive(pathname, child.href));
    const [open, setOpen] = useState(false);
    const [flyoutOpen, setFlyoutOpen] = useState(false);
    const isOpen = open || hasActiveChild;

    const Icon = item.icon;
    const label = tNav(item.key);

    if (collapsed) {
        return (
            <div
                className="relative"
                onMouseEnter={() => setFlyoutOpen(true)}
                onMouseLeave={() => setFlyoutOpen(false)}
            >
                <button
                    type="button"
                    onClick={() => setFlyoutOpen((prev) => !prev)}
                    aria-label={label}
                    aria-expanded={flyoutOpen}
                    className={cn(
                        'flex w-full items-center justify-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                        hasActiveChild
                            ? 'bg-sidebar-primary/15 text-sidebar-primary'
                            : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent',
                    )}
                >
                    <Icon
                        className={cn(
                            'shrink-0 h-4 w-4 transition-colors',
                            hasActiveChild
                                ? 'text-sidebar-primary'
                                : 'text-muted-foreground group-hover:text-sidebar-foreground',
                        )}
                    />
                </button>

                {flyoutOpen && (
                    <div className="fixed left-16 z-50 pl-2" style={{ marginTop: '-40px' }}>
                        <div className="w-56 rounded-xl border border-sidebar-border bg-sidebar p-2 shadow-lg">
                            <div className="px-2.5 py-1.5 text-xs font-semibold text-muted-foreground border-b border-sidebar-border mb-1">
                                {label}
                            </div>
                            <div className="max-h-[70vh] overflow-y-auto space-y-0.5">
                                {children.map((child) => (
                                    <NavItemLink
                                        key={child.href ?? child.key}
                                        item={child}
                                        label={tNav(child.key)}
                                        collapsed={false}
                                        active={isRouteActive(pathname, child.href)}
                                        isSubItem
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-1">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={isOpen}
                className={cn(
                    'flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                    hasActiveChild
                        ? 'text-sidebar-foreground bg-sidebar-accent/70'
                        : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent',
                )}
            >
                <Icon
                    className={cn(
                        'shrink-0 h-4 w-4 transition-colors',
                        hasActiveChild
                            ? 'text-sidebar-primary'
                            : 'text-muted-foreground group-hover:text-sidebar-foreground',
                    )}
                />
                <span className="truncate leading-none flex-1 text-left">{label}</span>
                <ChevronDown
                    className={cn(
                        'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
                        isOpen && 'rotate-180',
                    )}
                />
            </button>

            {isOpen && (
                <div className="ml-3.5 pl-2.5 border-l border-sidebar-border space-y-0.5">
                    {children.map((child) => (
                        <NavItemLink
                            key={child.href ?? child.key}
                            item={child}
                            label={tNav(child.key)}
                            collapsed={false}
                            active={isRouteActive(pathname, child.href)}
                            isSubItem
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function DoctorSidebar({
    className,
    role = 'Doctor',
    navConfigs = NAV_CONFIGS,
}: {
    className?: string;
    role?: UserRole;
    navConfigs?: NavItemConfig[];
}) {
    const pathname = usePathname();
    const tNav = useTranslations('doctor.nav');
    const collapsed = useSidebarStore((state) => state.collapsed);
    const collapse = useSidebarStore((state) => state.collapse);
    const expand = useSidebarStore((state) => state.expand);

    const visibleNavItems = useMemo(() => {
        return navConfigs
            .filter((item) => !item.roles || item.roles.includes(role))
            .map((item) => {
                if (!item.children) return item;
                return {
                    ...item,
                    children: item.children.filter(
                        (child) => !child.roles || child.roles.includes(role),
                    ),
                };
            });
    }, [navConfigs, role]);

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    'relative flex flex-col h-screen border-r border-sidebar-border bg-sidebar text-sidebar-foreground',
                    'transition-[width] duration-300 ease-in-out',
                    collapsed ? 'w-16' : 'w-60',
                    className,
                )}
            >
                {/* Logo / Header*/}
                <div
                    className={cn(
                        'flex items-center h-16 px-3 border-b border-sidebar-border shrink-0 overflow-hidden',
                        collapsed ? 'justify-center' : 'justify-between',
                    )}
                >
                    <Link href="/" className="flex items-center gap-2.5 min-w-0 overflow-hidden">
                        <div className="relative h-8 w-8 shrink-0">
                            <span className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-sm font-bold">
                                R.
                            </span>
                        </div>
                        <span
                            className={cn(
                                'overflow-hidden transition-all duration-300',
                                collapsed ? 'max-w-0 opacity-0' : 'max-w-40 opacity-100',
                            )}
                        >
                            <span className="font-bold text-foreground tracking-tight">Respira</span>
                            <span className="font-bold text-primary tracking-tight">AMS</span>
                        </span>
                    </Link>

                    {!collapsed && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                            onClick={collapse}
                            aria-label={tNav('collapseSidebar')}
                            id="sidebar-collapse-btn"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Expand button floating when collapsed */}
                {collapsed && (
                    <div className="absolute -right-3 top-[52px] z-10">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-full bg-background border-border shadow-md hover:bg-accent"
                            onClick={expand}
                            aria-label={tNav('expandSidebar')}
                            id="sidebar-expand-btn"
                        >
                            <ChevronRight className="h-3 w-3" />
                        </Button>
                    </div>
                )}

                {/* Nav Links */}
                <nav
                    aria-label={tNav('mainNavigation')}
                    className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-1"
                >
                    {visibleNavItems.map((item) =>
                        item.children && item.children.length > 0 ? (
                            <NavGroupItem
                                key={item.key}
                                item={item}
                                pathname={pathname}
                                collapsed={collapsed}
                                tNav={tNav}
                            />
                        ) : (
                            <NavItemLink
                                key={item.href ?? item.key}
                                item={item}
                                label={tNav(item.key)}
                                collapsed={collapsed}
                                active={isRouteActive(pathname, item.href)}
                            />
                        ),
                    )}
                </nav>

                {/* Account Section*/}
                <div className="border-t border-sidebar-border px-2 py-3 shrink-0">
                    <AccountSection collapsed={collapsed} />
                </div>
            </aside>
        </TooltipProvider>
    );
}