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
    createdAt: string
    updatedAt: string
}

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
