import { useQuery } from '@tanstack/react-query'
import { getUserActivity, UserActivity, PaginatedResponse } from '@/lib/api/user'
import { query_keys } from '@/lib/query/keys'

/**
 * Fetch user activity logs with pagination
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @returns Query result with paginated activity data
 */
export function use_user_activity(page = 1, limit = 10) {
    return useQuery({
        queryKey: query_keys.user.activity(page, limit),
        queryFn: () => getUserActivity(page, limit),
        staleTime: 1000 * 60 * 2, // 2 minutes (more frequent refresh for activity)
        gcTime: 1000 * 60 * 5,     // 5 minutes
    })
}
