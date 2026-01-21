import { updateUserPassword } from '@/lib/api/user'
import { useApiMutation } from '@/lib/hooks/use-api-mutation'

interface UpdatePasswordParams {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

export function useUpdatePassword() {
    return useApiMutation({
        mutationFn: (params: UpdatePasswordParams) =>
            updateUserPassword(
                params.currentPassword,
                params.newPassword,
                params.confirmPassword
            ),
        successMessage: 'Password changed successfully!',
        errorMessage: (error: any) =>
            error.response?.data?.error || 'Failed to change password'
    })
}
