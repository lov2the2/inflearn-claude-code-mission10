/**
 * Login trend data point (daily aggregation)
 * Used by: LoginTrendChart
 */
export interface LoginTrendDataPoint {
    date: string          // ISO date string "2026-01-01"
    display_date: string  // Display format "Jan 1"
    day_of_week: string   // "Monday", "Tuesday", etc.
    logins: number        // Number of logins (0-5)
}

/**
 * Activity distribution by type
 * Used by: ActivityDistributionChart
 */
export interface ActivityDistributionData {
    name: string          // "Login", "Profile Update", etc.
    value: number         // Count of activities
    percentage: number    // Calculated percentage (0-100)
    color: string         // Hex color for pie slice
}

/**
 * Monthly statistics aggregation
 * Used by: MonthlyStatsChart
 */
export interface MonthlyStatData {
    month: string         // "Dec 2025", "Jan 2026", etc.
    short_month: string   // "Dec", "Jan", etc. (for x-axis)
    logins: number        // Total logins in month
    actions: number       // Total actions in month
    active_users: number  // Unique active users (placeholder: 1)
}

/**
 * Color palette for charts (dark mode compatible)
 */
export const CHART_COLORS = {
    primary: 'hsl(var(--chart-1))',      // Blue
    secondary: 'hsl(var(--chart-2))',    // Teal
    success: 'hsl(var(--chart-3))',      // Green
    warning: 'hsl(var(--chart-4))',      // Yellow
    danger: 'hsl(var(--chart-5))',       // Orange
    muted: 'hsl(var(--muted-foreground))', // Gray
} as const

/**
 * Activity types and their assigned colors
 */
export const ACTIVITY_TYPES = {
    LOGIN: { label: 'Login', color: CHART_COLORS.primary },
    PROFILE_UPDATE: { label: 'Profile Update', color: CHART_COLORS.secondary },
    PASSWORD_CHANGE: { label: 'Password Change', color: CHART_COLORS.success },
    SETTINGS_CHANGE: { label: 'Settings Change', color: CHART_COLORS.warning },
    LOGOUT: { label: 'Logout', color: CHART_COLORS.danger },
    OTHER: { label: 'Other', color: CHART_COLORS.muted },
} as const
