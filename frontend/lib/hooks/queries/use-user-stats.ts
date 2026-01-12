import { useQuery } from '@tanstack/react-query'
import { getUserStats } from '@/lib/api/user'
import { UserStats } from '@/types'
import { query_keys } from '@/lib/query/keys'

/**
 * Fetch user statistics for dashboard
 * Includes total logins, account age, and activity metrics
 * @returns Query result with stats data
 */
export function use_user_stats() {
    return useQuery({
        queryKey: query_keys.user.stats(),
        queryFn: getUserStats,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10,    // 10 minutes
    })
}
