import { useQuery } from '@tanstack/react-query'
import { getUserProfile } from '@/lib/api/user'
import { UserProfile } from '@/types'
import { queryKeys } from '@/lib/query/keys'

/**
 * Fetch current user's profile information
 * Automatically caches and refetches on window focus
 * @returns Query result with profile data, loading, and error states
 */
export function useUserProfile() {
    return useQuery({
        queryKey: queryKeys.user.profile(),
        queryFn: getUserProfile,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10,    // 10 minutes
    })
}
