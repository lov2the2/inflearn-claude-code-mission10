import { useMutation } from '@tanstack/react-query'
import { updateUserPassword } from '@/lib/api/user'
import { toast } from 'sonner'

interface UpdatePasswordParams {
    current_password: string
    new_password: string
    confirm_password: string
}

export function use_update_password() {
    return useMutation({
        mutationFn: (params: UpdatePasswordParams) =>
            updateUserPassword(
                params.current_password,
                params.new_password,
                params.confirm_password
            ),
        onSuccess: () => {
            toast.success('Password changed successfully!')
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.error || 'Failed to change password'
            toast.error(errorMessage)
        }
    })
}
