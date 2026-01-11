import { useQuery } from '@tanstack/react-query'
import { datasetsApi } from '@/lib/api/datasets'
import { query_keys } from '@/lib/query/keys'
import { DatasetDataParams } from '@/types/dataset'

/**
 * Query hook for dataset data with pagination, filtering, and sorting
 * @param id Dataset ID
 * @param params Query parameters (page, limit, sort_by, sort_order, filters)
 * @returns Query result with columns, rows, and pagination info
 */
export function use_dataset_data(id: string, params: DatasetDataParams = {}) {
    const { page = 1, limit = 50, sort_by, sort_order, filters } = params

    return useQuery({
        queryKey: query_keys.datasets.data(id, { page, limit, sort_by, sort_order, filters }),
        queryFn: () => datasetsApi.getDatasetData(id, params),
        enabled: !!id,
    })
}
