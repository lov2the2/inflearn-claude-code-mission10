'use client'

import { useRouter } from 'next/navigation'
import { clearSession, getUser, getRefreshToken } from '@/lib/auth/session'
import { authApi } from '@/lib/api/auth'
import { isAdmin } from '@/lib/auth/role'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { User } from '@/types/auth'

export default function Navbar() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        setUser(getUser())
    }, [])

    const handleLogout = async () => {
        const refreshToken = getRefreshToken()

        if (refreshToken) {
            try {
                await authApi.logout(refreshToken)
            } catch (error) {
                console.error('Logout error:', error)
            }
        }

        clearSession()
        router.push('/login')
    }

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-8">
                        <h1 className="text-xl font-bold">Starter Kit</h1>
                        <div className="hidden md:flex space-x-4">
                            <a
                                href="/dashboard"
                                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Dashboard
                            </a>
                            {user && isAdmin(user) && (
                                <a
                                    href="/admin/users"
                                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Admin
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {user && (
                            <div className="text-sm text-gray-700">
                                <span className="font-medium">{user.name}</span>
                                <span className="text-gray-500 ml-2">({user.role})</span>
                            </div>
                        )}
                        <Button onClick={handleLogout} variant="outline" size="sm">
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    )
}
