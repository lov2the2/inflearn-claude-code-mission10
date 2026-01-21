import { datasetsApi } from '@/lib/api/datasets'
import { queryKeys } from '@/lib/query/keys'
import { useApiMutation } from '@/lib/hooks/use-api-mutation'

interface UploadDatasetParams {
    file: File
    displayName: string
    description: string
}

/**
 * Mutation hook for dataset upload
 * Handles CSV file upload and automatic cache invalidation
 * @returns Mutation object with mutate function and states
 */
export function useUploadDataset() {
    return useApiMutation({
        mutationFn: ({ file, displayName, description }: UploadDatasetParams) =>
            datasetsApi.uploadDataset(file, displayName, description),
        invalidateKeys: queryKeys.datasets.all,
        successMessage: (result) =>
            `Dataset "${result.dataset.displayName}" created with ${result.rowsImported} rows`,
        errorMessage: 'Failed to upload dataset'
    })
}
