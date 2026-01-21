import { adminApi } from '@/lib/api/admin'
import { CSVImportResult } from '@/types'
import { queryKeys } from '@/lib/query/keys'
import { useApiMutation } from '@/lib/hooks/use-api-mutation'
import { toast } from 'sonner'

/**
 * Mutation hook for CSV import
 * Handles file upload and automatic cache invalidation
 * @returns Mutation object with mutate function and states
 */
export function useImportCsv() {
    return useApiMutation({
        mutationFn: (file: File) => adminApi.importCSV(file),
        invalidateKeys: queryKeys.admin.users.all(),
        successMessage: (result: CSVImportResult) =>
            result.failureCount === 0
                ? `Successfully imported ${result.successCount} users`
                : '', // Empty string to prevent default success toast
        errorMessage: 'Failed to import CSV',
        onSuccess: (result: CSVImportResult) => {
            // Show warning toast for partial failures
            if (result.failureCount > 0) {
                toast.warning(
                    `Imported ${result.successCount} users with ${result.failureCount} failures`
                )
            }
        }
    })
}
