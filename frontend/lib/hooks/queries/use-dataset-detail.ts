import { useQuery } from '@tanstack/react-query'
import { datasetsApi } from '@/lib/api/datasets'
import { queryKeys } from '@/lib/query/keys'

/**
 * Query hook for dataset detail
 * @param id Dataset ID
 * @returns Query result with dataset details including columns
 */
export function useDatasetDetail(id: string) {
    return useQuery({
        queryKey: queryKeys.datasets.detail(id),
        queryFn: () => datasetsApi.getDataset(id),
        enabled: !!id,
    })
}
