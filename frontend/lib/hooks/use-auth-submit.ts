import { useState } from 'react'

export interface AuthSubmitState {
    error: string
    isLoading: boolean
}

/**
 * Custom hook for handling authentication form submission
 * Manages loading and error states for login/register forms
 * @returns State and utility functions for form submission
 */
export function useAuthSubmit() {
    const [error, setError] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)

    /**
     * Execute authentication action with loading and error handling
     * @param action - Async function to execute (login or register API call)
     * @param onSuccess - Callback on successful authentication
     */
    const executeAuth = async (
        action: () => Promise<any>,
        onSuccess: () => void
    ) => {
        try {
            setIsLoading(true)
            setError('')
            await action()
            onSuccess()
        } catch (err: any) {
            setError(err.response?.data?.error || 'Authentication failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return {
        error,
        isLoading,
        setError,
        executeAuth,
    }
}
