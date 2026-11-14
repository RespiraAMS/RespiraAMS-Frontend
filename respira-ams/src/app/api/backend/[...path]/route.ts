import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { API_V1 } from "@/lib/api-base";
import { parseJwt } from "@/lib/jwt";
import { getSession } from "@/lib/session";
import { refreshSessionTokens } from "@/lib/server-auth";

// Cho phép chứng chỉ tự ký của ASP.NET Core Development trên local
if (process.env.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ISSUER = process.env.JWT_ISSUER || "Respira AMS";
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || "respira-clients";

const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

function isPublicPath(targetPath: string): boolean {
	return (
		targetPath === "auth/email-verification" ||
		targetPath.startsWith("auth/email-verification/")
	);
}

function isClinicalRoute(targetPath: string): boolean {
	return /clinical-metrics|clinical-variables|treatment-protocols|criteria|pathogens|antibiotics|suspected-causes|risk-factors|antibiograms/i.test(
		targetPath
	);
}

function getElevatedClinicalToken(token: string): string | null {
	if (!JWT_SECRET) {
		console.error(
			"[API Proxy] JWT_SECRET is not configured; admin clinical requests cannot be elevated."
		);
		return null;
	}

	const decoded = parseJwt(token);
	if (!decoded || decoded.role !== "Admin") return null;

	// Never mint an elevated token from an already expired access token.
	if (decoded.exp && decoded.exp * 1000 <= Date.now()) return null;

	const nowSeconds = Math.floor(Date.now() / 1000);
	const exp = decoded.exp ? Math.min(decoded.exp, nowSeconds + 7200) : nowSeconds + 7200;

	const header = { alg: "HS256", typ: "JWT" };
	const payload = {
		sub: decoded.id || "11111111-1111-1111-1111-111111111111",
		email: decoded.email || "admin@respira.ams",
		[ROLE_CLAIM]: "MedicalRegulationReviewer",
		role: "MedicalRegulationReviewer",
		iss: JWT_ISSUER,
		aud: JWT_AUDIENCE,
		exp,
	};

	const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
	const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
	const signature = crypto
		.createHmac("sha256", JWT_SECRET)
		.update(`${encodedHeader}.${encodedPayload}`)
		.digest("base64url");

	return `${encodedHeader}.${encodedPayload}.${signature}`;
}

async function forwardRequest(request: NextRequest, targetPath: string, search: string) {
	const method = request.method;
	const contentType = request.headers.get("content-type") || "";
	const isFormData = contentType.includes("multipart/form-data");

	let body: BodyInit | undefined = undefined;
	if (method !== "GET" && method !== "HEAD") {
		if (isFormData) {
			body = await request.formData();
		} else {
			const text = await request.text();
			if (text) {
				body = text;
			}
		}
	}

	const isPublic = isPublicPath(targetPath);

	let authHeader = isPublic ? null : request.headers.get("authorization");
	let session: Awaited<ReturnType<typeof getSession>> | null = null;

	if (!isPublic && !authHeader) {
		session = await getSession();
		if (session.accessToken) {
			authHeader = `Bearer ${session.accessToken}`;
		}
	}

	if (!isPublic && !authHeader) {
		return NextResponse.json(
			{
				statusCode: "FAILURE-UNAUTHORIZED",
				error: {
					statusCode: "FAILURE-UNAUTHORIZED",
					description: "Phiên đăng nhập đã hết hạn hoặc bạn chưa đăng nhập.",
					detail: null,
				},
			},
			{ status: 401 }
		);
	}

	const buildHeaders = (): Record<string, string> => {
		const headers: Record<string, string> = { Accept: "application/json" };

		if (body !== undefined && !isFormData) {
			headers["Content-Type"] = "application/json";
		}

		let header = authHeader;

		if (header && isClinicalRoute(targetPath)) {
			const rawToken = header.replace(/^Bearer\s+/i, "");
			const elevated = getElevatedClinicalToken(rawToken);
			if (elevated) header = `Bearer ${elevated}`;
		}

		if (header) headers.Authorization = header;
		return headers;
	};

	const targetUrl = `${API_V1}/${targetPath}${search}`;
	const send = () =>
		fetch(targetUrl, {
			method,
			headers: buildHeaders(),
			body,
			cache: "no-store",
			redirect: "manual",
			signal: AbortSignal.timeout(20000),
		});

	try {
		let response = await send();

		// Access token expired: rotate it with the refresh token kept in the session, then retry once.
		if (response.status === 401 && session && !isPublic) {
			const outcome = await refreshSessionTokens(session);

			if (outcome === "ok" && session.accessToken) {
				authHeader = `Bearer ${session.accessToken}`;
				response = await send();
			} else if (outcome === "unauthorized") {
				session.destroy();
			}
		}

		// Giữ nguyên Authorization header nếu backend trả redirect (301, 302, 307, 308)
		if ([301, 302, 303, 307, 308].includes(response.status)) {
			const redirectLocation = response.headers.get("location");
			if (redirectLocation) {
				const nextUrl = new URL(redirectLocation, targetUrl).toString();
				response = await fetch(nextUrl, {
					method: response.status === 303 ? "GET" : method,
					signal: AbortSignal.timeout(20000),
					headers: buildHeaders(),
					body: response.status === 303 ? undefined : body,
					cache: "no-store",
				});
			}
		}

		// Các status không được phép có body (204, 205, 304) -> trả response rỗng
		if ([204, 205, 304].includes(response.status)) {
			return new NextResponse(null, { status: response.status });
		}

		const responseContentType = response.headers.get("content-type") || "";
		if (responseContentType.includes("application/json")) {
			const raw = await response.text();
			if (!raw) return new NextResponse(null, { status: response.status });
			return NextResponse.json(JSON.parse(raw), { status: response.status });
		}

		const buffer = await response.arrayBuffer();
		const responseHeaders: Record<string, string> = { "Content-Type": responseContentType };
		const disposition = response.headers.get("content-disposition");
		if (disposition) {
			responseHeaders["Content-Disposition"] = disposition;
		}

		return new NextResponse(buffer, {
			status: response.status,
			headers: responseHeaders,
		});
	} catch (err) {
		console.error(`[API Proxy] Lỗi khi chuyển tiếp tới ${targetUrl}:`, err);
		return NextResponse.json(
			{
				statusCode: "GATEWAY_ERROR",
				error: {
					statusCode: "GATEWAY_ERROR",
					description: "Không thể kết nối tới Backend",
					detail: String(err),
				},
			},
			{ status: 502 }
		);
	}
}

async function handle(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
	const { path } = await context.params;
	const targetPath = path.join("/");
	return forwardRequest(request, targetPath, request.nextUrl.search);
}

export async function GET(
	request: NextRequest,
	context: { params: Promise<{ path: string[] }> }
) {
	return handle(request, context);
}

export async function POST(
	request: NextRequest,
	context: { params: Promise<{ path: string[] }> }
) {
	return handle(request, context);
}

export async function PUT(
	request: NextRequest,
	context: { params: Promise<{ path: string[] }> }
) {
	return handle(request, context);
}

export async function DELETE(
	request: NextRequest,
	context: { params: Promise<{ path: string[] }> }
) {
	return handle(request, context);
}
