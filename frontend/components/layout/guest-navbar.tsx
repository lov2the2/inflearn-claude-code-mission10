'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function GuestNavbar() {
    const router = useRouter()

    return (
        <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold text-gray-900">
                            Starter Kit
                        </h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/login')}
                        >
                            Sign In
                        </Button>
                        <Button
                            onClick={() => router.push('/register')}
                        >
                            Get Started
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    )
}
