/**
 * UI component prop type definitions
 * Centralized types for reusable component props
 */

import { LucideIcon } from 'lucide-react'
import { UserActivity } from './user'

export interface StatsCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    description?: string
    trend?: {
        value: number
        isPositive: boolean
    }
}

export interface ActivityTableProps {
    data: UserActivity[]
}
