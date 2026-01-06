import apiClient from './client'
import { API_CONFIG } from '@/lib/config/api'

export interface UserProfile {
    id: number
    email: string
    name: string
    role: string
    createdAt: string
}

export interface UserActivity {
    id: number
    action: string
    description: string
    timestamp: string
    ipAddress: string
}

export interface UserStats {
    totalLogins: number
    lastLoginAt: string
    accountAgeInDays: number
    totalActions: number
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    limit: number
}

/**
 * Fetches current user's profile information
 * @returns User profile data
 */
export async function getUserProfile(): Promise<UserProfile> {
    const response = await apiClient.get<{ data: UserProfile }>(
        API_CONFIG.ENDPOINTS.USER.PROFILE
    )
    return response.data.data
}

/**
 * Fetches user activity logs with pagination
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @returns Paginated activity data
 */
export async function getUserActivity(
    page = 1,
    limit = 10
): Promise<PaginatedResponse<UserActivity>> {
    const response = await apiClient.get<{ data: PaginatedResponse<UserActivity> }>(
        API_CONFIG.ENDPOINTS.USER.ACTIVITY,
        {
            params: { page, limit }
        }
    )
    return response.data.data
}

/**
 * Fetches user statistics for dashboard
 * @returns User statistics
 */
export async function getUserStats(): Promise<UserStats> {
    const response = await apiClient.get<{ data: UserStats }>(
        API_CONFIG.ENDPOINTS.USER.STATS
    )
    return response.data.data
}
