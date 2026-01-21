import { adminApi } from '@/lib/api/admin'
import { queryKeys } from '@/lib/query/keys'
import { useApiMutation } from '@/lib/hooks/use-api-mutation'

/**
 * Mutation hook for deleting user
 * Automatically invalidates user list cache on success
 * @returns Mutation object with mutate function and states
 */
export function useDeleteUser() {
    return useApiMutation({
        mutationFn: (userId: number) => adminApi.deleteUser(userId),
        invalidateKeys: queryKeys.admin.users.all(),
        successMessage: 'User deleted successfully',
        errorMessage: 'Failed to delete user'
    })
}
