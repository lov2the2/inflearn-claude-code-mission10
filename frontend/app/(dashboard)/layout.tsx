'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth/session'
import Navbar from '@/components/layout/navbar'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login')
        }
    }, [router])

    if (!isAuthenticated()) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto py-8 px-4">
                {children}
            </main>
        </div>
    )
}
