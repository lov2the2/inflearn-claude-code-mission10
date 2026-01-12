import { adminApi } from '@/lib/api/admin'
import { CreateUserRequest } from '@/types'
import { query_keys } from '@/lib/query/keys'
import { useApiMutation } from '@/lib/hooks/use-api-mutation'

/**
 * Create new user mutation hook
 * Invalidates user list after successful creation
 */
export function use_create_user() {
    return useApiMutation({
        mutationFn: (data: CreateUserRequest) => adminApi.createUser(data),
        invalidateKeys: query_keys.admin.users.all(),
        successMessage: (data) =>
            data.generated_password
                ? `User created successfully. Generated password: ${data.generated_password}`
                : 'User created successfully',
        successDuration: 10000, // 10 seconds for password message
        errorMessage: (error: any) =>
            error.response?.data?.error || 'Failed to create user'
    })
}
