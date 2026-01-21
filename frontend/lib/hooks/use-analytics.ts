import { useQuery } from '@tanstack/react-query'
import { getLoginTrend, getActivityDistribution, getMonthlyStats } from '@/lib/api/user'
import {
    transformLoginTrend,
    transformActivityDistribution,
    transformMonthlyStats
} from '@/lib/utils/chart-transformers'

/**
 * Hook to fetch and transform login trend data
 */
export function useLoginTrend() {
    return useQuery({
        queryKey: ['login-trend'],
        queryFn: async () => {
            const data = await getLoginTrend()
            return transformLoginTrend(data)
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    })
}

/**
 * Hook to fetch and transform activity distribution data
 */
export function useActivityDistribution() {
    return useQuery({
        queryKey: ['activity-distribution'],
        queryFn: async () => {
            const data = await getActivityDistribution()
            return transformActivityDistribution(data)
        },
        staleTime: 5 * 60 * 1000,
        retry: 2,
    })
}

/**
 * Hook to fetch and transform monthly statistics data
 */
export function useMonthlyStats() {
    return useQuery({
        queryKey: ['monthly-stats'],
        queryFn: async () => {
            const data = await getMonthlyStats()
            return transformMonthlyStats(data)
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        retry: 2,
    })
}
