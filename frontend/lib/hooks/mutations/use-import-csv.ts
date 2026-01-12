import { adminApi } from '@/lib/api/admin'
import { CSVImportResult } from '@/types'
import { query_keys } from '@/lib/query/keys'
import { useApiMutation } from '@/lib/hooks/use-api-mutation'
import { toast } from 'sonner'

/**
 * Mutation hook for CSV import
 * Handles file upload and automatic cache invalidation
 * @returns Mutation object with mutate function and states
 */
export function use_import_csv() {
    return useApiMutation({
        mutationFn: (file: File) => adminApi.importCSV(file),
        invalidateKeys: query_keys.admin.users.all(),
        successMessage: (result: CSVImportResult) =>
            result.failure_count === 0
                ? `Successfully imported ${result.success_count} users`
                : '', // Empty string to prevent default success toast
        errorMessage: 'Failed to import CSV',
        onSuccess: (result: CSVImportResult) => {
            // Show warning toast for partial failures
            if (result.failure_count > 0) {
                toast.warning(
                    `Imported ${result.success_count} users with ${result.failure_count} failures`
                )
            }
        }
    })
}
