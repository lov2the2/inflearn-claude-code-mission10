import { AxiosError } from 'axios'
import {
    isAPIError,
    handleAPIError,
    getErrorCode,
    isErrorCode,
    getStatusCode,
    isValidationError,
    isAuthError,
    isForbiddenError,
    isNetworkError,
    extractValidationErrors,
} from '../errors'

// Helper function to create mock AxiosError
function createAxiosError(
    status: number,
    data: any,
    code?: string
): AxiosError {
    return {
        isAxiosError: true,
        response: {
            status,
            data,
            statusText: 'Error',
            headers: {},
            config: {} as any,
        },
        message: 'Request failed',
        name: 'AxiosError',
        config: {} as any,
        code,
        toJSON: () => ({}),
    } as AxiosError
}

describe('Error Handling Utilities', () => {
    describe('isAPIError', () => {
        it('should return true for valid API error', () => {
            const error = createAxiosError(400, {
                code: 'VALIDATION_ERROR',
                message: 'Invalid input',
            })
            expect(isAPIError(error)).toBe(true)
        })

        it('should return false for non-axios error', () => {
            const error = new Error('Regular error')
            expect(isAPIError(error)).toBe(false)
        })

        it('should return false for axios error without code', () => {
            const error = createAxiosError(500, { message: 'Server error' })
            expect(isAPIError(error)).toBe(false)
        })
    })

    describe('handleAPIError', () => {
        it('should handle UNAUTHORIZED error', () => {
            const error = createAxiosError(401, {
                code: 'UNAUTHORIZED',
                message: 'Token expired',
            })
            expect(handleAPIError(error)).toBe(
                '세션이 만료되었습니다. 다시 로그인해주세요.'
            )
        })

        it('should handle VALIDATION_ERROR', () => {
            const error = createAxiosError(400, {
                code: 'VALIDATION_ERROR',
                message: 'Email is required',
            })
            expect(handleAPIError(error)).toBe('Email is required')
        })

        it('should handle NOT_FOUND error', () => {
            const error = createAxiosError(404, {
                code: 'NOT_FOUND',
                message: 'User not found',
            })
            expect(handleAPIError(error)).toBe('User not found')
        })

        it('should handle FORBIDDEN error', () => {
            const error = createAxiosError(403, {
                code: 'FORBIDDEN',
                message: 'Access denied',
            })
            expect(handleAPIError(error)).toBe('접근 권한이 없습니다.')
        })

        it('should handle CONFLICT error', () => {
            const error = createAxiosError(409, {
                code: 'CONFLICT',
                message: 'Email already exists',
            })
            expect(handleAPIError(error)).toBe('Email already exists')
        })

        it('should handle INTERNAL_ERROR', () => {
            const error = createAxiosError(500, {
                code: 'INTERNAL_ERROR',
                message: 'Database connection failed',
            })
            expect(handleAPIError(error)).toBe(
                '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
            )
        })

        it('should handle network error (no response)', () => {
            const error = {
                isAxiosError: true,
                message: 'Network Error',
                name: 'AxiosError',
                config: {} as any,
                toJSON: () => ({}),
            } as AxiosError
            expect(handleAPIError(error)).toBe(
                '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.'
            )
        })

        it('should handle timeout error', () => {
            const error = {
                isAxiosError: true,
                message: 'Timeout',
                name: 'AxiosError',
                code: 'ECONNABORTED',
                config: {} as any,
                toJSON: () => ({}),
            } as AxiosError
            expect(handleAPIError(error)).toBe(
                '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.'
            )
        })

        it('should handle HTTP status without error code', () => {
            const error = createAxiosError(400, {
                message: 'Bad request',
            })
            expect(handleAPIError(error)).toBe('Bad request')
        })

        it('should handle generic Error', () => {
            const error = new Error('Custom error message')
            expect(handleAPIError(error)).toBe('Custom error message')
        })

        it('should handle unknown error', () => {
            const error = 'string error'
            expect(handleAPIError(error)).toBe(
                '알 수 없는 오류가 발생했습니다.'
            )
        })
    })

    describe('getErrorCode', () => {
        it('should extract error code from API error', () => {
            const error = createAxiosError(400, {
                code: 'VALIDATION_ERROR',
                message: 'Invalid input',
            })
            expect(getErrorCode(error)).toBe('VALIDATION_ERROR')
        })

        it('should return null for non-API error', () => {
            const error = new Error('Regular error')
            expect(getErrorCode(error)).toBeNull()
        })
    })

    describe('isErrorCode', () => {
        it('should return true when error matches code', () => {
            const error = createAxiosError(403, {
                code: 'FORBIDDEN',
                message: 'Access denied',
            })
            expect(isErrorCode(error, 'FORBIDDEN')).toBe(true)
        })

        it('should return false when error does not match code', () => {
            const error = createAxiosError(403, {
                code: 'FORBIDDEN',
                message: 'Access denied',
            })
            expect(isErrorCode(error, 'UNAUTHORIZED')).toBe(false)
        })
    })

    describe('getStatusCode', () => {
        it('should extract HTTP status code', () => {
            const error = createAxiosError(404, {
                code: 'NOT_FOUND',
                message: 'Resource not found',
            })
            expect(getStatusCode(error)).toBe(404)
        })

        it('should return null for non-axios error', () => {
            const error = new Error('Regular error')
            expect(getStatusCode(error)).toBeNull()
        })
    })

    describe('isValidationError', () => {
        it('should return true for VALIDATION_ERROR code', () => {
            const error = createAxiosError(400, {
                code: 'VALIDATION_ERROR',
                message: 'Invalid input',
            })
            expect(isValidationError(error)).toBe(true)
        })

        it('should return true for 400 status', () => {
            const error = createAxiosError(400, {
                message: 'Bad request',
            })
            expect(isValidationError(error)).toBe(true)
        })

        it('should return false for non-validation error', () => {
            const error = createAxiosError(500, {
                code: 'INTERNAL_ERROR',
                message: 'Server error',
            })
            expect(isValidationError(error)).toBe(false)
        })
    })

    describe('isAuthError', () => {
        it('should return true for UNAUTHORIZED code', () => {
            const error = createAxiosError(401, {
                code: 'UNAUTHORIZED',
                message: 'Token expired',
            })
            expect(isAuthError(error)).toBe(true)
        })

        it('should return true for 401 status', () => {
            const error = createAxiosError(401, {
                message: 'Unauthorized',
            })
            expect(isAuthError(error)).toBe(true)
        })

        it('should return false for non-auth error', () => {
            const error = createAxiosError(403, {
                code: 'FORBIDDEN',
                message: 'Access denied',
            })
            expect(isAuthError(error)).toBe(false)
        })
    })

    describe('isForbiddenError', () => {
        it('should return true for FORBIDDEN code', () => {
            const error = createAxiosError(403, {
                code: 'FORBIDDEN',
                message: 'Access denied',
            })
            expect(isForbiddenError(error)).toBe(true)
        })

        it('should return true for 403 status', () => {
            const error = createAxiosError(403, {
                message: 'Forbidden',
            })
            expect(isForbiddenError(error)).toBe(true)
        })

        it('should return false for non-forbidden error', () => {
            const error = createAxiosError(401, {
                code: 'UNAUTHORIZED',
                message: 'Unauthorized',
            })
            expect(isForbiddenError(error)).toBe(false)
        })
    })

    describe('isNetworkError', () => {
        it('should return true for error without response', () => {
            const error = {
                isAxiosError: true,
                message: 'Network Error',
                name: 'AxiosError',
                config: {} as any,
                toJSON: () => ({}),
            } as AxiosError
            expect(isNetworkError(error)).toBe(true)
        })

        it('should return false for error with response', () => {
            const error = createAxiosError(500, {
                code: 'INTERNAL_ERROR',
                message: 'Server error',
            })
            expect(isNetworkError(error)).toBe(false)
        })

        it('should return false for non-axios error', () => {
            const error = new Error('Regular error')
            expect(isNetworkError(error)).toBe(false)
        })
    })

    describe('extractValidationErrors', () => {
        it('should extract validation errors object', () => {
            const error = createAxiosError(400, {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                errors: {
                    email: 'Email is required',
                    password: 'Password must be at least 8 characters',
                },
            })
            const validationErrors = extractValidationErrors(error)
            expect(validationErrors).toEqual({
                email: 'Email is required',
                password: 'Password must be at least 8 characters',
            })
        })

        it('should return null when no validation errors', () => {
            const error = createAxiosError(400, {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
            })
            expect(extractValidationErrors(error)).toBeNull()
        })

        it('should return null for non-API error', () => {
            const error = new Error('Regular error')
            expect(extractValidationErrors(error)).toBeNull()
        })
    })
})
