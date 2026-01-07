/**
 * API Configuration
 * Centralized API endpoints and configuration
 * All API-related constants are defined here to avoid hardcoding across the app
 */

export const API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    API_VERSION: '/api/v1',

    ENDPOINTS: {
        AUTH: {
            LOGIN: '/api/v1/auth/login',
            REGISTER: '/api/v1/auth/register',
            REFRESH: '/api/v1/auth/refresh',
            LOGOUT: '/api/v1/auth/logout',
        },
        USER: {
            PROFILE: '/api/v1/users/profile',
            ACTIVITY: '/api/v1/users/activity',
            STATS: '/api/v1/users/stats',
            UPDATE_PASSWORD: '/api/v1/users/password',
        },
        ADMIN: {
            USERS: '/api/v1/admin/users',
            USER_BY_ID: (userId: string | number) => `/api/v1/admin/users/${userId}`,
            USER_ROLE: (userId: string | number) => `/api/v1/admin/users/${userId}/role`,
            USERS_EXPORT: '/api/v1/admin/users/export',
            USERS_IMPORT: '/api/v1/admin/users/import',
        },
    },

    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
} as const

/**
 * Get full URL for an endpoint
 * @param endpoint - Endpoint path
 * @returns Full URL
 */
export function getFullUrl(endpoint: string): string {
    return `${API_CONFIG.BASE_URL}${endpoint}`
}
