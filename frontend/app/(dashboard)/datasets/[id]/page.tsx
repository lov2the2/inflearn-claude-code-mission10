'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { datasetsApi } from '@/lib/api/datasets'
import { use_dataset_data } from '@/lib/hooks/queries/use-dataset-data'
import { query_keys } from '@/lib/query/keys'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DynamicDataTable } from '@/components/datasets/dynamic-data-table'
import {
    ArrowLeft,
    Database,
    FileText,
    Calendar,
    Download,
    GitMerge,
    Table as TableIcon,
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function DatasetDetailPage() {
    const params = useParams()
    const router = useRouter()
    const dataset_id = params.id as string

    const [current_page, set_current_page] = useState(1)
    const page_size = 50

    // Fetch dataset metadata
    const {
        data: dataset,
        isLoading: is_loading_metadata,
        error: metadata_error,
    } = useQuery({
        queryKey: query_keys.datasets.detail(dataset_id),
        queryFn: () => datasetsApi.getDataset(dataset_id),
        enabled: !!dataset_id,
    })

    // Fetch dataset data with pagination
    const {
        data: dataset_data,
        isLoading: is_loading_data,
        error: data_error,
    } = use_dataset_data(dataset_id, current_page, page_size)

    /**
     * Handle CSV export
     */
    const handle_export = async () => {
        try {
            const blob = await datasetsApi.exportDataset(dataset_id)
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${dataset?.display_name || 'dataset'}_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            toast.success('Dataset exported successfully')
        } catch (error) {
            console.error('Export error:', error)
            toast.error('Failed to export dataset')
        }
    }

    /**
     * Navigate to join builder with this dataset pre-selected
     */
    const handle_join = () => {
        router.push(`/datasets/join?left=${dataset_id}`)
    }

    const total_pages = dataset_data ? Math.ceil(dataset_data.total / page_size) : 1

    // Loading state
    if (is_loading_metadata) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="grid gap-6 md:grid-cols-2">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    // Error state
    if (metadata_error || data_error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Database className="h-16 w-16 text-gray-400" />
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Failed to load dataset
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {metadata_error?.message || data_error?.message || 'An error occurred'}
                    </p>
                </div>
                <Button onClick={() => router.push('/datasets')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Datasets
                </Button>
            </div>
        )
    }

    if (!dataset) {
        return null
    }

    const file_size_mb = (dataset.file_size_bytes / (1024 * 1024)).toFixed(2)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/datasets')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div className="flex items-center space-x-3">
                        <Database className="h-8 w-8 text-blue-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {dataset.display_name}
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {dataset.description || 'No description'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handle_join}>
                        <GitMerge className="h-4 w-4 mr-2" />
                        Join Data
                    </Button>
                    <Button onClick={handle_export}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Metadata Cards */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Dataset Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <span>Dataset Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">Table Name</p>
                                <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mt-1">
                                    {dataset.dynamic_table_name}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">File Size</p>
                                <p className="font-semibold mt-1">{file_size_mb} MB</p>
                            </div>
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">Total Rows</p>
                                <p className="font-semibold mt-1">{dataset.row_count.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">Total Columns</p>
                                <p className="font-semibold mt-1">{dataset.columns.length}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t space-y-2">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>Created: {format(new Date(dataset.created_at), 'PPp')}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>Updated: {format(new Date(dataset.updated_at), 'PPp')}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Column Schema */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <TableIcon className="h-5 w-5 text-blue-600" />
                            <span>Column Schema</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {dataset.columns
                                .sort((a, b) => a.column_order - b.column_order)
                                .map((col) => (
                                    <div
                                        key={col.id}
                                        className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{col.display_name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                {col.column_name}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs">
                                                {col.data_type}
                                            </Badge>
                                            {!col.nullable && (
                                                <Badge variant="outline" className="text-xs">
                                                    NOT NULL
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Data Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <TableIcon className="h-5 w-5 text-blue-600" />
                        <span>Data Preview</span>
                        <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                            ({dataset_data?.total.toLocaleString() || 0} rows)
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DynamicDataTable
                        columns={dataset_data?.columns || []}
                        rows={dataset_data?.rows || []}
                        current_page={current_page}
                        total_pages={total_pages}
                        on_page_change={set_current_page}
                        is_loading={is_loading_data}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
