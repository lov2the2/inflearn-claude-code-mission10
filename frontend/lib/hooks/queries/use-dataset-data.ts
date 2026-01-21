import { useQuery } from '@tanstack/react-query'
import { datasetsApi } from '@/lib/api/datasets'
import { queryKeys } from '@/lib/query/keys'
import { DatasetDataParams } from '@/types/dataset'

/**
 * Query hook for dataset data with pagination, filtering, and sorting
 * @param id Dataset ID
 * @param params Query parameters (page, limit, sortBy, sortOrder, filters)
 * @returns Query result with columns, rows, and pagination info
 */
export function useDatasetData(id: string, params: DatasetDataParams = {}) {
    const { page = 1, limit = 50, sortBy, sortOrder, filters } = params

    return useQuery({
        queryKey: queryKeys.datasets.data(id, { page, limit, sortBy, sortOrder, filters }),
        queryFn: () => datasetsApi.getDatasetData(id, params),
        enabled: !!id,
    })
}
