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

/**
 * Updates current user's profile information
 * @param name - New name
 * @returns Updated user profile
 */
export async function updateUserProfile(name: string): Promise<UserProfile> {
    const response = await apiClient.patch<{ data: { profile: UserProfile } }>(
        API_CONFIG.ENDPOINTS.USER.PROFILE,
        { name }
    )
    return response.data.data.profile
}

/**
 * Changes current user's password
 * @param currentPassword - Current password for verification
 * @param newPassword - New password
 * @param confirmPassword - New password confirmation
 */
export async function updateUserPassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
): Promise<void> {
    await apiClient.patch(
        API_CONFIG.ENDPOINTS.USER.UPDATE_PASSWORD,
        {
            current_password: currentPassword,
            new_password: newPassword,
            confirm_password: confirmPassword
        }
    )
}

// ============================================================
// Analytics Chart Data Endpoints
// ============================================================

export interface LoginTrendData {
    date: string
    logins: number
}

export interface ActivityDistributionData {
    action: string
    count: number
}

export interface MonthlyStatsData {
    month: string
    logins: number
    actions: number
}

/**
 * Fetches login trend data for the last 7 days
 * @returns Array of daily login counts
 */
export async function getLoginTrend(): Promise<LoginTrendData[]> {
    const response = await apiClient.get<{ data: LoginTrendData[] }>(
        `${API_CONFIG.ENDPOINTS.USER.ACTIVITY}/login-trend`
    )
    return response.data.data
}

/**
 * Fetches activity distribution breakdown by action type
 * @returns Array of activity counts grouped by action
 */
export async function getActivityDistribution(): Promise<ActivityDistributionData[]> {
    const response = await apiClient.get<{ data: ActivityDistributionData[] }>(
        `${API_CONFIG.ENDPOINTS.USER.ACTIVITY}/distribution`
    )
    return response.data.data
}

/**
 * Fetches monthly statistics for the last 6 months
 * @returns Array of monthly aggregated statistics
 */
export async function getMonthlyStats(): Promise<MonthlyStatsData[]> {
    const response = await apiClient.get<{ data: MonthlyStatsData[] }>(
        `${API_CONFIG.ENDPOINTS.USER.ACTIVITY}/monthly-stats`
    )
    return response.data.data
}
