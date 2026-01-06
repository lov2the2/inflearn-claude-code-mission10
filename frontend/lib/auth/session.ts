import { AuthResponse, User } from '@/types/auth'

/**
 * Safe JSON parser with error recovery
 * Prevents crashes from corrupted localStorage data
 * @param value - JSON string to parse
 * @param fallback - Default value if parsing fails
 * @returns Parsed object or fallback value
 */
function safeJsonParse<T>(value: string | null, fallback: T): T {
    if (!value) return fallback

    try {
        return JSON.parse(value) as T
    } catch (error) {
        console.error('Failed to parse JSON from localStorage:', error)
        return fallback
    }
}

/**
 * Set authentication session
 * Stores access token, refresh token, and user information
 * @param authResponse - Authentication response from API
 * @throws Error if localStorage is unavailable or quota exceeded
 */
export const setSession = (authResponse: AuthResponse): void => {
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem('access_token', authResponse.access_token)
            localStorage.setItem('refresh_token', authResponse.refresh_token)
            localStorage.setItem('user', JSON.stringify(authResponse.user))
        } catch (error) {
            console.error('Failed to save session:', error)
            throw new Error('Unable to save session. Please check browser storage settings.')
        }
    }
}

/**
 * Get access token from storage
 * @returns Access token or null if not found
 */
export const getAccessToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('access_token')
    }
    return null
}

/**
 * Get refresh token from storage
 * @returns Refresh token or null if not found
 */
export const getRefreshToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('refresh_token')
    }
    return null
}

/**
 * Get user information from storage
 * Uses safe JSON parsing to prevent crashes from corrupted data
 * @returns User object or null if not found or invalid
 */
export const getUser = (): User | null => {
    if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('user')
        return safeJsonParse<User | null>(userStr, null)
    }
    return null
}

/**
 * Clear authentication session
 * Removes all session-related data from storage
 */
export const clearSession = (): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
    }
}

/**
 * Check if user is authenticated
 * @returns True if access token exists, false otherwise
 */
export const isAuthenticated = (): boolean => {
    return getAccessToken() !== null
}
