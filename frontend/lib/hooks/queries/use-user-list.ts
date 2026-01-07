import { useQuery } from '@tanstack/react-query'
import { adminApi, ListUsersResponse } from '@/lib/api/admin'
import { query_keys } from '@/lib/query/keys'

/**
 * Fetch admin user list with pagination
 * @param page - Page number
 * @param limit - Items per page
 * @returns Query result with paginated user list
 */
export function use_user_list(page = 1, limit = 10) {
    return useQuery({
        queryKey: query_keys.admin.users.list(page, limit),
        queryFn: () => adminApi.listUsers({ page, limit }),
        staleTime: 1000 * 60 * 3, // 3 minutes
        gcTime: 1000 * 60 * 5,     // 5 minutes
        // Keep previous data while fetching new page
        placeholderData: (previousData) => previousData,
    })
}
