import { datasetsApi } from '@/lib/api/datasets'
import { JoinQueryRequest } from '@/types/dataset'
import { useApiMutation } from '@/lib/hooks/use-api-mutation'

/**
 * Mutation hook for join query execution
 * Does not invalidate cache (read-only operation)
 * @returns Mutation object with mutate function and states
 */
export function use_join_query() {
    return useApiMutation({
        mutationFn: (request: JoinQueryRequest) =>
            datasetsApi.executeJoinQuery(request),
        errorMessage: 'Failed to execute join query'
    })
}

/**
 * Mutation hook for join query export
 * Downloads the result as CSV file
 * @returns Mutation object with mutate function and states
 */
export function use_export_join_query() {
    return useApiMutation({
        mutationFn: (request: JoinQueryRequest) =>
            datasetsApi.exportJoinQuery(request),
        successMessage: 'Join result exported successfully',
        errorMessage: 'Failed to export join result',
        onSuccess: (blob: Blob) => {
            // Create download link
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `join_result_${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        }
    })
}
