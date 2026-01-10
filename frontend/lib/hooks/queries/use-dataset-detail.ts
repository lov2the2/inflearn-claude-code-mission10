import { useQuery } from '@tanstack/react-query'
import { datasetsApi } from '@/lib/api/datasets'
import { query_keys } from '@/lib/query/keys'

/**
 * Query hook for dataset detail
 * @param id Dataset ID
 * @returns Query result with dataset details including columns
 */
export function use_dataset_detail(id: string) {
    return useQuery({
        queryKey: query_keys.datasets.detail(id),
        queryFn: () => datasetsApi.getDataset(id),
        enabled: !!id,
    })
}
