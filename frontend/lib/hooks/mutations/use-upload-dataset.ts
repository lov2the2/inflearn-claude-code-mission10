import { useMutation, useQueryClient } from '@tanstack/react-query'
import { datasetsApi } from '@/lib/api/datasets'
import { query_keys } from '@/lib/query/keys'
import { toast } from 'sonner'

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
    const query_client = useQueryClient()

    return useMutation({
        mutationFn: ({ file, display_name, description }: UploadDatasetParams) =>
            datasetsApi.uploadDataset(file, display_name, description),

        onSuccess: (result) => {
            // Invalidate dataset list cache
            query_client.invalidateQueries({
                queryKey: query_keys.datasets.all
            })

            toast.success(
                `Dataset "${result.dataset.display_name}" created with ${result.rows_imported} rows`
            )
        },

        onError: (error) => {
            console.error('Failed to upload dataset:', error)
            toast.error('Failed to upload dataset')
        },
    })
}
