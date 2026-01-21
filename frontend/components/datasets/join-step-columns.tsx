'use client'

import { Dataset } from '@/types/dataset'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Columns, Check, X } from 'lucide-react'
import { use_dataset_list } from '@/lib/hooks/queries/use-dataset-list'
import { useEffect, useState, useMemo } from 'react'

interface JoinStepColumnsProps {
    dataset_ids: string[]
    selected_columns: string[]
    on_change: (columns: string[]) => void
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
    dataset_ids,
    selected_columns,
    on_change,
}: JoinStepColumnsProps) {
    const { data } = use_dataset_list(1, 100)
    const [initialized, set_initialized] = useState(false)

    // Get datasets with columns
    const datasets_with_columns = useMemo<DatasetWithColumns[]>(() => {
        if (!data?.datasets) return []

        return dataset_ids
            .map((id) => {
                const dataset = data.datasets.find((d) => d.id === id)
                if (!dataset) return null
                return {
                    dataset,
                    columns: dataset.columns.sort((a, b) => a.columnOrder - b.columnOrder),
                }
            })
            .filter((d): d is DatasetWithColumns => d !== null)
    }, [dataset_ids, data])

    // Get all column names
    const all_column_names = useMemo(() => {
        return datasets_with_columns.flatMap((d) => d.columns.map((c) => c.columnName))
    }, [datasets_with_columns])

    // Auto-select all columns on first load
    useEffect(() => {
        if (!initialized && datasets_with_columns.length > 0 && selected_columns.length === 0) {
            on_change(all_column_names)
            set_initialized(true)
        }
    }, [datasets_with_columns, initialized, selected_columns.length, all_column_names])

    if (datasets_with_columns.length === 0) {
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

    const is_all_selected = selected_columns.length === all_column_names.length

    const get_table_column_names = (dataset_index: number): string[] => {
        return datasets_with_columns[dataset_index]?.columns.map((c) => c.columnName) || []
    }

    const is_table_all_selected = (dataset_index: number): boolean => {
        const table_columns = get_table_column_names(dataset_index)
        return table_columns.every((name) => selected_columns.includes(name))
    }

    const toggle_column = (column_name: string) => {
        if (selected_columns.includes(column_name)) {
            on_change(selected_columns.filter((c) => c !== column_name))
        } else {
            on_change([...selected_columns, column_name])
        }
    }

    const toggle_all = () => {
        if (is_all_selected) {
            on_change([])
        } else {
            on_change(all_column_names)
        }
    }

    const toggle_table_all = (dataset_index: number) => {
        const table_columns = get_table_column_names(dataset_index)
        if (is_table_all_selected(dataset_index)) {
            on_change(selected_columns.filter((c) => !table_columns.includes(c)))
        } else {
            const new_selection = new Set([...selected_columns, ...table_columns])
            on_change(Array.from(new_selection))
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
                        <Button variant="outline" onClick={toggle_all}>
                            {is_all_selected ? (
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
                    {datasets_with_columns.map((dataset_with_cols, dataset_index) => {
                        const { dataset, columns } = dataset_with_cols
                        const is_base = dataset_index === 0

                        return (
                            <div key={dataset.id} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-sm">
                                            {is_base ? 'Base Table' : `Join Table ${dataset_index}`}
                                        </h3>
                                        <Badge variant="outline">{dataset.displayName}</Badge>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggle_table_all(dataset_index)}
                                    >
                                        {is_table_all_selected(dataset_index)
                                            ? 'Deselect All'
                                            : 'Select All'}
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {columns.map((col) => {
                                        const is_checked = selected_columns.includes(col.columnName)
                                        return (
                                            <div
                                                key={col.id}
                                                className={`
                                                    flex items-center space-x-2 p-3 rounded-md border cursor-pointer
                                                    transition-colors duration-200
                                                    ${
                                                        is_checked
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                    }
                                                `}
                                                onClick={() => toggle_column(col.columnName)}
                                            >
                                                <Checkbox
                                                    id={`${dataset.id}-${col.columnName}`}
                                                    checked={is_checked}
                                                    onCheckedChange={() =>
                                                        toggle_column(col.columnName)
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
                            {selected_columns.length} / {all_column_names.length}
                        </Badge>
                    </div>
                    {selected_columns.length === 0 && (
                        <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                            Please select at least one column
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
