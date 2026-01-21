import { adminApi } from '@/lib/api/admin'
import { CreateUserRequest } from '@/types'
import { queryKeys } from '@/lib/query/keys'
import { useApiMutation } from '@/lib/hooks/use-api-mutation'

/**
 * Create new user mutation hook
 * Invalidates user list after successful creation
 */
export function useCreateUser() {
    return useApiMutation({
        mutationFn: (data: CreateUserRequest) => adminApi.createUser(data),
        invalidateKeys: queryKeys.admin.users.all(),
        successMessage: (data) =>
            data.generatedPassword
                ? `User created successfully. Generated password: ${data.generatedPassword}`
                : 'User created successfully',
        successDuration: 10000, // 10 seconds for password message
        errorMessage: (error: any) =>
            error.response?.data?.error || 'Failed to create user'
    })
}
