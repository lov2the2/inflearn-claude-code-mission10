'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts'
import { useLoginTrend } from '@/lib/hooks/use-analytics'
import { TrendingUp } from 'lucide-react'

/**
 * Login Trend Chart Component
 * Displays last 7 days of login activity with trend indicator
 * Fetches real activity data from backend
 */
export function LoginTrendChart() {
    const { data, isLoading, error } = useLoginTrend()

    // Loading state
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Login Trend</CardTitle>
                    <CardDescription>Last 7 days activity</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">Loading chart data...</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Error or empty state
    if (error || !data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Login Trend</CardTitle>
                    <CardDescription>Last 7 days activity</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">
                            {data?.length === 0 ? 'No activity data yet' : 'Failed to load data'}
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Calculate trend (simple: compare last day to average)
    const last_day_logins = data[data.length - 1]?.logins || 0
    const average_logins = data.reduce((sum, d) => sum + d.logins, 0) / data.length
    const trend_percentage = Math.round(((last_day_logins - average_logins) / average_logins) * 100)

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Login Trend</CardTitle>
                        <CardDescription>Last 7 days activity</CardDescription>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span className={trend_percentage >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                            {trend_percentage >= 0 ? '+' : ''}{trend_percentage}%
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                        data={data}
                        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                        role="img"
                        aria-label="Login trend chart showing activity over the last 7 days"
                    >
                        <defs>
                            <linearGradient id="loginGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="display_date"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (!active || !payload || !payload.length) {
                                    return null
                                }
                                const data = payload[0].payload
                                return (
                                    <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                                        <p className="text-sm font-medium">{data.day_of_week}</p>
                                        <p className="text-xs text-muted-foreground mb-2">{data.display_date}</p>
                                        <p className="text-sm">
                                            <span className="font-semibold text-chart-1">{data.logins}</span>
                                            {' '}login{data.logins !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                )
                            }}
                            cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="logins"
                            stroke="hsl(var(--chart-1))"
                            fill="url(#loginGradient)"
                            strokeWidth={2}
                        />
                        <Line
                            type="monotone"
                            dataKey="logins"
                            stroke="hsl(var(--chart-1))"
                            strokeWidth={2}
                            dot={{ fill: 'hsl(var(--chart-1))', r: 4 }}
                            activeDot={{ r: 6, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
