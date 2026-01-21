'use client'

import { useState, useEffect } from 'react'
import { useDatasetList } from '@/lib/hooks/queries/use-dataset-list'
import { Dataset, JoinTableConfig } from '@/types/dataset'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table2, Plus, Trash2 } from 'lucide-react'

interface JoinStepTablesProps {
    baseDatasetId: string | null
    joinTables: JoinTableConfig[]
    onChange: (baseId: string | null, joinTables: JoinTableConfig[]) => void
}

const MAX_JOIN_TABLES = 4 // Base + 4 = 5 total tables

/**
 * Step 1: Multi-table selection component
 * Allows users to select base dataset and multiple join tables (up to 5 total)
 */
export function JoinStepTables({
    baseDatasetId,
    joinTables,
    onChange,
}: JoinStepTablesProps) {
    const { data, isLoading, isError } = useDatasetList(1, 100)
    const [baseDataset, setBaseDataset] = useState<Dataset | null>(null)

    // Update base dataset when ID changes
    useEffect(() => {
        if (data?.datasets && baseDatasetId) {
            const base = data.datasets.find((d) => d.id === baseDatasetId) || null
            setBaseDataset(base)
        } else {
            setBaseDataset(null)
        }
    }, [baseDatasetId, data])

    const handleBaseChange = (datasetId: string) => {
        onChange(datasetId, joinTables)
    }

    const handleAddJoinTable = () => {
        if (joinTables.length >= MAX_JOIN_TABLES) return

        const newTable: JoinTableConfig = {
            datasetId: '',
            joinType: 'inner',
            conditions: [],
        }
        onChange(baseDatasetId, [...joinTables, newTable])
    }

    const handleRemoveJoinTable = (index: number) => {
        const updated = joinTables.filter((_, i) => i !== index)
        onChange(baseDatasetId, updated)
    }

    const handleJoinTableDatasetChange = (index: number, datasetId: string) => {
        const updated = joinTables.map((table, i) =>
            i === index ? { ...table, datasetId: datasetId } : table
        )
        onChange(baseDatasetId, updated)
    }

    const getDatasetById = (id: string): Dataset | null => {
        return data?.datasets?.find((d) => d.id === id) || null
    }

    // Get selected dataset IDs to exclude from options
    const getSelectedIds = (): Set<string> => {
        const ids = new Set<string>()
        if (baseDatasetId) ids.add(baseDatasetId)
        joinTables.forEach((t) => {
            if (t.datasetId) ids.add(t.datasetId)
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

    const availableDatasets = data.datasets || []
    const selectedIds = getSelectedIds()

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
                            value={baseDatasetId || undefined}
                            onValueChange={handleBaseChange}
                        >
                            <SelectTrigger id="base-dataset">
                                <SelectValue placeholder="Select a dataset" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableDatasets
                                    .filter((d) => !selectedIds.has(d.id) || d.id === baseDatasetId)
                                    .map((dataset) => (
                                        <SelectItem key={dataset.id} value={dataset.id}>
                                            {dataset.displayName} ({dataset.rowCount} rows)
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {baseDataset && (
                        <div className="mt-4 space-y-3">
                            <div>
                                <p className="text-sm font-medium mb-1">Description</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {baseDataset.description || 'No description'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium mb-2">
                                    Columns ({baseDataset.columns.length})
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {baseDataset.columns
                                        .sort((a, b) => a.columnOrder - b.columnOrder)
                                        .map((col) => (
                                            <Badge key={col.id} variant="secondary" className="text-xs">
                                                {col.displayName}
                                                <span className="ml-1 text-gray-500">
                                                    ({col.dataType})
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
            {joinTables.map((joinTable, index) => {
                const dataset = joinTable.datasetId
                    ? getDatasetById(joinTable.datasetId)
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
                                    onClick={() => handleRemoveJoinTable(index)}
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
                                    value={joinTable.datasetId || undefined}
                                    onValueChange={(id) =>
                                        handleJoinTableDatasetChange(index, id)
                                    }
                                    disabled={!baseDatasetId}
                                >
                                    <SelectTrigger id={`join-dataset-${index}`}>
                                        <SelectValue
                                            placeholder={
                                                baseDatasetId
                                                    ? 'Select a dataset'
                                                    : 'Select base table first'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableDatasets
                                            .filter(
                                                (d) =>
                                                    !selectedIds.has(d.id) ||
                                                    d.id === joinTable.datasetId
                                            )
                                            .map((ds) => (
                                                <SelectItem key={ds.id} value={ds.id}>
                                                    {ds.displayName} ({ds.rowCount} rows)
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
                                                .sort((a, b) => a.columnOrder - b.columnOrder)
                                                .map((col) => (
                                                    <Badge
                                                        key={col.id}
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        {col.displayName}
                                                        <span className="ml-1 text-gray-500">
                                                            ({col.dataType})
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
            {baseDatasetId && joinTables.length < MAX_JOIN_TABLES && (
                <Button
                    variant="outline"
                    onClick={handleAddJoinTable}
                    className="w-full"
                    disabled={availableDatasets.length <= selectedIds.size}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Join Table ({joinTables.length + 1}/{MAX_JOIN_TABLES + 1} tables)
                </Button>
            )}

            {/* Hint for empty state */}
            {baseDatasetId && joinTables.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>Click "Add Join Table" to add datasets to join</p>
                </div>
            )}
        </div>
    )
}
