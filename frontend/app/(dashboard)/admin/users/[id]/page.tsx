'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Mail, User, Shield, Calendar, Clock } from 'lucide-react'
import { adminApi } from '@/lib/api/admin'
import { query_keys } from '@/lib/query/keys'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

interface UserDetailPageProps {
    params: Promise<{ id: string }>
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
    const router = useRouter()
    const { id } = use(params)
    const user_id = parseInt(id)

    const { data: user, isLoading, error } = useQuery({
        queryKey: query_keys.admin.users.detail(user_id),
        queryFn: () => adminApi.getUser(user_id),
        enabled: !isNaN(user_id),
    })

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Users
                </Button>
                <Card>
                    <CardHeader>
                        <div className="h-8 w-48 animate-pulse bg-gray-200 rounded" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-16 animate-pulse bg-gray-100 rounded" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error || !user) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Users
                </Button>
                <Card>
                    <CardContent className="py-8">
                        <p className="text-center text-gray-500">User not found</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Users
            </Button>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl">User Details</CardTitle>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role.toUpperCase()}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Email */}
                        <div className="flex items-start space-x-3">
                            <div className="rounded-lg bg-blue-50 p-2">
                                <Mail className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500">Email</p>
                                <p className="mt-1 text-base font-medium">{user.email}</p>
                            </div>
                        </div>

                        {/* Name */}
                        <div className="flex items-start space-x-3">
                            <div className="rounded-lg bg-green-50 p-2">
                                <User className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500">Name</p>
                                <p className="mt-1 text-base font-medium">{user.name}</p>
                            </div>
                        </div>

                        {/* Role */}
                        <div className="flex items-start space-x-3">
                            <div className="rounded-lg bg-purple-50 p-2">
                                <Shield className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500">Role</p>
                                <p className="mt-1 text-base font-medium capitalize">{user.role}</p>
                            </div>
                        </div>

                        {/* ID */}
                        <div className="flex items-start space-x-3">
                            <div className="rounded-lg bg-gray-50 p-2">
                                <span className="text-base font-bold text-gray-600">#</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500">User ID</p>
                                <p className="mt-1 text-base font-medium">{user.id}</p>
                            </div>
                        </div>

                        {/* Created At */}
                        <div className="flex items-start space-x-3">
                            <div className="rounded-lg bg-orange-50 p-2">
                                <Calendar className="h-5 w-5 text-orange-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500">Created At</p>
                                <p className="mt-1 text-base font-medium">
                                    {format(new Date(user.created_at), 'PPP')}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {format(new Date(user.created_at), 'p')}
                                </p>
                            </div>
                        </div>

                        {/* Updated At */}
                        <div className="flex items-start space-x-3">
                            <div className="rounded-lg bg-indigo-50 p-2">
                                <Clock className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-500">Updated At</p>
                                <p className="mt-1 text-base font-medium">
                                    {format(new Date(user.updated_at), 'PPP')}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {format(new Date(user.updated_at), 'p')}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
