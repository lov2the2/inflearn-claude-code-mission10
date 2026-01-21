'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/dashboard/stats-card'
import { ActivityTable } from '@/components/dashboard/activity-table'
import { AnalyticsSection } from '@/components/dashboard/analytics-section'
import { TableSkeleton } from '@/components/ui/table-skeleton'
import { useUserProfile } from '@/lib/hooks/queries/use-user-profile'
import { useUserStats } from '@/lib/hooks/queries/use-user-stats'
import { useUserActivity } from '@/lib/hooks/queries/use-user-activity'
import { Activity, Calendar, LogIn, Zap } from 'lucide-react'

export default function DashboardPage() {
    const {
        data: profile,
        isLoading: profileLoading,
        isError: profileError
    } = useUserProfile()

    const {
        data: stats,
        isLoading: statsLoading,
        isError: statsError
    } = useUserStats()

    const {
        data: activityData,
        isLoading: activityLoading,
        isError: activityError
    } = useUserActivity(1, 10)

    // Combine loading states
    const isLoading = profileLoading || statsLoading || activityLoading
    const hasError = profileError || statsError || activityError

    const activity = activityData?.data ?? []

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div>
                    <div className="h-9 w-64 bg-muted animate-pulse rounded-lg mb-2" />
                    <div className="h-5 w-48 bg-muted animate-pulse rounded-lg" />
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                    ))}
                </div>

                <div className="h-64 bg-muted animate-pulse rounded-lg" />

                <TableSkeleton rows={5} columns={4} />
            </div>
        )
    }

    if (hasError) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back!</p>
                </div>
                <div className="p-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 rounded-md">
                    Failed to load dashboard data. Please try again later.
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome back, {profile?.name}!</h1>
                <p className="text-muted-foreground">Here's what's happening with your account.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Logins"
                    value={stats?.totalLogins ?? 0}
                    icon={LogIn}
                    description="All-time logins"
                />
                <StatsCard
                    title="Account Age"
                    value={`${stats?.accountAgeInDays ?? 0} days`}
                    icon={Calendar}
                    description="Since registration"
                />
                <StatsCard
                    title="Total Actions"
                    value={stats?.totalActions ?? 0}
                    icon={Zap}
                    description="Activities performed"
                />
                <StatsCard
                    title="Last Login"
                    value={stats?.lastLoginAt ? new Date(stats.lastLoginAt).toLocaleDateString() : 'N/A'}
                    icon={Activity}
                    description="Most recent access"
                />
            </div>

            {/* Analytics Section */}
            <AnalyticsSection />

            {/* Profile Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm font-medium">Email:</span>
                        <span className="text-sm text-muted-foreground">{profile?.email}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm font-medium">Name:</span>
                        <span className="text-sm text-muted-foreground">{profile?.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm font-medium">Role:</span>
                        <span className="text-sm text-muted-foreground capitalize">{profile?.role}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm font-medium">Member Since:</span>
                        <span className="text-sm text-muted-foreground">
                            {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Activity Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest account actions and events</CardDescription>
                </CardHeader>
                <CardContent>
                    <ActivityTable data={activity} />
                </CardContent>
            </Card>
        </div>
    )
}
