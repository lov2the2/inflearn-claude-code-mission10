import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, CSVImportResult } from '@/lib/api/admin'
import { query_keys } from '@/lib/query/keys'
import { toast } from 'sonner'

/**
 * Mutation hook for CSV import
 * Handles file upload and automatic cache invalidation
 * @returns Mutation object with mutate function and states
 */
export function use_import_csv() {
    const query_client = useQueryClient()

    return useMutation({
        mutationFn: (file: File) => adminApi.importCSV(file),

        onSuccess: (result: CSVImportResult) => {
            // Invalidate user list cache
            query_client.invalidateQueries({
                queryKey: query_keys.admin.users.all()
            })

            if (result.failure_count === 0) {
                toast.success(`Successfully imported ${result.success_count} users`)
            } else {
                toast.warning(
                    `Imported ${result.success_count} users with ${result.failure_count} failures`
                )
            }
        },

        onError: (error) => {
            console.error('Failed to import CSV:', error)
            toast.error('Failed to import CSV')
        },
    })
}
