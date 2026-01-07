import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin'
import { query_keys } from '@/lib/query/keys'
import { toast } from 'sonner'

/**
 * Mutation hook for deleting user
 * Automatically invalidates user list cache on success
 * @returns Mutation object with mutate function and states
 */
export function use_delete_user() {
    const query_client = useQueryClient()

    return useMutation({
        mutationFn: (user_id: number) => adminApi.deleteUser(user_id),

        onSuccess: () => {
            // Invalidate all user list queries
            query_client.invalidateQueries({
                queryKey: query_keys.admin.users.all()
            })

            toast.success('User deleted successfully')
        },

        onError: (error) => {
            console.error('Failed to delete user:', error)
            toast.error('Failed to delete user')
        },
    })
}
