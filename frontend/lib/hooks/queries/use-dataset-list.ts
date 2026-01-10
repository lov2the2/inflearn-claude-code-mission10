import { useQuery } from '@tanstack/react-query'
import { datasetsApi } from '@/lib/api/datasets'
import { query_keys } from '@/lib/query/keys'

/**
 * Query hook for dataset list with pagination
 * @param page Current page number (default: 1)
 * @param limit Items per page (default: 10)
 * @returns Query result with datasets array and pagination info
 */
export function use_dataset_list(page: number = 1, limit: number = 10) {
    return useQuery({
        queryKey: query_keys.datasets.list(page, limit),
        queryFn: () => datasetsApi.listDatasets(page, limit),
    })
}
