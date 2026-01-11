'use client'

import { useState, useEffect } from 'react'
import { use_dataset_list } from '@/lib/hooks/queries/use-dataset-list'
import { Dataset, JoinTableConfig } from '@/types/dataset'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table2, Plus, Trash2 } from 'lucide-react'

interface JoinStepTablesProps {
    base_dataset_id: string | null
    join_tables: JoinTableConfig[]
    on_change: (base_id: string | null, join_tables: JoinTableConfig[]) => void
}

const MAX_JOIN_TABLES = 4 // Base + 4 = 5 total tables

/**
 * Step 1: Multi-table selection component
 * Allows users to select base dataset and multiple join tables (up to 5 total)
 */
export function JoinStepTables({
    base_dataset_id,
    join_tables,
    on_change,
}: JoinStepTablesProps) {
    const { data, isLoading, isError } = use_dataset_list(1, 100)
    const [base_dataset, set_base_dataset] = useState<Dataset | null>(null)

    // Update base dataset when ID changes
    useEffect(() => {
        if (data?.datasets && base_dataset_id) {
            const base = data.datasets.find((d) => d.id === base_dataset_id) || null
            set_base_dataset(base)
        } else {
            set_base_dataset(null)
        }
    }, [base_dataset_id, data])

    const handle_base_change = (dataset_id: string) => {
        on_change(dataset_id, join_tables)
    }

    const handle_add_join_table = () => {
        if (join_tables.length >= MAX_JOIN_TABLES) return

        const new_table: JoinTableConfig = {
            dataset_id: '',
            join_type: 'inner',
            conditions: [],
        }
        on_change(base_dataset_id, [...join_tables, new_table])
    }

    const handle_remove_join_table = (index: number) => {
        const updated = join_tables.filter((_, i) => i !== index)
        on_change(base_dataset_id, updated)
    }

    const handle_join_table_dataset_change = (index: number, dataset_id: string) => {
        const updated = join_tables.map((table, i) =>
            i === index ? { ...table, dataset_id } : table
        )
        on_change(base_dataset_id, updated)
    }

    const get_dataset_by_id = (id: string): Dataset | null => {
        return data?.datasets?.find((d) => d.id === id) || null
    }

    // Get selected dataset IDs to exclude from options
    const get_selected_ids = (): Set<string> => {
        const ids = new Set<string>()
        if (base_dataset_id) ids.add(base_dataset_id)
        join_tables.forEach((t) => {
            if (t.dataset_id) ids.add(t.dataset_id)
        })
        return ids
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
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
    const selected_ids = get_selected_ids()

    return (
        <div className="space-y-6">
            {/* Base Dataset Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Table2 className="h-5 w-5" />
                        Base Table
                    </CardTitle>
                    <CardDescription>
                        Select the primary dataset for the join operation
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="base-dataset">Dataset</Label>
                        <Select
                            value={base_dataset_id || undefined}
                            onValueChange={handle_base_change}
                        >
                            <SelectTrigger id="base-dataset">
                                <SelectValue placeholder="Select a dataset" />
                            </SelectTrigger>
                            <SelectContent>
                                {available_datasets
                                    .filter((d) => !selected_ids.has(d.id) || d.id === base_dataset_id)
                                    .map((dataset) => (
                                        <SelectItem key={dataset.id} value={dataset.id}>
                                            {dataset.display_name} ({dataset.row_count} rows)
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {base_dataset && (
                        <div className="mt-4 space-y-3">
                            <div>
                                <p className="text-sm font-medium mb-1">Description</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {base_dataset.description || 'No description'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium mb-2">
                                    Columns ({base_dataset.columns.length})
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {base_dataset.columns
                                        .sort((a, b) => a.column_order - b.column_order)
                                        .map((col) => (
                                            <Badge key={col.id} variant="secondary" className="text-xs">
                                                {col.display_name}
                                                <span className="ml-1 text-gray-500">
                                                    ({col.data_type})
                                                </span>
                                            </Badge>
                                        ))}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Join Tables */}
            {join_tables.map((join_table, index) => {
                const dataset = join_table.dataset_id
                    ? get_dataset_by_id(join_table.dataset_id)
                    : null

                return (
                    <Card key={index}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Table2 className="h-5 w-5" />
                                        Join Table {index + 1}
                                    </CardTitle>
                                    <CardDescription>
                                        Select a dataset to join with the base table
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handle_remove_join_table(index)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-100"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor={`join-dataset-${index}`}>Dataset</Label>
                                <Select
                                    value={join_table.dataset_id || undefined}
                                    onValueChange={(id) =>
                                        handle_join_table_dataset_change(index, id)
                                    }
                                    disabled={!base_dataset_id}
                                >
                                    <SelectTrigger id={`join-dataset-${index}`}>
                                        <SelectValue
                                            placeholder={
                                                base_dataset_id
                                                    ? 'Select a dataset'
                                                    : 'Select base table first'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {available_datasets
                                            .filter(
                                                (d) =>
                                                    !selected_ids.has(d.id) ||
                                                    d.id === join_table.dataset_id
                                            )
                                            .map((ds) => (
                                                <SelectItem key={ds.id} value={ds.id}>
                                                    {ds.display_name} ({ds.row_count} rows)
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {dataset && (
                                <div className="mt-4 space-y-3">
                                    <div>
                                        <p className="text-sm font-medium mb-1">Description</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {dataset.description || 'No description'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium mb-2">
                                            Columns ({dataset.columns.length})
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {dataset.columns
                                                .sort((a, b) => a.column_order - b.column_order)
                                                .map((col) => (
                                                    <Badge
                                                        key={col.id}
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        {col.display_name}
                                                        <span className="ml-1 text-gray-500">
                                                            ({col.data_type})
                                                        </span>
                                                    </Badge>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )
            })}

            {/* Add Join Table Button */}
            {base_dataset_id && join_tables.length < MAX_JOIN_TABLES && (
                <Button
                    variant="outline"
                    onClick={handle_add_join_table}
                    className="w-full"
                    disabled={available_datasets.length <= selected_ids.size}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Join Table ({join_tables.length + 1}/{MAX_JOIN_TABLES + 1} tables)
                </Button>
            )}

            {/* Hint for empty state */}
            {base_dataset_id && join_tables.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>Click "Add Join Table" to add datasets to join</p>
                </div>
            )}
        </div>
    )
}
