import { useQuery } from '@tanstack/react-query'
import { getUserProfile, UserProfile } from '@/lib/api/user'
import { query_keys } from '@/lib/query/keys'

/**
 * Fetch current user's profile information
 * Automatically caches and refetches on window focus
 * @returns Query result with profile data, loading, and error states
 */
export function use_user_profile() {
    return useQuery({
        queryKey: query_keys.user.profile(),
        queryFn: getUserProfile,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10,    // 10 minutes
    })
}
