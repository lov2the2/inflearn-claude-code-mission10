'use client'

import { Dataset, JoinCondition, JoinTableConfig } from '@/types/dataset'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Link, AlertCircle } from 'lucide-react'
import { useDatasetList } from '@/lib/hooks/queries/use-dataset-list'
import { useEffect, useState, useMemo } from 'react'

interface JoinStepConditionsProps {
    baseDatasetId: string | null
    joinTables: JoinTableConfig[]
    onChange: (joinTables: JoinTableConfig[]) => void
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
    baseDatasetId,
    joinTables,
    onChange,
}: JoinStepConditionsProps) {
    const { data } = useDatasetList(1, 100)

    // Get dataset by ID
    const getDatasetById = (id: string | null): Dataset | null => {
        if (!id) return null
        return data?.datasets?.find((d) => d.id === id) || null
    }

    // Get all columns available for left side (base + previously joined tables)
    const getLeftColumns = (joinIndex: number): Dataset['columns'] => {
        const columns: Dataset['columns'] = []

        // Add base table columns
        const baseDataset = getDatasetById(baseDatasetId)
        if (baseDataset) {
            columns.push(...baseDataset.columns)
        }

        // Add columns from previously joined tables
        for (let i = 0; i < joinIndex; i++) {
            const joinDataset = getDatasetById(joinTables[i].datasetId)
            if (joinDataset) {
                columns.push(...joinDataset.columns)
            }
        }

        return columns.sort((a, b) => a.columnOrder - b.columnOrder)
    }

    // Get columns for the right side (the current join table)
    const getRightColumns = (joinIndex: number): Dataset['columns'] => {
        const joinDataset = getDatasetById(joinTables[joinIndex].datasetId)
        return joinDataset?.columns.sort((a, b) => a.columnOrder - b.columnOrder) || []
    }

    const addCondition = (tableIndex: number) => {
        const newCondition: JoinCondition = {
            leftColumn: '',
            operator: '=',
            rightColumn: '',
        }
        const updated = joinTables.map((table, i) =>
            i === tableIndex
                ? { ...table, conditions: [...table.conditions, newCondition] }
                : table
        )
        onChange(updated)
    }

    const removeCondition = (tableIndex: number, conditionIndex: number) => {
        const updated = joinTables.map((table, i) =>
            i === tableIndex
                ? {
                      ...table,
                      conditions: table.conditions.filter((_, ci) => ci !== conditionIndex),
                  }
                : table
        )
        onChange(updated)
    }

    const updateCondition = (
        tableIndex: number,
        conditionIndex: number,
        field: keyof JoinCondition,
        value: string
    ) => {
        const updated = joinTables.map((table, ti) =>
            ti === tableIndex
                ? {
                      ...table,
                      conditions: table.conditions.map((cond, ci) =>
                          ci === conditionIndex ? { ...cond, [field]: value } : cond
                      ),
                  }
                : table
        )
        onChange(updated)
    }

    // Initialize with one empty condition for non-cross joins
    useEffect(() => {
        const needsInit = joinTables.some(
            (table) => table.joinType !== 'cross' && table.conditions.length === 0
        )
        if (needsInit) {
            const updated = joinTables.map((table) => {
                if (table.joinType !== 'cross' && table.conditions.length === 0) {
                    return {
                        ...table,
                        conditions: [{ leftColumn: '', operator: '=' as const, rightColumn: '' }],
                    }
                }
                return table
            })
            onChange(updated)
        }
    }, [joinTables])

    if (joinTables.length === 0) {
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
            {joinTables.map((joinTable, tableIndex) => {
                const isCrossJoin = joinTable.joinType === 'cross'
                const leftColumns = getLeftColumns(tableIndex)
                const rightColumns = getRightColumns(tableIndex)
                const joinDataset = getDatasetById(joinTable.datasetId)

                return (
                    <Card key={tableIndex}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Link className="h-5 w-5" />
                                Join Table {tableIndex + 1}: {joinDataset?.displayName || 'Unknown'}
                            </CardTitle>
                            <CardDescription>
                                {isCrossJoin
                                    ? 'CROSS JOIN - No conditions needed (Cartesian product)'
                                    : `Define matching conditions for ${joinTable.joinType.toUpperCase()} JOIN`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isCrossJoin ? (
                                <div className="flex items-start gap-2 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-md">
                                    <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                        CROSS JOIN produces all possible combinations of rows from both tables.
                                        No join conditions are required.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {joinTable.conditions.map((condition, condIndex) => (
                                        <div key={condIndex} className="space-y-4">
                                            {condIndex > 0 && (
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
                                                        htmlFor={`left-column-${tableIndex}-${condIndex}`}
                                                        className="text-xs"
                                                    >
                                                        Left Side Column
                                                    </Label>
                                                    <Select
                                                        value={condition.leftColumn}
                                                        onValueChange={(value) =>
                                                            updateCondition(
                                                                tableIndex,
                                                                condIndex,
                                                                'leftColumn',
                                                                value
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger
                                                            id={`left-column-${tableIndex}-${condIndex}`}
                                                        >
                                                            <SelectValue placeholder="Select column" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {leftColumns.map((col) => (
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
                                                        htmlFor={`operator-${tableIndex}-${condIndex}`}
                                                        className="text-xs"
                                                    >
                                                        Operator
                                                    </Label>
                                                    <Select
                                                        value={condition.operator}
                                                        onValueChange={(value) =>
                                                            updateCondition(
                                                                tableIndex,
                                                                condIndex,
                                                                'operator',
                                                                value as JoinCondition['operator']
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger
                                                            id={`operator-${tableIndex}-${condIndex}`}
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
                                                        htmlFor={`right-column-${tableIndex}-${condIndex}`}
                                                        className="text-xs"
                                                    >
                                                        Join Table Column
                                                    </Label>
                                                    <Select
                                                        value={condition.rightColumn}
                                                        onValueChange={(value) =>
                                                            updateCondition(
                                                                tableIndex,
                                                                condIndex,
                                                                'rightColumn',
                                                                value
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger
                                                            id={`right-column-${tableIndex}-${condIndex}`}
                                                        >
                                                            <SelectValue placeholder="Select column" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {rightColumns.map((col) => (
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
                                                            removeCondition(tableIndex, condIndex)
                                                        }
                                                        disabled={joinTable.conditions.length === 1}
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
                                        onClick={() => addCondition(tableIndex)}
                                        className="w-full"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Another Condition
                                    </Button>

                                    {/* Validation Messages */}
                                    {joinTable.conditions.some(
                                        (c) => !c.leftColumn || !c.rightColumn
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
