import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, CreateUserRequest } from '@/lib/api/admin'
import { query_keys } from '@/lib/query/keys'
import { toast } from 'sonner'

/**
 * Create new user mutation hook
 * Invalidates user list after successful creation
 */
export function use_create_user() {
    const query_client = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateUserRequest) => adminApi.createUser(data),
        onSuccess: (data) => {
            query_client.invalidateQueries({
                queryKey: query_keys.admin.users.all()
            })

            if (data.generated_password) {
                toast.success(
                    `User created successfully. Generated password: ${data.generated_password}`,
                    { duration: 10000 }
                )
            } else {
                toast.success('User created successfully')
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.error || 'Failed to create user'
            toast.error(message)
        }
    })
}
