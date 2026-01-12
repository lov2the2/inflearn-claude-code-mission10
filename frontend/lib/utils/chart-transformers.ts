import { format, parseISO } from 'date-fns'
import { ACTIVITY_TYPES } from '@/types/analytics'
import type {
    LoginTrendDataPoint,
    ActivityDistributionData as FrontendDistribution,
    MonthlyStatData,
    LoginTrendData,
    ActivityDistributionDataRaw as BackendDistribution,
    MonthlyStatsData
} from '@/types'

/**
 * Transform backend login trend data to frontend chart format
 */
export function transform_login_trend(data: LoginTrendData[]): LoginTrendDataPoint[] {
    return data.map(item => ({
        date: item.date,
        display_date: format(parseISO(item.date), 'MMM d'),
        day_of_week: format(parseISO(item.date), 'EEEE'),
        logins: item.logins
    }))
}

/**
 * Transform backend activity distribution to frontend chart format
 * Maps backend action types to frontend categories
 */
export function transform_activity_distribution(data: BackendDistribution[]): FrontendDistribution[] {
    // Map backend actions to frontend types
    const action_type_map: Record<string, keyof typeof ACTIVITY_TYPES> = {
        'login': 'LOGIN',
        'token_refresh': 'LOGIN',
        'profile_update': 'PROFILE_UPDATE',
        'password_change': 'PASSWORD_CHANGE',
        'user_role_update': 'SETTINGS_CHANGE',
        'profile_view': 'SETTINGS_CHANGE',
        'logout': 'LOGOUT',
        'register': 'OTHER',
        'user_create': 'OTHER',
        'user_delete': 'OTHER',
        'csv_import': 'OTHER',
        'csv_export': 'OTHER',
    }

    // Aggregate by frontend type
    const aggregated: Record<string, number> = {}
    data.forEach(item => {
        const type = action_type_map[item.action] || 'OTHER'
        aggregated[type] = (aggregated[type] || 0) + item.count
    })

    // Calculate total and percentages
    const total = Object.values(aggregated).reduce((sum, val) => sum + val, 0)

    if (total === 0) {
        return []
    }

    return Object.entries(aggregated).map(([key, value]) => ({
        name: ACTIVITY_TYPES[key as keyof typeof ACTIVITY_TYPES].label,
        value,
        percentage: Math.round((value / total) * 100),
        color: ACTIVITY_TYPES[key as keyof typeof ACTIVITY_TYPES].color,
    }))
}

/**
 * Transform backend monthly stats to frontend chart format
 */
export function transform_monthly_stats(data: MonthlyStatsData[]): MonthlyStatData[] {
    return data.map(item => {
        const date = new Date(item.month + '-01')
        return {
            month: format(date, 'MMM yyyy'),
            short_month: format(date, 'MMM'),
            logins: item.logins,
            actions: item.actions,
            active_users: 1, // Single user context
        }
    })
}
