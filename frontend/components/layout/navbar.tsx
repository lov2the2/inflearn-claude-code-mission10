'use client'

import { useRouter } from 'next/navigation'
import { clearSession, getUser, getRefreshToken } from '@/lib/auth/session'
import { authApi } from '@/lib/api/auth'
import { isAdmin } from '@/lib/auth/role'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { useEffect, useState } from 'react'
import { User } from '@/types/auth'
import { Menu, LogOut, LayoutDashboard, Shield } from 'lucide-react'

export default function Navbar() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [open, setOpen] = useState(false)

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
        setOpen(false)
        router.push('/login')
    }

    const handleNavigation = (path: string) => {
        setOpen(false)
        router.push(path)
    }

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-8">
                        <h1 className="text-xl font-bold">Starter Kit</h1>

                        {/* Desktop Menu */}
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

                    {/* Desktop User Info & Logout */}
                    <div className="hidden md:flex items-center space-x-4">
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

                    {/* Mobile Menu */}
                    <div className="md:hidden">
                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                                <SheetHeader>
                                    <SheetTitle>Menu</SheetTitle>
                                    <SheetDescription>
                                        {user && (
                                            <span>
                                                {user.name} ({user.role})
                                            </span>
                                        )}
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="flex flex-col space-y-3 mt-8">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-lg"
                                        onClick={() => handleNavigation('/dashboard')}
                                    >
                                        <LayoutDashboard className="mr-2 h-5 w-5" />
                                        Dashboard
                                    </Button>
                                    {user && isAdmin(user) && (
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start text-lg"
                                            onClick={() => handleNavigation('/admin/users')}
                                        >
                                            <Shield className="mr-2 h-5 w-5" />
                                            Admin
                                        </Button>
                                    )}
                                    <div className="pt-4 border-t">
                                        <Button
                                            variant="destructive"
                                            className="w-full justify-start text-lg"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="mr-2 h-5 w-5" />
                                            Logout
                                        </Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    )
}
