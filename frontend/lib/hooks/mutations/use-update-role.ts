import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import { query_keys } from '@/lib/query/keys'
import { toast } from 'sonner'

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
    const query_client = useQueryClient()

    return useMutation({
        mutationFn: ({ user_id, new_role }: UpdateRoleParams) =>
            adminApi.updateUserRole(user_id, new_role),

        onSuccess: (_, variables) => {
            // Invalidate all user list queries to trigger refetch
            query_client.invalidateQueries({
                queryKey: query_keys.admin.users.all()
            })

            toast.success(`User role updated to ${variables.new_role} successfully`)
        },

        onError: (error) => {
            console.error('Failed to update role:', error)
            toast.error('Failed to update user role')
        },
    })
}
