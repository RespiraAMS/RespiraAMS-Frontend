// Đảm bảo Node.js trên server chấp nhận chứng chỉ self-signed của ASP.NET Core dev
if (typeof window === "undefined" && process.env.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

/**
 * API configuration for Respira AMS frontend.
 * - Ở Client (Browser): Dùng proxy cùng domain '/api/backend' để load siêu tốc,
 *   loại bỏ hoàn toàn lỗi CORS và lỗi chứng chỉ SSL tự ký của ASP.NET Core.
 * - Ở Server (Next.js SSR/RSC): Gọi thẳng Backend Gateway hoặc Clinical Service.
 */
export const API_BASE_URL =
	typeof window !== "undefined"
		? "/api/backend"
		: process.env.BACKEND_API_URL?.replace(/\/+$/, "") ||
		  "http://localhost:5016/api/v1";
