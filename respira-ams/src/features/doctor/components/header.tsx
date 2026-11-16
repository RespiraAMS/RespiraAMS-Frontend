"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const PAGE_TITLE_KEYS: Record<string, string> = {
	"/doctor/patients": "patients",
	"/doctor/pathogens": "pathogens",
	"/doctor/antibiotic-groups": "antibioticGroups",
	"/doctor/info": "info",
	"/doctor/diagnose": "diagnose",
	"/doctor/statistics": "statistics",
	"/doctor/history": "history",
	"/doctor/profile": "profile",
	"/doctor/settings": "settings",
};

export function DoctorHeader() {
	const pathname = usePathname();
	const t = useTranslations("doctor.header");
	let title = t("default");

	if (pathname.startsWith("/doctor/patients/")) {
		title = t("patientDetail");
	} else if (pathname.startsWith("/doctor/pathogens/")) {
		title = t("pathogenDetail");
	} else if (pathname.startsWith("/doctor/info/")) {
		title = t("antibioticDetail");
	} else {
		const key = Object.entries(PAGE_TITLE_KEYS).find(
			([href]) => pathname === href || pathname.startsWith(href + "/")
		)?.[1];
		if (key) title = t(key);
	}

	return (
		<header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white px-6">
			<h1 className="truncate text-lg font-bold tracking-tight text-slate-900">
				{title}
			</h1>
			<div className="flex items-center gap-2">
				<LanguageSwitcher />
			</div>
		</header>
	);
}

export default DoctorHeader;
