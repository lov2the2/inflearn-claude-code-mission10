import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import { ListUsersResponse } from '@/types'
import { query_keys } from '@/lib/query/keys'

/**
 * Fetch admin user list with pagination, search, and filter
 * @param page - Page number
 * @param limit - Items per page
 * @param search - Search query for name/email
 * @param role - Role filter (admin/user)
 * @returns Query result with paginated user list
 */
export function use_user_list(
    page = 1,
    limit = 10,
    search = '',
    role: 'admin' | 'user' | '' = ''
) {
    return useQuery({
        queryKey: query_keys.admin.users.list(page, limit, search, role),
        queryFn: () => adminApi.listUsers({ page, limit, search, role }),
        staleTime: 1000 * 60 * 3, // 3 minutes
        gcTime: 1000 * 60 * 5,     // 5 minutes
        // Keep previous data while fetching new page
        placeholderData: (previousData) => previousData,
    })
}
