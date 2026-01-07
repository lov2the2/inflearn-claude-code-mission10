'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsCard } from '@/components/dashboard/stats-card'
import { ActivityTable } from '@/components/dashboard/activity-table'
import { TableSkeleton } from '@/components/ui/table-skeleton'
import { use_user_profile } from '@/lib/hooks/queries/use-user-profile'
import { use_user_stats } from '@/lib/hooks/queries/use-user-stats'
import { use_user_activity } from '@/lib/hooks/queries/use-user-activity'
import { Activity, Calendar, LogIn, Zap } from 'lucide-react'

export default function DashboardPage() {
    const {
        data: profile,
        isLoading: profile_loading,
        isError: profile_error
    } = use_user_profile()

    const {
        data: stats,
        isLoading: stats_loading,
        isError: stats_error
    } = use_user_stats()

    const {
        data: activity_data,
        isLoading: activity_loading,
        isError: activity_error
    } = use_user_activity(1, 10)

    // Combine loading states
    const is_loading = profile_loading || stats_loading || activity_loading
    const has_error = profile_error || stats_error || activity_error

    const activity = activity_data?.data ?? []

    if (is_loading) {
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

    if (has_error) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back!</p>
                </div>
                <div className="p-4 text-sm text-red-600 bg-red-50 rounded-md">
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
