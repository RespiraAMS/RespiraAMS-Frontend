"use client";

import { useEffect } from "react";

/**
 * Marks <body> as a doctor screen so the dark-mode palette in doctor-dark.css applies
 * to the whole doctor area, including portaled dialogs and dropdowns.
 */
export function DoctorThemeScope({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		document.body.classList.add("doctor-scope");
		return () => document.body.classList.remove("doctor-scope");
	}, []);

	return <>{children}</>;
}

