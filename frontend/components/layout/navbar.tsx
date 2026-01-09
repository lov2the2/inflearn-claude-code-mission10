'use client'

import { useRouter } from 'next/navigation'
import { clearSession, getUser } from '@/lib/auth/session'
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
import { Menu, LogOut, LayoutDashboard, Shield, UserCircle } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Navbar() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        setUser(getUser())
    }, [])

    const handleLogout = async () => {
        try {
            // Call backend logout to clear HttpOnly cookies
            await authApi.logout()
        } catch (error) {
            console.error('Logout error:', error)
            // Continue with client-side cleanup even if backend call fails
        }

        // Clear client-side user data
        clearSession()
        setOpen(false)
        router.push('/login')
    }

    const handleNavigation = (path: string) => {
        setOpen(false)
        router.push(path)
    }

    return (
        <nav className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-8">
                        <h1 className="text-xl font-bold dark:text-white">Starter Kit</h1>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex space-x-4">
                            <a
                                href="/dashboard"
                                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Dashboard
                            </a>
                            <a
                                href="/profile"
                                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Profile
                            </a>
                            {user && isAdmin(user) && (
                                <a
                                    href="/admin/users"
                                    className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Admin
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Desktop User Info & Logout */}
                    <div className="hidden md:flex items-center space-x-4">
                        <ThemeToggle />
                        {user && (
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                <span className="font-medium">{user.name}</span>
                                <span className="text-gray-500 dark:text-gray-400 ml-2">({user.role})</span>
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
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-lg"
                                        onClick={() => handleNavigation('/profile')}
                                    >
                                        <UserCircle className="mr-2 h-5 w-5" />
                                        Profile
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
                                    <div className="pt-4 border-t space-y-2">
                                        <div className="flex justify-between items-center px-4 py-2">
                                            <span className="text-sm font-medium">Theme</span>
                                            <ThemeToggle />
                                        </div>
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
