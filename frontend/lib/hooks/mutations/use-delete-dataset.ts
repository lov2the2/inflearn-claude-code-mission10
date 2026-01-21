import { datasetsApi } from '@/lib/api/datasets'
import { queryKeys } from '@/lib/query/keys'
import { useApiMutation } from '@/lib/hooks/use-api-mutation'

/**
 * Mutation hook for dataset deletion
 * Handles dataset deletion and automatic cache invalidation
 * @returns Mutation object with mutate function and states
 */
export function useDeleteDataset() {
    return useApiMutation({
        mutationFn: (id: string) => datasetsApi.deleteDataset(id),
        invalidateKeys: queryKeys.datasets.all,
        successMessage: 'Dataset deleted successfully',
        errorMessage: 'Failed to delete dataset'
    })
}
