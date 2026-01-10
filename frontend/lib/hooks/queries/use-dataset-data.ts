import { useQuery } from '@tanstack/react-query'
import { datasetsApi } from '@/lib/api/datasets'
import { query_keys } from '@/lib/query/keys'

/**
 * Query hook for dataset data with pagination
 * @param id Dataset ID
 * @param page Current page number (default: 1)
 * @param limit Rows per page (default: 50)
 * @returns Query result with columns, rows, and pagination info
 */
export function use_dataset_data(id: string, page: number = 1, limit: number = 50) {
    return useQuery({
        queryKey: query_keys.datasets.data(id, page, limit),
        queryFn: () => datasetsApi.getDatasetData(id, page, limit),
        enabled: !!id,
    })
}
