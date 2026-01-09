import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '../login-form'
import { authApi } from '@/lib/api/auth'
import { setSession } from '@/lib/auth/session'
import { useRouter } from 'next/navigation'

// Mock dependencies
vi.mock('@/lib/api/auth', () => ({
    authApi: {
        login: vi.fn(),
    },
}))

vi.mock('@/lib/auth/session', () => ({
    setSession: vi.fn(),
}))

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}))

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}))

describe('LoginForm', () => {
    const mock_router_push = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        ;(useRouter as any).mockReturnValue({
            push: mock_router_push,
        })
    })

    it('should render login form with all elements', () => {
        render(<LoginForm />)

        // Check form elements
        expect(screen.getByText('Enter your credentials to access your account')).toBeInTheDocument()
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
    })

    it('should display validation errors for empty fields', async () => {
        const user = userEvent.setup()
        render(<LoginForm />)

        const submit_button = screen.getByRole('button', { name: /login/i })
        await user.click(submit_button)

        await waitFor(() => {
            expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
            expect(screen.getByText(/password is required/i)).toBeInTheDocument()
        })
    })

    it('should display validation error for invalid email', async () => {
        const user = userEvent.setup()
        render(<LoginForm />)

        const email_input = screen.getByLabelText(/email/i)
        const password_input = screen.getByLabelText(/password/i)
        const submit_button = screen.getByRole('button', { name: /login/i })

        await user.type(email_input, 'invalid-email')
        await user.type(password_input, 'password123')
        await user.click(submit_button)

        await waitFor(() => {
            expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
        })
    })

    it('should submit form with valid credentials', async () => {
        const user = userEvent.setup()
        const mock_response = {
            access_token: 'test-access-token',
            refresh_token: 'test-refresh-token',
            user: {
                id: 1,
                email: 'test@example.com',
                name: 'Test User',
                role: 'user',
            },
        }

        ;(authApi.login as any).mockResolvedValue(mock_response)

        render(<LoginForm />)

        const email_input = screen.getByLabelText(/email/i)
        const password_input = screen.getByLabelText(/password/i)
        const submit_button = screen.getByRole('button', { name: /login/i })

        await user.type(email_input, 'test@example.com')
        await user.type(password_input, 'password123')
        await user.click(submit_button)

        await waitFor(() => {
            expect(authApi.login).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            })
            expect(setSession).toHaveBeenCalledWith(mock_response)
            expect(mock_router_push).toHaveBeenCalledWith('/dashboard')
        })
    })

    it('should display error message on login failure', async () => {
        const user = userEvent.setup()

        ;(authApi.login as any).mockRejectedValue({
            isAxiosError: true,
            response: {
                status: 401,
                data: {
                    code: 'UNAUTHORIZED',
                    message: '이메일 또는 비밀번호가 올바르지 않습니다',
                },
            },
        })

        render(<LoginForm />)

        const email_input = screen.getByLabelText(/email/i)
        const password_input = screen.getByLabelText(/password/i)
        const submit_button = screen.getByRole('button', { name: /login/i })

        await user.type(email_input, 'test@example.com')
        await user.type(password_input, 'wrongpassword')
        await user.click(submit_button)

        await waitFor(() => {
            expect(screen.getByText(/이메일 또는 비밀번호가 올바르지 않습니다/i)).toBeInTheDocument()
        })
    })

    it('should disable form inputs during submission', async () => {
        const user = userEvent.setup()

        // Mock a slow API call
        ;(authApi.login as any).mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        )

        render(<LoginForm />)

        const email_input = screen.getByLabelText(/email/i) as HTMLInputElement
        const password_input = screen.getByLabelText(/password/i) as HTMLInputElement
        const submit_button = screen.getByRole('button', { name: /login/i })

        await user.type(email_input, 'test@example.com')
        await user.type(password_input, 'password123')
        await user.click(submit_button)

        // Check that inputs are disabled during submission
        expect(email_input).toBeDisabled()
        expect(password_input).toBeDisabled()

        await waitFor(() => {
            expect(email_input).not.toBeDisabled()
            expect(password_input).not.toBeDisabled()
        })
    })
})
