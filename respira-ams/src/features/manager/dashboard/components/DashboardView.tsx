"use client";

import Link from "next/link";
import {
	Pill,
	FileText,
	Sliders,
	ShieldAlert,
	ArrowRight,
	FolderTree,
	HelpCircle,
	FlaskConical,
	Atom,
	BarChart2,
	ClipboardCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const managementModules = [
	{
		id: "antibiotic-groups",
		key: "antibioticGroups",
		icon: FolderTree,
		href: "/manage/antibiotic-groups",
		color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-500/20",
	},
	{
		id: "antibiotics",
		key: "antibiotics",
		icon: Pill,
		href: "/manage/antibiotics",
		color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-500/20",
	},
	{
		id: "pathogens",
		key: "pathogens",
		icon: Atom,
		href: "/manage/pathogens",
		color: "text-teal-600 dark:text-teal-400 bg-teal-500/10 dark:bg-teal-500/20 border-teal-500/20",
	},
	{
		id: "antibiograms",
		key: "antibiograms",
		icon: FlaskConical,
		href: "/manage/antibiograms",
		color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20",
	},
	{
		id: "suspected-causes",
		key: "suspectedCauses",
		icon: HelpCircle,
		href: "/manage/suspected-causes",
		color: "text-rose-600 dark:text-rose-400 bg-rose-500/10 dark:bg-rose-500/20 border-rose-500/20",
	},
	{
		id: "treatment-protocols",
		key: "treatmentProtocols",
		icon: FileText,
		href: "/manage/treatments",
		color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/20",
	},
	{
		id: "clinical-variables",
		key: "clinicalVariables",
		icon: Sliders,
		href: "/manage/clinical-variables",
		color: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 dark:bg-cyan-500/20 border-cyan-500/20",
	},
	{
		id: "criteria",
		key: "criteria",
		icon: ClipboardCheck,
		href: "/manage/criteria",
		color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/20",
	},
	{
		id: "clinical-metrics",
		key: "clinicalMetrics",
		icon: BarChart2,
		href: "/manage/clinical-metrics",
		color: "text-violet-600 dark:text-violet-400 bg-violet-500/10 dark:bg-violet-500/20 border-violet-500/20",
	},
	{
		id: "risk-factors",
		key: "riskFactors",
		icon: ShieldAlert,
		href: "/manage/risk-factors",
		color: "text-rose-600 dark:text-rose-400 bg-rose-500/10 dark:bg-rose-500/20 border-rose-500/20",
	},
];

export function ManagerDashboardView() {
	const t = useTranslations("manager.dashboard");

	return (
		<div className="space-y-8 bg-background text-foreground min-h-screen">
			{/* Header Section */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
				<div>
					<div className="flex items-center gap-2">
						<h1 className="text-3xl font-bold tracking-tight text-foreground">{t("title")}</h1>
						<Badge
							variant="secondary"
							className="bg-primary/10 text-primary border border-primary/20 font-semibold"
						>
							{t("badge")}
						</Badge>
					</div>
					<p className="text-muted-foreground mt-1 text-sm">{t("subtitle")}</p>
				</div>
			</div>

			{/* Modules Grid */}
			<div className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
					{managementModules.map((module) => {
						const Icon = module.icon;
						const title = t(`modules.${module.key}.title`);
						const description = t(`modules.${module.key}.description`);

						return (
							<Card
								key={module.id}
								className="group border border-border bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-primary/50 transition-all flex flex-col justify-between"
							>
								<CardHeader className="space-y-3">
									<div className="flex items-center justify-between">
										<div className={`p-2.5 rounded-xl border ${module.color}`}>
											<Icon className="h-5 w-5" />
										</div>
									</div>
									<div>
										<CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
											{title}
										</CardTitle>
										<CardDescription className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
											{description}
										</CardDescription>
									</div>
								</CardHeader>

								<CardFooter className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground bg-muted/20 rounded-b-xl">
									<Button
										variant="ghost"
										size="sm"
										asChild
										className="h-8 px-2 text-primary hover:bg-primary/10 gap-1 font-semibold"
									>
										<Link href={module.href}>
											{t("manageButton")}{" "}
											<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
										</Link>
									</Button>
								</CardFooter>
							</Card>
						);
					})}
				</div>
			</div>
		</div>
	);
}