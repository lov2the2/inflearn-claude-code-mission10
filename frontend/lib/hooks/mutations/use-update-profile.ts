import { updateUserProfile } from '@/lib/api/user'
import { query_keys } from '@/lib/query/keys'
import { useApiMutation } from '@/lib/hooks/use-api-mutation'

export function useUpdateProfile() {
    return useApiMutation({
        mutationFn: (name: string) => updateUserProfile(name),
        invalidateKeys: query_keys.user.profile(),
        successMessage: 'Profile updated successfully!',
        errorMessage: (error: any) =>
            error.response?.data?.error || 'Failed to update profile'
    })
}
