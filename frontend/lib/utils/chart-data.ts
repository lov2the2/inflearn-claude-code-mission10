import {
    LoginTrendDataPoint,
    ActivityDistributionData,
    MonthlyStatData,
    ACTIVITY_TYPES
} from '@/types/analytics'
import { subDays, format, startOfDay } from 'date-fns'

/**
 * Generate mock login trend data for last 7 days
 * ⚠️ TEMPORARY: Will be replaced by real API in Phase 3.3
 * @returns Array of 7 data points (Monday - Sunday)
 */
export function generateLoginTrendData(): LoginTrendDataPoint[] {
    const today = startOfDay(new Date())
    const data: LoginTrendDataPoint[] = []

    // Generate data for last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i)
        const logins = Math.floor(Math.random() * 4) + 1 // 1-4 logins per day

        data.push({
            date: date.toISOString(),
            displayDate: format(date, 'MMM d'),
            dayOfWeek: format(date, 'EEEE'),
            logins,
        })
    }

    return data
}

/**
 * Generate mock activity distribution data
 * ⚠️ TEMPORARY: Will be replaced by real API in Phase 3.3
 * @returns Array of 5-6 activity types with counts
 */
export function generateActivityDistribution(): ActivityDistributionData[] {
    const activityCounts = {
        LOGIN: Math.floor(Math.random() * 20) + 10,           // 10-30
        PROFILE_UPDATE: Math.floor(Math.random() * 10) + 2,   // 2-12
        PASSWORD_CHANGE: Math.floor(Math.random() * 5) + 1,   // 1-6
        SETTINGS_CHANGE: Math.floor(Math.random() * 8) + 3,   // 3-11
        LOGOUT: Math.floor(Math.random() * 15) + 5,           // 5-20
        OTHER: Math.floor(Math.random() * 5),                 // 0-5
    }

    const total = Object.values(activityCounts).reduce((sum, val) => sum + val, 0)

    return Object.entries(activityCounts)
        .filter(([_, count]) => count > 0) // Exclude zero counts
        .map(([key, value]) => ({
            name: ACTIVITY_TYPES[key as keyof typeof ACTIVITY_TYPES].label,
            value,
            percentage: Math.round((value / total) * 100),
            color: ACTIVITY_TYPES[key as keyof typeof ACTIVITY_TYPES].color,
        }))
}

/**
 * Generate mock monthly statistics for last 6 months
 * ⚠️ TEMPORARY: Will be replaced by real API in Phase 3.3
 * @returns Array of 6 monthly data points
 */
export function generateMonthlyStats(): MonthlyStatData[] {
    const today = new Date()
    const data: MonthlyStatData[] = []

    for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1)

        data.push({
            month: format(monthDate, 'MMM yyyy'),
            shortMonth: format(monthDate, 'MMM'),
            logins: Math.floor(Math.random() * 50) + 20,      // 20-70
            actions: Math.floor(Math.random() * 100) + 50,    // 50-150
            activeUsers: 1, // Placeholder (single user)
        })
    }

    return data
}
