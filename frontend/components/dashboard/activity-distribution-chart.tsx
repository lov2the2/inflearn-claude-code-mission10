'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { useActivityDistribution } from '@/lib/hooks/use-analytics'

/**
 * Activity Distribution Chart Component
 * Displays breakdown of activity types as a donut chart
 * Fetches real activity data from backend
 */
export function ActivityDistributionChart() {
    const { data, isLoading, error } = useActivityDistribution()

    // Loading state
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Activity Distribution</CardTitle>
                    <CardDescription>Breakdown by action type</CardDescription>
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
                    <CardTitle>Activity Distribution</CardTitle>
                    <CardDescription>Breakdown by action type</CardDescription>
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

    // Custom legend renderer for better mobile layout
    const render_legend = (props: any) => {
        const { payload } = props
        return (
            <ul className="flex flex-wrap gap-3 justify-center mt-4">
                {payload.map((entry: any, index: number) => (
                    <li key={`legend-${index}`} className="flex items-center gap-2 text-sm">
                        <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-muted-foreground">
                            {entry.value}
                        </span>
                    </li>
                ))}
            </ul>
        )
    }

    // Custom label for pie slices (show percentage)
    const render_label = (entry: any) => {
        return `${entry.percentage}%`
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Activity Distribution</CardTitle>
                <CardDescription>Breakdown by action type</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart
                        role="img"
                        aria-label="Activity distribution pie chart showing breakdown by action type"
                    >
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={render_label}
                            outerRadius={90}
                            innerRadius={50} // Donut chart
                            fill="#8884d8"
                            dataKey="value"
                            paddingAngle={2}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    stroke="hsl(var(--background))"
                                    strokeWidth={2}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            content={({ active, payload }) => {
                                if (!active || !payload || !payload.length) {
                                    return null
                                }
                                const data = payload[0].payload
                                return (
                                    <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                                        <p className="text-sm font-medium">{data.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {data.value} action{data.value !== 1 ? 's' : ''}
                                            {' '}({data.percentage}%)
                                        </p>
                                    </div>
                                )
                            }}
                        />
                        <Legend
                            content={render_legend}
                            wrapperStyle={{ display: 'block' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
