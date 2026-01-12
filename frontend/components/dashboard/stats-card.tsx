import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCardProps } from '@/types'

/**
 * Displays a single statistic with icon and optional trend indicator
 * Used in dashboard to show KPIs and metrics
 *
 * @example
 * ```tsx
 * <StatsCard
 *   title="Total Logins"
 *   value={stats.totalLogins}
 *   icon={LogIn}
 *   description="All-time logins"
 * />
 * ```
 */
export function StatsCard({ title, value, icon: Icon, description, trend }: StatsCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
                {trend && (
                    <div
                        className={`flex items-center gap-1 text-xs mt-2 ${
                            trend.isPositive ? 'text-green-600' : 'text-red-600'
                        }`}
                    >
                        <span>{trend.isPositive ? '↑' : '↓'}</span>
                        <span>{Math.abs(trend.value)}%</span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
