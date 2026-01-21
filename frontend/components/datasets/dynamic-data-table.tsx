'use client'

import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DatasetColumn } from '@/types/dataset'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import { format } from 'date-fns'

interface DynamicDataTableProps {
    columns: DatasetColumn[]
    rows: Record<string, any>[]
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    isLoading?: boolean
}

/**
 * Dynamic data table component for dataset rows
 * Renders columns dynamically based on DatasetColumn metadata with type-specific formatting
 */
export function DynamicDataTable({
    columns,
    rows,
    currentPage,
    totalPages,
    onPageChange,
    isLoading = false,
}: DynamicDataTableProps) {
    /**
     * Format cell value based on column data type
     */
    const formatCellValue = (value: any, dataType: string) => {
        if (value === null || value === undefined) {
            return <span className="text-gray-400 italic">NULL</span>
        }

        switch (dataType) {
            case 'boolean':
                return value ? (
                    <Check className="h-4 w-4 text-green-600" />
                ) : (
                    <X className="h-4 w-4 text-red-600" />
                )

            case 'integer':
            case 'numeric':
                return (
                    <span className="font-mono text-right block">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </span>
                )

            case 'timestamp':
                try {
                    const date = new Date(value)
                    return (
                        <span className="text-sm">
                            {format(date, 'yyyy-MM-dd HH:mm:ss')}
                        </span>
                    )
                } catch {
                    return <span>{String(value)}</span>
                }

            case 'text':
            default:
                return <span className="break-words">{String(value)}</span>
        }
    }

    /**
     * Sort columns by columnOrder
     */
    const sortedColumns = useMemo(() => {
        return [...columns].sort((a, b) => a.columnOrder - b.columnOrder)
    }, [columns])

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {sortedColumns.map((col) => (
                                    <TableHead key={col.id}>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    {sortedColumns.map((col) => (
                                        <TableCell key={col.id}>
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {sortedColumns.map((col) => (
                                <TableHead key={col.id} className="whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{col.displayName}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                                            {col.dataType}
                                            {!col.nullable && ' (NOT NULL)'}
                                        </span>
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.length > 0 ? (
                            rows.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {sortedColumns.map((col) => (
                                        <TableCell key={col.id} className="align-top">
                                            {formatCellValue(row[col.columnName], col.dataType)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={sortedColumns.length}
                                    className="h-24 text-center text-gray-500 dark:text-gray-400"
                                >
                                    No data available
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
