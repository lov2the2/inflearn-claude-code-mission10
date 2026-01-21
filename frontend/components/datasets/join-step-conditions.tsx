'use client'

import { Dataset, JoinCondition, JoinTableConfig } from '@/types/dataset'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Link, AlertCircle } from 'lucide-react'
import { use_dataset_list } from '@/lib/hooks/queries/use-dataset-list'
import { useEffect, useState, useMemo } from 'react'

interface JoinStepConditionsProps {
    base_dataset_id: string | null
    join_tables: JoinTableConfig[]
    on_change: (join_tables: JoinTableConfig[]) => void
}

const OPERATORS = [
    { value: '=', label: 'Equals (=)' },
    { value: '!=', label: 'Not Equals (!=)' },
    { value: '<', label: 'Less Than (<)' },
    { value: '>', label: 'Greater Than (>)' },
    { value: '<=', label: 'Less Than or Equal (<=)' },
    { value: '>=', label: 'Greater Than or Equal (>=)' },
] as const

/**
 * Step 3: Join conditions setup component
 * Allows users to define join conditions for each join table
 */
export function JoinStepConditions({
    base_dataset_id,
    join_tables,
    on_change,
}: JoinStepConditionsProps) {
    const { data } = use_dataset_list(1, 100)

    // Get dataset by ID
    const get_dataset_by_id = (id: string | null): Dataset | null => {
        if (!id) return null
        return data?.datasets?.find((d) => d.id === id) || null
    }

    // Get all columns available for left side (base + previously joined tables)
    const get_left_columns = (join_index: number): Dataset['columns'] => {
        const columns: Dataset['columns'] = []

        // Add base table columns
        const base_dataset = get_dataset_by_id(base_dataset_id)
        if (base_dataset) {
            columns.push(...base_dataset.columns)
        }

        // Add columns from previously joined tables
        for (let i = 0; i < join_index; i++) {
            const join_dataset = get_dataset_by_id(join_tables[i].dataset_id)
            if (join_dataset) {
                columns.push(...join_dataset.columns)
            }
        }

        return columns.sort((a, b) => a.columnOrder - b.columnOrder)
    }

    // Get columns for the right side (the current join table)
    const get_right_columns = (join_index: number): Dataset['columns'] => {
        const join_dataset = get_dataset_by_id(join_tables[join_index].dataset_id)
        return join_dataset?.columns.sort((a, b) => a.columnOrder - b.columnOrder) || []
    }

    const add_condition = (table_index: number) => {
        const new_condition: JoinCondition = {
            left_column: '',
            operator: '=',
            right_column: '',
        }
        const updated = join_tables.map((table, i) =>
            i === table_index
                ? { ...table, conditions: [...table.conditions, new_condition] }
                : table
        )
        on_change(updated)
    }

    const remove_condition = (table_index: number, condition_index: number) => {
        const updated = join_tables.map((table, i) =>
            i === table_index
                ? {
                      ...table,
                      conditions: table.conditions.filter((_, ci) => ci !== condition_index),
                  }
                : table
        )
        on_change(updated)
    }

    const update_condition = (
        table_index: number,
        condition_index: number,
        field: keyof JoinCondition,
        value: string
    ) => {
        const updated = join_tables.map((table, ti) =>
            ti === table_index
                ? {
                      ...table,
                      conditions: table.conditions.map((cond, ci) =>
                          ci === condition_index ? { ...cond, [field]: value } : cond
                      ),
                  }
                : table
        )
        on_change(updated)
    }

    // Initialize with one empty condition for non-cross joins
    useEffect(() => {
        const needs_init = join_tables.some(
            (table) => table.join_type !== 'cross' && table.conditions.length === 0
        )
        if (needs_init) {
            const updated = join_tables.map((table) => {
                if (table.join_type !== 'cross' && table.conditions.length === 0) {
                    return {
                        ...table,
                        conditions: [{ left_column: '', operator: '=' as const, right_column: '' }],
                    }
                }
                return table
            })
            on_change(updated)
        }
    }, [join_tables])

    if (join_tables.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400">No join tables selected</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {join_tables.map((join_table, table_index) => {
                const is_cross_join = join_table.join_type === 'cross'
                const left_columns = get_left_columns(table_index)
                const right_columns = get_right_columns(table_index)
                const join_dataset = get_dataset_by_id(join_table.dataset_id)

                return (
                    <Card key={table_index}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Link className="h-5 w-5" />
                                Join Table {table_index + 1}: {join_dataset?.displayName || 'Unknown'}
                            </CardTitle>
                            <CardDescription>
                                {is_cross_join
                                    ? 'CROSS JOIN - No conditions needed (Cartesian product)'
                                    : `Define matching conditions for ${join_table.join_type.toUpperCase()} JOIN`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {is_cross_join ? (
                                <div className="flex items-start gap-2 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-md">
                                    <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                        CROSS JOIN produces all possible combinations of rows from both tables.
                                        No join conditions are required.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {join_table.conditions.map((condition, cond_index) => (
                                        <div key={cond_index} className="space-y-4">
                                            {cond_index > 0 && (
                                                <div className="flex items-center justify-center py-2">
                                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                                        AND
                                                    </span>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                                {/* Left Column */}
                                                <div className="col-span-12 sm:col-span-4 space-y-2">
                                                    <Label
                                                        htmlFor={`left-column-${table_index}-${cond_index}`}
                                                        className="text-xs"
                                                    >
                                                        Left Side Column
                                                    </Label>
                                                    <Select
                                                        value={condition.left_column}
                                                        onValueChange={(value) =>
                                                            update_condition(
                                                                table_index,
                                                                cond_index,
                                                                'left_column',
                                                                value
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger
                                                            id={`left-column-${table_index}-${cond_index}`}
                                                        >
                                                            <SelectValue placeholder="Select column" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {left_columns.map((col) => (
                                                                <SelectItem
                                                                    key={col.id}
                                                                    value={col.columnName}
                                                                >
                                                                    {col.displayName}
                                                                    <span className="ml-1 text-xs text-gray-500">
                                                                        ({col.dataType})
                                                                    </span>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Operator */}
                                                <div className="col-span-12 sm:col-span-3 space-y-2">
                                                    <Label
                                                        htmlFor={`operator-${table_index}-${cond_index}`}
                                                        className="text-xs"
                                                    >
                                                        Operator
                                                    </Label>
                                                    <Select
                                                        value={condition.operator}
                                                        onValueChange={(value) =>
                                                            update_condition(
                                                                table_index,
                                                                cond_index,
                                                                'operator',
                                                                value as JoinCondition['operator']
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger
                                                            id={`operator-${table_index}-${cond_index}`}
                                                        >
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {OPERATORS.map((op) => (
                                                                <SelectItem key={op.value} value={op.value}>
                                                                    {op.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Right Column */}
                                                <div className="col-span-12 sm:col-span-4 space-y-2">
                                                    <Label
                                                        htmlFor={`right-column-${table_index}-${cond_index}`}
                                                        className="text-xs"
                                                    >
                                                        Join Table Column
                                                    </Label>
                                                    <Select
                                                        value={condition.right_column}
                                                        onValueChange={(value) =>
                                                            update_condition(
                                                                table_index,
                                                                cond_index,
                                                                'right_column',
                                                                value
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger
                                                            id={`right-column-${table_index}-${cond_index}`}
                                                        >
                                                            <SelectValue placeholder="Select column" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {right_columns.map((col) => (
                                                                <SelectItem
                                                                    key={col.id}
                                                                    value={col.columnName}
                                                                >
                                                                    {col.displayName}
                                                                    <span className="ml-1 text-xs text-gray-500">
                                                                        ({col.dataType})
                                                                    </span>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Remove Button */}
                                                <div className="col-span-12 sm:col-span-1 flex items-end">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            remove_condition(table_index, cond_index)
                                                        }
                                                        disabled={join_table.conditions.length === 1}
                                                        className="w-full sm:w-auto"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add Condition Button */}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => add_condition(table_index)}
                                        className="w-full"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Another Condition
                                    </Button>

                                    {/* Validation Messages */}
                                    {join_table.conditions.some(
                                        (c) => !c.left_column || !c.right_column
                                    ) && (
                                        <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md">
                                            Please fill in all condition fields before proceeding
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                )
            })}

            {/* Info Card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <p className="font-medium text-gray-900 dark:text-gray-100">Tips:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Multiple conditions within a table are combined with AND logic</li>
                            <li>Left side columns include base table and previously joined tables</li>
                            <li>Right side columns are from the table being joined</li>
                            <li>Ensure column data types are compatible for comparison</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
