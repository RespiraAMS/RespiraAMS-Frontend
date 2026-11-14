const RAW_GATEWAY_URL =
	process.env.BACKEND_API_URL ||
	process.env.NEXT_PUBLIC_API_URL ||
	"https://gateway-respira.dev.localhost:7283";

function normalizeGatewayOrigin(value: string): string {
	const trimmed = value.trim().replace(/\/+$/, "");
	return trimmed.replace(/\/api\/v\d+$/i, "");
}

/** Gateway origin without the API version, e.g. https://gateway-respira.dev.localhost:7283 */
export const GATEWAY_ORIGIN = normalizeGatewayOrigin(RAW_GATEWAY_URL);

/** API version taken from the environment, without surrounding slashes. */
export const API_VERSION =
	(process.env.NEXT_PUBLIC_API_VERSION ?? "v1").replace(/^\/+|\/+$/g, "") || "v1";

/** Absolute backend API base used by server-side code. */
export const API_V1 = `${GATEWAY_ORIGIN}/api/${API_VERSION}`;

/** Same-origin proxy used by browser code so tokens never leave the server session. */
export const CLIENT_API_BASE = "/api/backend";
