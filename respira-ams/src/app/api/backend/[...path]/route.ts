import { NextRequest, NextResponse } from "next/server";

// Cho phép chứng chỉ tự ký của ASP.NET Core Development trên local
if (process.env.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const BACKEND_BASE =
	process.env.BACKEND_API_URL?.replace(/\/+$/, "") ||
	"http://localhost:5016/api/v1";

export async function GET(
	request: NextRequest,
	context: { params: Promise<{ path: string[] }> }
) {
	const { path } = await context.params;
	const targetPath = path.join("/");
	const search = request.nextUrl.search;
	const targetUrl = `${BACKEND_BASE}/${targetPath}${search}`;

	try {
		const res = await fetch(targetUrl, {
			headers: {
				Accept: "application/json",
				...(request.headers.get("authorization")
					? { Authorization: request.headers.get("authorization")! }
					: {}),
			},
			cache: "no-store",
		});

		const contentType = res.headers.get("content-type") || "";
		if (contentType.includes("application/json")) {
			const data = await res.json();
			return NextResponse.json(data, { status: res.status });
		}

		const text = await res.text();
		return new NextResponse(text, {
			status: res.status,
			headers: { "Content-Type": contentType },
		});
	} catch (err) {
		console.error(`[API Proxy] Lỗi khi chuyển tiếp tới ${targetUrl}:`, err);
		return NextResponse.json(
			{
				statusCode: "GATEWAY_ERROR",
				error: { message: "Không thể kết nối tới Backend", details: String(err) },
			},
			{ status: 502 }
		);
	}
}
