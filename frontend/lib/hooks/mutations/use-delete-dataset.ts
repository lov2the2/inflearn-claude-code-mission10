import { datasetsApi } from '@/lib/api/datasets'
import { query_keys } from '@/lib/query/keys'
import { useApiMutation } from '@/lib/hooks/use-api-mutation'

/**
 * Mutation hook for dataset deletion
 * Handles dataset deletion and automatic cache invalidation
 * @returns Mutation object with mutate function and states
 */
export function use_delete_dataset() {
    return useApiMutation({
        mutationFn: (id: string) => datasetsApi.deleteDataset(id),
        invalidateKeys: query_keys.datasets.all,
        successMessage: 'Dataset deleted successfully',
        errorMessage: 'Failed to delete dataset'
    })
}
