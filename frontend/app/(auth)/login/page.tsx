import Link from 'next/link'
import LoginForm from '@/components/auth/login-form'

export default function LoginPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
            <LoginForm />
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Register here
                </Link>
            </p>
        </div>
    )
}
