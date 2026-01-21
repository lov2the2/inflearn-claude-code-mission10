import { useMutation, useQueryClient, UseMutationOptions, QueryKey } from '@tanstack/react-query'
import { toast } from 'sonner'

/**
 * Configuration options for useApiMutation hook
 */
interface UseApiMutationOptions<TData, TError, TVariables> {
    /**
     * The mutation function to execute
     */
    mutationFn: (variables: TVariables) => Promise<TData>

    /**
     * Query keys to invalidate on success
     * Can be a single key or array of keys
     */
    invalidateKeys?: QueryKey | QueryKey[]

    /**
     * Success toast message
     * Can be a string or function that receives mutation result
     */
    successMessage?: string | ((data: TData, variables: TVariables) => string)

    /**
     * Error toast message
     * Can be a string or function that receives error
     */
    errorMessage?: string | ((error: TError) => string)

    /**
     * Toast duration in milliseconds for success message
     */
    successDuration?: number

    /**
     * Custom onSuccess handler (called before invalidation and toast)
     */
    onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>

    /**
     * Custom onError handler (called before toast)
     */
    onError?: (error: TError, variables: TVariables) => void

    /**
     * Additional React Query mutation options
     */
    mutationOptions?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn' | 'onSuccess' | 'onError'>
}

/**
 * Common mutation hook with automatic query invalidation and toast messages
 *
 * Features:
 * - Automatic query invalidation on success
 * - Success/error toast notifications
 * - Customizable messages via string or function
 * - Type-safe with TypeScript generics
 * - Loading state management via React Query
 *
 * @example
 * ```ts
 * const { mutate, isPending } = useApiMutation({
 *   mutationFn: (id: string) => api.deleteItem(id),
 *   invalidateKeys: ['items'],
 *   successMessage: 'Item deleted',
 *   errorMessage: 'Failed to delete item'
 * })
 * ```
 */
export function useApiMutation<TData = unknown, TError = any, TVariables = void>({
    mutationFn,
    invalidateKeys,
    successMessage,
    errorMessage = 'An error occurred',
    successDuration,
    onSuccess: customOnSuccess,
    onError: customOnError,
    mutationOptions
}: UseApiMutationOptions<TData, TError, TVariables>) {
    const queryClientInstance = useQueryClient()

    return useMutation<TData, TError, TVariables>({
        mutationFn,

        onSuccess: async (data, variables, context) => {
            // Call custom onSuccess handler first
            if (customOnSuccess) {
                await customOnSuccess(data, variables)
            }

            // Invalidate specified query keys
            if (invalidateKeys) {
                const keysArray = Array.isArray(invalidateKeys[0]) ? invalidateKeys : [invalidateKeys]

                for (const key of keysArray as QueryKey[]) {
                    await queryClientInstance.invalidateQueries({ queryKey: key })
                }
            }

            // Show success toast
            if (successMessage) {
                const message = typeof successMessage === 'function'
                    ? successMessage(data, variables)
                    : successMessage

                toast.success(message, successDuration ? { duration: successDuration } : undefined)
            }
        },

        onError: (error, variables, context) => {
            // Call custom onError handler first
            if (customOnError) {
                customOnError(error, variables)
            }

            // Log error to console
            console.error('Mutation error:', error)

            // Show error toast
            const message = typeof errorMessage === 'function'
                ? errorMessage(error)
                : errorMessage

            toast.error(message)
        },

        ...mutationOptions
    })
}
