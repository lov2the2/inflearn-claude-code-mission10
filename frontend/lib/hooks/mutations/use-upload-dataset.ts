import { datasetsApi } from '@/lib/api/datasets'
import { query_keys } from '@/lib/query/keys'
import { useApiMutation } from '@/lib/hooks/use-api-mutation'

interface UploadDatasetParams {
    file: File
    display_name: string
    description: string
}

/**
 * Mutation hook for dataset upload
 * Handles CSV file upload and automatic cache invalidation
 * @returns Mutation object with mutate function and states
 */
export function use_upload_dataset() {
    return useApiMutation({
        mutationFn: ({ file, display_name, description }: UploadDatasetParams) =>
            datasetsApi.uploadDataset(file, display_name, description),
        invalidateKeys: query_keys.datasets.all,
        successMessage: (result) =>
            `Dataset "${result.dataset.display_name}" created with ${result.rows_imported} rows`,
        errorMessage: 'Failed to upload dataset'
    })
}
