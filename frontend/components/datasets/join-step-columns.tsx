'use client'

import { Dataset } from '@/types/dataset'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Columns, Check, X } from 'lucide-react'
import { use_dataset_list } from '@/lib/hooks/queries/use-dataset-list'
import { useEffect, useState } from 'react'

interface JoinStepColumnsProps {
    left_dataset_id: string | null
    right_dataset_id: string | null
    selected_columns: string[]
    on_change: (columns: string[]) => void
}

/**
 * Step 4: Result columns selection component
 * Allows users to select which columns to include in the join result
 */
export function JoinStepColumns({
    left_dataset_id,
    right_dataset_id,
    selected_columns,
    on_change,
}: JoinStepColumnsProps) {
    const { data } = use_dataset_list(1, 100)
    const [left_dataset, set_left_dataset] = useState<Dataset | null>(null)
    const [right_dataset, set_right_dataset] = useState<Dataset | null>(null)

    // Update datasets when IDs change
    useEffect(() => {
        if (data?.datasets) {
            const left = data.datasets.find((d) => d.id === left_dataset_id) || null
            const right = data.datasets.find((d) => d.id === right_dataset_id) || null
            set_left_dataset(left)
            set_right_dataset(right)

            // Auto-select all columns on first load
            if (selected_columns.length === 0 && left && right) {
                const all_columns = [
                    ...left.columns.map((c) => c.column_name),
                    ...right.columns.map((c) => c.column_name),
                ]
                on_change(all_columns)
            }
        }
    }, [left_dataset_id, right_dataset_id, data])

    if (!left_dataset || !right_dataset) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                        Please select both left and right tables first
                    </p>
                </CardContent>
            </Card>
        )
    }

    const left_columns = left_dataset.columns.sort((a, b) => a.column_order - b.column_order)
    const right_columns = right_dataset.columns.sort((a, b) => a.column_order - b.column_order)

    const all_left_column_names = left_columns.map((c) => c.column_name)
    const all_right_column_names = right_columns.map((c) => c.column_name)
    const all_column_names = [...all_left_column_names, ...all_right_column_names]

    const is_left_all_selected = all_left_column_names.every((name) => selected_columns.includes(name))
    const is_right_all_selected = all_right_column_names.every((name) => selected_columns.includes(name))
    const is_all_selected = selected_columns.length === all_column_names.length

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

    const toggle_left_all = () => {
        if (is_left_all_selected) {
            on_change(selected_columns.filter((c) => !all_left_column_names.includes(c)))
        } else {
            const new_selection = new Set([...selected_columns, ...all_left_column_names])
            on_change(Array.from(new_selection))
        }
    }

    const toggle_right_all = () => {
        if (is_right_all_selected) {
            on_change(selected_columns.filter((c) => !all_right_column_names.includes(c)))
        } else {
            const new_selection = new Set([...selected_columns, ...all_right_column_names])
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
                            <CardDescription>Choose which columns to include in the join result</CardDescription>
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
                    {/* Left Table Columns */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-sm">Left Table</h3>
                                <Badge variant="outline">{left_dataset.display_name}</Badge>
                            </div>
                            <Button variant="ghost" size="sm" onClick={toggle_left_all}>
                                {is_left_all_selected ? 'Deselect All' : 'Select All'}
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {left_columns.map((col) => {
                                const is_checked = selected_columns.includes(col.column_name)
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
                                        onClick={() => toggle_column(col.column_name)}
                                    >
                                        <Checkbox
                                            id={`left-${col.column_name}`}
                                            checked={is_checked}
                                            onCheckedChange={() => toggle_column(col.column_name)}
                                        />
                                        <Label
                                            htmlFor={`left-${col.column_name}`}
                                            className="flex-1 cursor-pointer"
                                        >
                                            <div className="font-medium text-sm">{col.display_name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {col.data_type}
                                            </div>
                                        </Label>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Right Table Columns */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-sm">Right Table</h3>
                                <Badge variant="outline">{right_dataset.display_name}</Badge>
                            </div>
                            <Button variant="ghost" size="sm" onClick={toggle_right_all}>
                                {is_right_all_selected ? 'Deselect All' : 'Select All'}
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {right_columns.map((col) => {
                                const is_checked = selected_columns.includes(col.column_name)
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
                                        onClick={() => toggle_column(col.column_name)}
                                    >
                                        <Checkbox
                                            id={`right-${col.column_name}`}
                                            checked={is_checked}
                                            onCheckedChange={() => toggle_column(col.column_name)}
                                        />
                                        <Label
                                            htmlFor={`right-${col.column_name}`}
                                            className="flex-1 cursor-pointer"
                                        >
                                            <div className="font-medium text-sm">{col.display_name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {col.data_type}
                                            </div>
                                        </Label>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
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
