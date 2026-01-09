export interface ApiResponse<T = any> {
    success: boolean
    data: T
    message?: string
}

export interface ApiError {
    success: false
    error: string
}

/**
 * Standard API error response structure
 */
export interface APIError {
    code: string
    message: string
}

/**
 * Standardized error codes across the application
 */
export type ErrorCode =
    | 'UNAUTHORIZED'
    | 'NOT_FOUND'
    | 'VALIDATION_ERROR'
    | 'INTERNAL_ERROR'
    | 'CONFLICT'
    | 'FORBIDDEN'
    | 'BAD_REQUEST'
    | 'NETWORK_ERROR'
    | 'TIMEOUT_ERROR'
