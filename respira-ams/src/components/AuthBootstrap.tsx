"use client";

import { useEffect } from "react";
import { restoreSession } from "@/lib/auth";

let sessionRestoreStarted = false;

/**
 * Restores the server-side iron-session into the client store once per page load.
 * API requests themselves are authenticated by the /api/backend proxy.
 */
export function AuthBootstrap() {
	useEffect(() => {
		if (sessionRestoreStarted) return;
		sessionRestoreStarted = true;
		void restoreSession();
	}, []);

	return null;
}
