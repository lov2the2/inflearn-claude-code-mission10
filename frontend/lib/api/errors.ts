import axios, { AxiosError } from 'axios'
import type { APIError, ErrorCode } from '@/types/api'

/**
 * Type guard to check if error is an API error with structured response
 */
export function isAPIError(error: unknown): error is AxiosError<APIError> {
    return (
        axios.isAxiosError(error) &&
        error.response?.data !== undefined &&
        typeof error.response.data === 'object' &&
        'code' in error.response.data
    )
}

/**
 * Convert various error types to user-friendly Korean messages
 * @param error - Unknown error object
 * @returns User-friendly error message in Korean
 */
export function handleAPIError(error: unknown): string {
    // Handle network errors (no response from server)
    if (axios.isAxiosError(error)) {
        // No response received (network error, timeout, etc.)
        if (!error.response) {
            if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
                return '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.'
            }
            return '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.'
        }

        // Check if response has structured error format
        const apiError = error.response.data as APIError

        if (apiError?.code) {
            // Map error codes to Korean messages
            switch (apiError.code) {
                case 'UNAUTHORIZED':
                    return '세션이 만료되었습니다. 다시 로그인해주세요.'

                case 'NOT_FOUND':
                    return apiError.message || '요청한 리소스를 찾을 수 없습니다.'

                case 'VALIDATION_ERROR':
                    return apiError.message || '입력값을 확인해주세요.'

                case 'FORBIDDEN':
                    return '접근 권한이 없습니다.'

                case 'CONFLICT':
                    return apiError.message || '이미 존재하는 데이터입니다.'

                case 'BAD_REQUEST':
                    return apiError.message || '잘못된 요청입니다.'

                case 'INTERNAL_ERROR':
                    return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'

                default:
                    return apiError.message || '알 수 없는 오류가 발생했습니다.'
            }
        }

        // Fallback to response data message if available
        if (apiError?.message) {
            return apiError.message
        }

        // HTTP status-based messages
        switch (error.response.status) {
            case 400:
                return '잘못된 요청입니다. 입력값을 확인해주세요.'
            case 401:
                return '인증이 필요합니다. 다시 로그인해주세요.'
            case 403:
                return '접근 권한이 없습니다.'
            case 404:
                return '요청한 리소스를 찾을 수 없습니다.'
            case 409:
                return '데이터 충돌이 발생했습니다.'
            case 500:
                return '서버 오류가 발생했습니다.'
            case 502:
                return '게이트웨이 오류가 발생했습니다.'
            case 503:
                return '서비스를 일시적으로 사용할 수 없습니다.'
            default:
                return `서버 오류가 발생했습니다. (HTTP ${error.response.status})`
        }
    }

    // Non-Axios errors
    if (error instanceof Error) {
        return error.message
    }

    return '알 수 없는 오류가 발생했습니다.'
}

/**
 * Extract error code from error object
 * @param error - Unknown error object
 * @returns Error code or null if not found
 */
export function getErrorCode(error: unknown): ErrorCode | null {
    if (isAPIError(error) && error.response?.data?.code) {
        return error.response.data.code as ErrorCode
    }
    return null
}

/**
 * Check if error is a specific error code
 * @param error - Unknown error object
 * @param code - Error code to check
 * @returns True if error matches the code
 */
export function isErrorCode(error: unknown, code: ErrorCode): boolean {
    return getErrorCode(error) === code
}

/**
 * Get HTTP status code from error
 * @param error - Unknown error object
 * @returns HTTP status code or null
 */
export function getStatusCode(error: unknown): number | null {
    if (axios.isAxiosError(error)) {
        return error.response?.status || null
    }
    return null
}

/**
 * Check if error is a validation error (400 or VALIDATION_ERROR code)
 * @param error - Unknown error object
 * @returns True if validation error
 */
export function isValidationError(error: unknown): boolean {
    const code = getErrorCode(error)
    const status = getStatusCode(error)
    return code === 'VALIDATION_ERROR' || status === 400
}

/**
 * Check if error is an authentication error (401 or UNAUTHORIZED code)
 * @param error - Unknown error object
 * @returns True if authentication error
 */
export function isAuthError(error: unknown): boolean {
    const code = getErrorCode(error)
    const status = getStatusCode(error)
    return code === 'UNAUTHORIZED' || status === 401
}

/**
 * Check if error is an authorization error (403 or FORBIDDEN code)
 * @param error - Unknown error object
 * @returns True if authorization error
 */
export function isForbiddenError(error: unknown): boolean {
    const code = getErrorCode(error)
    const status = getStatusCode(error)
    return code === 'FORBIDDEN' || status === 403
}

/**
 * Check if error is a network error (no response)
 * @param error - Unknown error object
 * @returns True if network error
 */
export function isNetworkError(error: unknown): boolean {
    if (axios.isAxiosError(error)) {
        return !error.response
    }
    return false
}

/**
 * Extract validation error messages for form fields
 * Useful for displaying field-specific errors in forms
 * @param error - Unknown error object
 * @returns Object mapping field names to error messages
 */
export function extractValidationErrors(
    error: unknown
): Record<string, string> | null {
    if (isAPIError(error) && error.response?.data) {
        const data = error.response.data as any
        if (data.errors && typeof data.errors === 'object') {
            return data.errors
        }
    }
    return null
}
