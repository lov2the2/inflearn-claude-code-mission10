import { adminApi } from '@/lib/api/admin'
import { queryKeys } from '@/lib/query/keys'
import { useApiMutation } from '@/lib/hooks/use-api-mutation'

interface UpdateRoleParams {
    userId: number
    newRole: 'admin' | 'user'
}

/**
 * Mutation hook for updating user role
 * Automatically invalidates user list cache on success
 * @returns Mutation object with mutate function and states
 */
export function useUpdateRole() {
    return useApiMutation({
        mutationFn: ({ userId, newRole }: UpdateRoleParams) =>
            adminApi.updateUserRole(userId, newRole),
        invalidateKeys: queryKeys.admin.users.all(),
        successMessage: (_, variables) =>
            `User role updated to ${variables.newRole} successfully`,
        errorMessage: 'Failed to update user role'
    })
}
