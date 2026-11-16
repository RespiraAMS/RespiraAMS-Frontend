"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: Infinity, // Đã load rồi thì lưu cache, không tự fetch lại
                        gcTime: 1000 * 60 * 60, // Lưu trong bộ nhớ cache 1 giờ
                        refetchOnWindowFocus: false, // Không fetch lại khi chuyển tab
                        refetchOnMount: false, // Khi chuyển trang quay lại không fetch lại nếu đã có cache
                        refetchOnReconnect: false,
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
