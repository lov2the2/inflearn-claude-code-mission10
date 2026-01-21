import { QueryClient } from '@tanstack/react-query'

/**
 * Create QueryClient with optimized default options
 * Configured for production-ready caching and error handling
 */
export function createQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Caching Strategy
                staleTime: 1000 * 60 * 5,           // 5 minutes (data considered fresh)
                gcTime: 1000 * 60 * 10,              // 10 minutes (cache retention)

                // Refetch Strategy
                refetchOnWindowFocus: true,          // Refetch on window focus
                refetchOnReconnect: true,            // Refetch on network reconnect
                refetchOnMount: true,                // Refetch on component mount

                // Error Handling
                retry: 1,                            // Retry failed requests once
                retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

                // Network Mode
                networkMode: 'online',               // Only run queries when online
            },
            mutations: {
                // Error Handling
                retry: 0,                            // Don't retry mutations (user action)
                networkMode: 'online',
            },
        },
    })
}

export const queryClient = createQueryClient()
