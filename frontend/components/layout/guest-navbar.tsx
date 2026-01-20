'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

export default function GuestNavbar() {
    const router = useRouter()
    const [open, setOpen] = useState(false)

    const handleNavigation = (path: string) => {
        setOpen(false)
        router.push(path)
    }

    return (
        <nav className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold text-white">
                            Starter Kit
                        </h1>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            className="text-gray-300 hover:text-white hover:bg-gray-800"
                            onClick={() => router.push('/login')}
                        >
                            Sign In
                        </Button>
                        <Button
                            className="bg-blue-500 text-white hover:bg-blue-600"
                            onClick={() => router.push('/register')}
                        >
                            Get Started
                        </Button>
                    </div>

                    {/* Mobile Menu */}
                    <div className="md:hidden">
                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-gray-800">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-gray-900 border-gray-700">
                                <SheetHeader>
                                    <SheetTitle className="text-white">Menu</SheetTitle>
                                    <SheetDescription className="text-gray-400">
                                        Welcome to Starter Kit
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="flex flex-col space-y-4 mt-8">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-lg text-gray-300 hover:text-white hover:bg-gray-800"
                                        onClick={() => handleNavigation('/login')}
                                    >
                                        Sign In
                                    </Button>
                                    <Button
                                        className="w-full text-lg bg-blue-500 text-white hover:bg-blue-600"
                                        onClick={() => handleNavigation('/register')}
                                    >
                                        Get Started
                                    </Button>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    )
}
