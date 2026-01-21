/**
 * User-related type definitions
 * Centralized types for user profiles, activities, and statistics
 */

export interface User {
    id: number
    email: string
    name: string
    role: string
}

export interface UserDetail extends User {
    created_at: string
    updated_at: string
}

export interface UserProfile {
    id: number
    email: string
    name: string
    role: string
    created_at: string
}

export interface UserActivity {
    id: number
    action: string
    description: string
    timestamp: string
    ip_address: string
}

export interface UserStats {
    total_logins: number
    last_login_at: string
    account_age_in_days: number
    total_actions: number
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    limit: number
}

// Backend API response types for analytics
export interface LoginTrendData {
    date: string
    logins: number
}

export interface ActivityDistributionDataRaw {
    action: string
    count: number
}

export interface MonthlyStatsData {
    month: string
    logins: number
    actions: number
}
