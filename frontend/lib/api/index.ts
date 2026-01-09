/**
 * API module exports
 * Centralized export point for API client and error handling utilities
 */

export { default as apiClient } from './client'
export {
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
} from './errors'
