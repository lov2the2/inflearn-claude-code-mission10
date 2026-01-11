'use client'

import { useState } from 'react'
import { JoinQueryResponse } from '@/types/dataset'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DynamicDataTable } from './dynamic-data-table'
import { Download, Table, AlertCircle } from 'lucide-react'

interface JoinResultProps {
    result: JoinQueryResponse | null
    is_loading: boolean
    is_error: boolean
    on_export: () => void
    is_exporting: boolean
}

/**
 * Join result display component
 * Shows the joined data in a table with export functionality
 */
export function JoinResult({
    result,
    is_loading,
    is_error,
    on_export,
    is_exporting,
}: JoinResultProps) {
    const [current_page, set_current_page] = useState(1)
    const ROWS_PER_PAGE = 10

    if (is_loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Table className="h-5 w-5" />
                        Join Result
                    </CardTitle>
                    <CardDescription>Loading join result...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                </CardContent>
            </Card>
        )
    }

    if (is_error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertCircle className="h-5 w-5" />
                        Error
                    </CardTitle>
                    <CardDescription>Failed to execute join query</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Please check your join conditions and try again
                    </p>
                </CardContent>
            </Card>
        )
    }

    if (!result) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Table className="h-5 w-5" />
                        Join Result
                    </CardTitle>
                    <CardDescription>Execute the join query to see results</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        No results yet. Click "Execute Join" to run the query.
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Paginate rows
    const total_rows = result.rows.length
    const total_pages = Math.ceil(total_rows / ROWS_PER_PAGE)
    const start_index = (current_page - 1) * ROWS_PER_PAGE
    const end_index = start_index + ROWS_PER_PAGE
    const paginated_rows = result.rows.slice(start_index, end_index)

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Table className="h-5 w-5" />
                                Join Result
                            </CardTitle>
                            <CardDescription>
                                {total_rows.toLocaleString()} rows • {result.columns.length} columns
                            </CardDescription>
                        </div>
                        <Button onClick={on_export} disabled={is_exporting || total_rows === 0}>
                            <Download className="h-4 w-4 mr-2" />
                            {is_exporting ? 'Exporting...' : 'Export CSV'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {total_rows > 0 ? (
                        <DynamicDataTable
                            columns={result.columns}
                            rows={paginated_rows}
                            current_page={current_page}
                            total_pages={total_pages}
                            on_page_change={set_current_page}
                        />
                    ) : (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            No matching rows found for the specified join conditions
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Query Summary */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="space-y-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Rows</p>
                            <p className="text-2xl font-bold">{total_rows.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Columns</p>
                            <p className="text-2xl font-bold">{result.columns.length}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Current Page</p>
                            <p className="text-2xl font-bold">
                                {current_page} / {total_pages}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Rows Per Page</p>
                            <p className="text-2xl font-bold">{ROWS_PER_PAGE}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
