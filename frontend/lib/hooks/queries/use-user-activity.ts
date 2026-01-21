import { useQuery } from '@tanstack/react-query'
import { getUserActivity } from '@/lib/api/user'
import { UserActivity, PaginatedResponse } from '@/types'
import { queryKeys } from '@/lib/query/keys'

/**
 * Fetch user activity logs with pagination
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @returns Query result with paginated activity data
 */
export function useUserActivity(page = 1, limit = 10) {
    return useQuery({
        queryKey: queryKeys.user.activity(page, limit),
        queryFn: () => getUserActivity(page, limit),
        staleTime: 1000 * 60 * 2, // 2 minutes (more frequent refresh for activity)
        gcTime: 1000 * 60 * 5,     // 5 minutes
    })
}
