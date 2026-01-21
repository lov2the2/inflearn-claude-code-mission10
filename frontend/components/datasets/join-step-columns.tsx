'use client'

import { Dataset } from '@/types/dataset'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Columns, Check, X } from 'lucide-react'
import { useDatasetList } from '@/lib/hooks/queries/use-dataset-list'
import { useEffect, useState, useMemo } from 'react'

interface JoinStepColumnsProps {
    datasetIds: string[]
    selectedColumns: string[]
    onChange: (columns: string[]) => void
}

interface DatasetWithColumns {
    dataset: Dataset
    columns: Dataset['columns']
}

/**
 * Step 4: Result columns selection component
 * Allows users to select which columns to include in the join result (multi-table)
 */
export function JoinStepColumns({
    datasetIds,
    selectedColumns,
    onChange,
}: JoinStepColumnsProps) {
    const { data } = useDatasetList(1, 100)
    const [initialized, setInitialized] = useState(false)

    // Get datasets with columns
    const datasetsWithColumns = useMemo<DatasetWithColumns[]>(() => {
        if (!data?.datasets) return []

        return datasetIds
            .map((id) => {
                const dataset = data.datasets.find((d) => d.id === id)
                if (!dataset) return null
                return {
                    dataset,
                    columns: dataset.columns.sort((a, b) => a.columnOrder - b.columnOrder),
                }
            })
            .filter((d): d is DatasetWithColumns => d !== null)
    }, [datasetIds, data])

    // Get all column names
    const allColumnNames = useMemo(() => {
        return datasetsWithColumns.flatMap((d) => d.columns.map((c) => c.columnName))
    }, [datasetsWithColumns])

    // Auto-select all columns on first load
    useEffect(() => {
        if (!initialized && datasetsWithColumns.length > 0 && selectedColumns.length === 0) {
            onChange(allColumnNames)
            setInitialized(true)
        }
    }, [datasetsWithColumns, initialized, selectedColumns.length, allColumnNames])

    if (datasetsWithColumns.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                        Please select tables first
                    </p>
                </CardContent>
            </Card>
        )
    }

    const isAllSelected = selectedColumns.length === allColumnNames.length

    const getTableColumnNames = (datasetIndex: number): string[] => {
        return datasetsWithColumns[datasetIndex]?.columns.map((c) => c.columnName) || []
    }

    const isTableAllSelected = (datasetIndex: number): boolean => {
        const tableColumns = getTableColumnNames(datasetIndex)
        return tableColumns.every((name) => selectedColumns.includes(name))
    }

    const toggleColumn = (columnName: string) => {
        if (selectedColumns.includes(columnName)) {
            onChange(selectedColumns.filter((c) => c !== columnName))
        } else {
            onChange([...selectedColumns, columnName])
        }
    }

    const toggleAll = () => {
        if (isAllSelected) {
            onChange([])
        } else {
            onChange(allColumnNames)
        }
    }

    const toggleTableAll = (datasetIndex: number) => {
        const tableColumns = getTableColumnNames(datasetIndex)
        if (isTableAllSelected(datasetIndex)) {
            onChange(selectedColumns.filter((c) => !tableColumns.includes(c)))
        } else {
            const newSelection = new Set([...selectedColumns, ...tableColumns])
            onChange(Array.from(newSelection))
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Columns className="h-5 w-5" />
                                Select Result Columns
                            </CardTitle>
                            <CardDescription>
                                Choose which columns to include in the join result
                            </CardDescription>
                        </div>
                        <Button variant="outline" onClick={toggleAll}>
                            {isAllSelected ? (
                                <>
                                    <X className="h-4 w-4 mr-2" />
                                    Deselect All
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Select All
                                </>
                            )}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {datasetsWithColumns.map((datasetWithCols, datasetIndex) => {
                        const { dataset, columns } = datasetWithCols
                        const isBase = datasetIndex === 0

                        return (
                            <div key={dataset.id} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-sm">
                                            {isBase ? 'Base Table' : `Join Table ${datasetIndex}`}
                                        </h3>
                                        <Badge variant="outline">{dataset.displayName}</Badge>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleTableAll(datasetIndex)}
                                    >
                                        {isTableAllSelected(datasetIndex)
                                            ? 'Deselect All'
                                            : 'Select All'}
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {columns.map((col) => {
                                        const isChecked = selectedColumns.includes(col.columnName)
                                        return (
                                            <div
                                                key={col.id}
                                                className={`
                                                    flex items-center space-x-2 p-3 rounded-md border cursor-pointer
                                                    transition-colors duration-200
                                                    ${
                                                        isChecked
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                    }
                                                `}
                                                onClick={() => toggleColumn(col.columnName)}
                                            >
                                                <Checkbox
                                                    id={`${dataset.id}-${col.columnName}`}
                                                    checked={isChecked}
                                                    onCheckedChange={() =>
                                                        toggleColumn(col.columnName)
                                                    }
                                                />
                                                <Label
                                                    htmlFor={`${dataset.id}-${col.columnName}`}
                                                    className="flex-1 cursor-pointer"
                                                >
                                                    <div className="font-medium text-sm">
                                                        {col.displayName}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {col.dataType}
                                                    </div>
                                                </Label>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>

            {/* Summary */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Selected Columns</span>
                        <Badge variant="secondary">
                            {selectedColumns.length} / {allColumnNames.length}
                        </Badge>
                    </div>
                    {selectedColumns.length === 0 && (
                        <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                            Please select at least one column
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
