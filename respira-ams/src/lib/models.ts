/**
 * API result format: all backend API will return in this format, except for request that is 204 (no body content)
 */
export interface ApiError {
    statusCode: string;
    description: string;
    detail: unknown | null;
}

export interface ApiResult<T> {
    statusCode: string;
    error: ApiError | null;
    data: T;
}

/**
 * Pagination metadata
 */
export interface PaginationMetadata {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    totalItemCount: number;
    pageCount: number;
    currentPage: number;
    pageSize: number;
}

/**
 * Pagination result
 */
export interface Pagination<T> {
    metadata: PaginationMetadata;
    items: T[];
}

/**
 * Pagination query parameters
 */
export interface PaginationParam {
    page: number;
    size: number;
}