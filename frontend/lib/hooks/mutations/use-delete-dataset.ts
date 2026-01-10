import { useMutation, useQueryClient } from '@tanstack/react-query'
import { datasetsApi } from '@/lib/api/datasets'
import { query_keys } from '@/lib/query/keys'
import { toast } from 'sonner'

/**
 * Mutation hook for dataset deletion
 * Handles dataset deletion and automatic cache invalidation
 * @returns Mutation object with mutate function and states
 */
export function use_delete_dataset() {
    const query_client = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => datasetsApi.deleteDataset(id),

        onSuccess: () => {
            // Invalidate dataset list cache
            query_client.invalidateQueries({
                queryKey: query_keys.datasets.all
            })

            toast.success('Dataset deleted successfully')
        },

        onError: (error) => {
            console.error('Failed to delete dataset:', error)
            toast.error('Failed to delete dataset')
        },
    })
}
