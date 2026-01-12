import { adminApi } from '@/lib/api/admin'
import { query_keys } from '@/lib/query/keys'
import { useApiMutation } from '@/lib/hooks/use-api-mutation'

/**
 * Mutation hook for deleting user
 * Automatically invalidates user list cache on success
 * @returns Mutation object with mutate function and states
 */
export function use_delete_user() {
    return useApiMutation({
        mutationFn: (user_id: number) => adminApi.deleteUser(user_id),
        invalidateKeys: query_keys.admin.users.all(),
        successMessage: 'User deleted successfully',
        errorMessage: 'Failed to delete user'
    })
}
