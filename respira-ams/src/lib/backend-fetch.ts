import { API_V1 } from "./api-base";

if (typeof window === "undefined" && process.env.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

/** Server-side fetch helper for the Respira Gateway. */
export async function backendFetch(path: string, init: RequestInit = {}): Promise<Response> {
	const url = /^https?:\/\//i.test(path)
		? path
		: `${API_V1}${path.startsWith("/") ? path : `/${path}`}`;

	return fetch(url, {
		...init,
		cache: "no-store",
		signal: init.signal ?? AbortSignal.timeout(20000),
	});
}
