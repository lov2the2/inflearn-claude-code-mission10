import { adminApi } from '@/lib/api/admin'
import { query_keys } from '@/lib/query/keys'
import { useApiMutation } from '@/lib/hooks/use-api-mutation'

interface UpdateRoleParams {
    user_id: number
    new_role: 'admin' | 'user'
}

/**
 * Mutation hook for updating user role
 * Automatically invalidates user list cache on success
 * @returns Mutation object with mutate function and states
 */
export function use_update_role() {
    return useApiMutation({
        mutationFn: ({ user_id, new_role }: UpdateRoleParams) =>
            adminApi.updateUserRole(user_id, new_role),
        invalidateKeys: query_keys.admin.users.all(),
        successMessage: (_, variables) =>
            `User role updated to ${variables.new_role} successfully`,
        errorMessage: 'Failed to update user role'
    })
}
