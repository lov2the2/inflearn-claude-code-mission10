'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth/session'
import GuestNavbar from '@/components/layout/guest-navbar'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Shield, Users, Zap } from 'lucide-react'

export default function Home() {
    const router = useRouter()
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
        if (isAuthenticated()) {
            router.push('/dashboard')
        } else {
            setIsChecking(false)
        }
    }, [router])

    if (isChecking) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
            <GuestNavbar />

            {/* Hero Section */}
            <section className="container mx-auto px-4 pt-20 pb-16 md:pt-28 md:pb-24">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Production-Ready
                        <span className="text-blue-400"> Full-Stack </span>
                        Starter Kit
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                        Go backend with Clean Architecture + Next.js 15 frontend.
                        <br />
                        Complete authentication, RBAC, and modern UI components.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            className="text-lg px-8 py-6 bg-blue-500 text-white hover:bg-blue-600"
                            onClick={() => router.push('/register')}
                        >
                            Get Started Free
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="text-lg px-8 py-6 border-gray-500 text-gray-200 hover:bg-gray-700 hover:text-white"
                            onClick={() => router.push('/login')}
                        >
                            Sign In
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-4 py-16 md:py-24">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
                        Everything You Need to Build Fast
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1: Authentication */}
                        <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-700 hover:border-gray-600 hover:bg-gray-800 transition-all">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                                <Shield className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">
                                Secure Authentication
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                JWT-based auth with automatic token refresh, role-based access control,
                                and session management out of the box.
                            </p>
                        </div>

                        {/* Feature 2: Clean Architecture */}
                        <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-700 hover:border-gray-600 hover:bg-gray-800 transition-all">
                            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                                <CheckCircle2 className="w-6 h-6 text-green-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">
                                Clean Architecture
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                Well-structured Go backend following Clean Architecture principles
                                with handlers, services, and repositories.
                            </p>
                        </div>

                        {/* Feature 3: Modern UI */}
                        <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-700 hover:border-gray-600 hover:bg-gray-800 transition-all">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                                <Zap className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">
                                Modern Tech Stack
                            </h3>
                            <p className="text-gray-400 leading-relaxed">
                                Next.js 15 with App Router, TypeScript, Tailwind CSS, and
                                shadcn/ui components for beautiful interfaces.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-4 py-16 md:py-24">
                <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-12 text-center shadow-xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Ready to Start Building?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join developers using our production-ready starter kit
                    </p>
                    <Button
                        size="lg"
                        variant="secondary"
                        className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100"
                        onClick={() => router.push('/register')}
                    >
                        Create Your Account
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="container mx-auto px-4 py-8 border-t border-gray-700">
                <div className="max-w-4xl mx-auto text-center text-gray-400">
                    <p className="mb-2">
                        Built with Go, Next.js, PostgreSQL, and shadcn/ui
                    </p>
                    <p className="text-sm text-gray-500">
                        © 2026 Starter Kit. Production-ready full-stack template.
                    </p>
                </div>
            </footer>
        </div>
    )
}
