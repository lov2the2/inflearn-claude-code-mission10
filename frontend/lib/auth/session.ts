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
 * Set user session data
 * With cookie-based auth, only stores non-sensitive user info (not tokens)
 * Tokens are managed by HttpOnly cookies on the backend
 * @param authResponse - Authentication response from API
 * @throws Error if localStorage is unavailable or quota exceeded
 */
export const setSession = (authResponse: AuthResponse): void => {
    if (typeof window !== 'undefined') {
        try {
            // Only store user information (no tokens - handled by HttpOnly cookies)
            localStorage.setItem('user', JSON.stringify(authResponse.user))
        } catch (error) {
            console.error('Failed to save session:', error)
            throw new Error('Unable to save session. Please check browser storage settings.')
        }
    }
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
 * Removes user data from localStorage
 * Note: HttpOnly cookies are cleared by backend logout endpoint
 */
export const clearSession = (): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('user')
    }
}

/**
 * Check if user is authenticated
 * With cookie-based auth, checks if user data exists in localStorage
 * Note: This is a client-side hint; actual auth is validated by backend via cookies
 * @returns True if user data exists, false otherwise
 */
export const isAuthenticated = (): boolean => {
    return getUser() !== null
}
