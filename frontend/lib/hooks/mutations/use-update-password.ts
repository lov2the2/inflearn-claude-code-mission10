import { updateUserPassword } from '@/lib/api/user'
import { useApiMutation } from '@/lib/hooks/use-api-mutation'

interface UpdatePasswordParams {
    current_password: string
    new_password: string
    confirm_password: string
}

export function useUpdatePassword() {
    return useApiMutation({
        mutationFn: (params: UpdatePasswordParams) =>
            updateUserPassword(
                params.current_password,
                params.new_password,
                params.confirm_password
            ),
        successMessage: 'Password changed successfully!',
        errorMessage: (error: any) =>
            error.response?.data?.error || 'Failed to change password'
    })
}
