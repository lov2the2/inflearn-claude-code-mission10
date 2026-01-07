'use client'

import { LoginTrendChart } from './login-trend-chart'
import { ActivityDistributionChart } from './activity-distribution-chart'
import { MonthlyStatsChart } from './monthly-stats-chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Suspense } from 'react'

/**
 * Analytics Section Container
 * Orchestrates all dashboard analytics charts with consistent layout
 * Manages loading states with Suspense boundaries
 */
export function AnalyticsSection() {
    return (
        <div className="space-y-6">
            {/* Top Row: Login Trend + Activity Distribution */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Suspense fallback={<ChartSkeleton />}>
                    <LoginTrendChart />
                </Suspense>
                <Suspense fallback={<ChartSkeleton />}>
                    <ActivityDistributionChart />
                </Suspense>
            </div>

            {/* Bottom Row: Monthly Stats (full width) */}
            <Suspense fallback={<ChartSkeleton height="h-[450px]" />}>
                <MonthlyStatsChart />
            </Suspense>
        </div>
    )
}

/**
 * Loading skeleton for chart cards
 * Matches chart card structure for smooth loading experience
 */
function ChartSkeleton({ height = "h-[400px]" }: { height?: string }) {
    return (
        <div className={`bg-card rounded-xl border p-6 ${height}`}>
            <div className="space-y-2 mb-6">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-full w-full" />
        </div>
    )
}
