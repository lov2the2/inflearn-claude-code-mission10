'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'
import { generate_monthly_stats } from '@/lib/utils/chart-data'
import { CHART_COLORS } from '@/types/analytics'

/**
 * Monthly Statistics Chart Component
 * Displays last 6 months of activity trends as stacked bar chart
 * Uses mock data until Phase 3.3 (real activity tracking)
 */
export function MonthlyStatsChart() {
    const data = generate_monthly_stats()

    return (
        <Card>
            <CardHeader>
                <CardTitle>Monthly Statistics</CardTitle>
                <CardDescription>Activity trends over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                        role="img"
                        aria-label="Monthly statistics bar chart showing trends over 6 months"
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="short_month"
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
                                    <div className="bg-card border border-border rounded-lg shadow-lg p-3 min-w-[180px]">
                                        <p className="text-sm font-medium mb-2">{data.month}</p>
                                        <div className="space-y-1 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Logins:</span>
                                                <span className="font-semibold">{data.logins}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Actions:</span>
                                                <span className="font-semibold">{data.actions}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Active Users:</span>
                                                <span className="font-semibold">{data.active_users}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }}
                            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.15 }}
                        />
                        <Legend
                            verticalAlign="top"
                            align="right"
                            iconType="circle"
                            wrapperStyle={{ paddingBottom: 10 }}
                            formatter={(value: string) => {
                                const labels: Record<string, string> = {
                                    logins: 'Logins',
                                    actions: 'Actions',
                                    active_users: 'Active Users',
                                }
                                return labels[value] || value
                            }}
                        />
                        <Bar
                            dataKey="logins"
                            stackId="a"
                            fill={CHART_COLORS.primary}
                            radius={[0, 0, 0, 0]}
                        />
                        <Bar
                            dataKey="actions"
                            stackId="a"
                            fill={CHART_COLORS.secondary}
                            radius={[0, 0, 0, 0]}
                        />
                        <Bar
                            dataKey="active_users"
                            stackId="a"
                            fill={CHART_COLORS.muted}
                            radius={[4, 4, 0, 0]} // Round top corners only
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
