'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { createQueryClient } from '@/lib/query/client'

/**
 * React Query Provider wrapper
 * Creates new QueryClient per request to avoid cross-request cache pollution
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
    // Create client once per mount (not global singleton for SSR safety)
    const [queryClientInstance] = useState(() => createQueryClient())

    return (
        <QueryClientProvider client={queryClientInstance}>
            {children}
            {/* Devtools only in development */}
            {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    )
}
