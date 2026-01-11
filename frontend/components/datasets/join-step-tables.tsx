'use client'

import { useState, useEffect } from 'react'
import { use_dataset_list } from '@/lib/hooks/queries/use-dataset-list'
import { Dataset } from '@/types/dataset'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table2 } from 'lucide-react'

interface JoinStepTablesProps {
    left_dataset_id: string | null
    right_dataset_id: string | null
    on_change: (left_id: string | null, right_id: string | null) => void
}

/**
 * Step 1: Table selection component
 * Allows users to select left and right datasets for join operation
 */
export function JoinStepTables({
    left_dataset_id,
    right_dataset_id,
    on_change,
}: JoinStepTablesProps) {
    const { data, isLoading, isError } = use_dataset_list(1, 100)
    const [left_dataset, set_left_dataset] = useState<Dataset | null>(null)
    const [right_dataset, set_right_dataset] = useState<Dataset | null>(null)

    // Update selected datasets when IDs change
    useEffect(() => {
        if (data?.datasets) {
            const left = data.datasets.find((d) => d.id === left_dataset_id) || null
            const right = data.datasets.find((d) => d.id === right_dataset_id) || null
            set_left_dataset(left)
            set_right_dataset(right)
        }
    }, [left_dataset_id, right_dataset_id, data])

    const handle_left_change = (dataset_id: string) => {
        on_change(dataset_id, right_dataset_id)
    }

    const handle_right_change = (dataset_id: string) => {
        on_change(left_dataset_id, dataset_id)
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            </div>
        )
    }

    if (isError || !data) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600 dark:text-red-400">Failed to load datasets</p>
            </div>
        )
    }

    const available_datasets = data.datasets || []
    const left_options = available_datasets.filter((d) => d.id !== right_dataset_id)
    const right_options = available_datasets.filter((d) => d.id !== left_dataset_id)

    return (
        <div className="space-y-6">
            {/* Left Dataset Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Table2 className="h-5 w-5" />
                        Left Table
                    </CardTitle>
                    <CardDescription>Select the first dataset for the join operation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="left-dataset">Dataset</Label>
                        <Select value={left_dataset_id || undefined} onValueChange={handle_left_change}>
                            <SelectTrigger id="left-dataset">
                                <SelectValue placeholder="Select a dataset" />
                            </SelectTrigger>
                            <SelectContent>
                                {left_options.map((dataset) => (
                                    <SelectItem key={dataset.id} value={dataset.id}>
                                        {dataset.display_name} ({dataset.row_count} rows)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {left_dataset && (
                        <div className="mt-4 space-y-3">
                            <div>
                                <p className="text-sm font-medium mb-1">Description</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {left_dataset.description || 'No description'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium mb-2">Columns ({left_dataset.columns.length})</p>
                                <div className="flex flex-wrap gap-2">
                                    {left_dataset.columns
                                        .sort((a, b) => a.column_order - b.column_order)
                                        .map((col) => (
                                            <Badge key={col.id} variant="secondary" className="text-xs">
                                                {col.display_name}
                                                <span className="ml-1 text-gray-500">({col.data_type})</span>
                                            </Badge>
                                        ))}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Right Dataset Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Table2 className="h-5 w-5" />
                        Right Table
                    </CardTitle>
                    <CardDescription>Select the second dataset for the join operation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="right-dataset">Dataset</Label>
                        <Select
                            value={right_dataset_id || undefined}
                            onValueChange={handle_right_change}
                            disabled={!left_dataset_id}
                        >
                            <SelectTrigger id="right-dataset">
                                <SelectValue placeholder={left_dataset_id ? "Select a dataset" : "Select left table first"} />
                            </SelectTrigger>
                            <SelectContent>
                                {right_options.map((dataset) => (
                                    <SelectItem key={dataset.id} value={dataset.id}>
                                        {dataset.display_name} ({dataset.row_count} rows)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {right_dataset && (
                        <div className="mt-4 space-y-3">
                            <div>
                                <p className="text-sm font-medium mb-1">Description</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {right_dataset.description || 'No description'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium mb-2">Columns ({right_dataset.columns.length})</p>
                                <div className="flex flex-wrap gap-2">
                                    {right_dataset.columns
                                        .sort((a, b) => a.column_order - b.column_order)
                                        .map((col) => (
                                            <Badge key={col.id} variant="secondary" className="text-xs">
                                                {col.display_name}
                                                <span className="ml-1 text-gray-500">({col.data_type})</span>
                                            </Badge>
                                        ))}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
