'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser } from '@/lib/auth/session'
import { isAdmin } from '@/lib/auth/role'
import { User } from '@/types/auth'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const currentUser = getUser()

        if (!currentUser || !isAdmin(currentUser)) {
            router.push('/dashboard')
            return
        }

        setUser(currentUser)
        setLoading(false)
    }, [router])

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Admin Panel</h1>
                <p className="text-gray-600">Manage users and system settings</p>
            </div>
            {children}
        </div>
    )
}
