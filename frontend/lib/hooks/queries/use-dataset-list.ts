import { useQuery } from '@tanstack/react-query'
import { datasetsApi } from '@/lib/api/datasets'
import { queryKeys } from '@/lib/query/keys'

/**
 * Query hook for dataset list with pagination
 * @param page Current page number (default: 1)
 * @param limit Items per page (default: 10)
 * @returns Query result with datasets array and pagination info
 */
export function useDatasetList(page: number = 1, limit: number = 10) {
    return useQuery({
        queryKey: queryKeys.datasets.list(page, limit),
        queryFn: () => datasetsApi.listDatasets(page, limit),
    })
}
