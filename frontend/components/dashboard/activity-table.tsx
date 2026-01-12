'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { UserActivity, ActivityTableProps } from '@/types'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

const columns: ColumnDef<UserActivity>[] = [
    {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => {
            const action = row.getValue('action') as string
            const variant = action.toLowerCase().includes('login') ? 'default' : 'secondary'
            return <Badge variant={variant}>{action}</Badge>
        },
    },
    {
        accessorKey: 'description',
        header: 'Description',
    },
    {
        accessorKey: 'timestamp',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Timestamp
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const timestamp = new Date(row.getValue('timestamp'))
            return (
                <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(timestamp, { addSuffix: true })}
                </span>
            )
        },
    },
    {
        accessorKey: 'ipAddress',
        header: 'IP Address',
        cell: ({ row }) => <span className="font-mono text-xs">{row.getValue('ipAddress')}</span>,
    },
]

/**
 * Displays user activity logs in a sortable data table
 * Shows action type, description, timestamp, and IP address
 * Supports sorting by timestamp and searching by description
 *
 * @example
 * ```tsx
 * <ActivityTable data={activities} />
 * ```
 */
export function ActivityTable({ data }: ActivityTableProps) {
    return (
        <DataTable columns={columns} data={data} searchKey="description" searchPlaceholder="Search activity..." />
    )
}
