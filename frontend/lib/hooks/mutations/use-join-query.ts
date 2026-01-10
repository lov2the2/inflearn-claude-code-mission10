import { useMutation } from '@tanstack/react-query'
import { datasetsApi } from '@/lib/api/datasets'
import { JoinQueryRequest } from '@/types/dataset'
import { toast } from 'sonner'

/**
 * Mutation hook for join query execution
 * Does not invalidate cache (read-only operation)
 * @returns Mutation object with mutate function and states
 */
export function use_join_query() {
    return useMutation({
        mutationFn: (request: JoinQueryRequest) =>
            datasetsApi.executeJoinQuery(request),

        onError: (error) => {
            console.error('Failed to execute join query:', error)
            toast.error('Failed to execute join query')
        },
    })
}

/**
 * Mutation hook for join query export
 * Downloads the result as CSV file
 * @returns Mutation object with mutate function and states
 */
export function use_export_join_query() {
    return useMutation({
        mutationFn: (request: JoinQueryRequest) =>
            datasetsApi.exportJoinQuery(request),

        onSuccess: (blob) => {
            // Create download link
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `join_result_${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            toast.success('Join result exported successfully')
        },

        onError: (error) => {
            console.error('Failed to export join result:', error)
            toast.error('Failed to export join result')
        },
    })
}
