"use client";

import { useEffect } from "react";
import { restoreSession } from "@/lib/auth";

/**
 * Restores the server-side iron-session into the client store once per page load.
 * API requests themselves are authenticated by the /api/backend proxy.
 */
export function AuthBootstrap() {
	useEffect(() => {
		void restoreSession();
	}, []);

	return null;
}
