import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUserProfile, UserProfile } from '@/lib/api/user'
import { query_keys } from '@/lib/query/keys'
import { toast } from 'sonner'

export function use_update_profile() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (name: string) => updateUserProfile(name),
        onSuccess: (updatedProfile: UserProfile) => {
            queryClient.invalidateQueries({ queryKey: query_keys.user.profile() })
            toast.success('Profile updated successfully!')
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.error || 'Failed to update profile'
            toast.error(errorMessage)
        }
    })
}
