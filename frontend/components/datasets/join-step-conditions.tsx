'use client'

import { Dataset, JoinCondition } from '@/types/dataset'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Link } from 'lucide-react'
import { use_dataset_list } from '@/lib/hooks/queries/use-dataset-list'
import { useEffect, useState } from 'react'

interface JoinStepConditionsProps {
    left_dataset_id: string | null
    right_dataset_id: string | null
    conditions: JoinCondition[]
    on_change: (conditions: JoinCondition[]) => void
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
 * Allows users to define join conditions with multiple criteria
 */
export function JoinStepConditions({
    left_dataset_id,
    right_dataset_id,
    conditions,
    on_change,
}: JoinStepConditionsProps) {
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
        }
    }, [left_dataset_id, right_dataset_id, data])

    // Initialize with one empty condition if none exist
    useEffect(() => {
        if (conditions.length === 0 && left_dataset && right_dataset) {
            add_condition()
        }
    }, [left_dataset, right_dataset])

    const add_condition = () => {
        const new_condition: JoinCondition = {
            left_column: '',
            operator: '=',
            right_column: '',
        }
        on_change([...conditions, new_condition])
    }

    const remove_condition = (index: number) => {
        const updated = conditions.filter((_, i) => i !== index)
        on_change(updated)
    }

    const update_condition = (index: number, field: keyof JoinCondition, value: string) => {
        const updated = [...conditions]
        updated[index] = { ...updated[index], [field]: value }
        on_change(updated)
    }

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

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Link className="h-5 w-5" />
                        Join Conditions
                    </CardTitle>
                    <CardDescription>
                        Define how rows should be matched between the two tables
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {conditions.map((condition, index) => (
                        <div key={index} className="space-y-4">
                            {index > 0 && (
                                <div className="flex items-center justify-center py-2">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                        AND
                                    </span>
                                </div>
                            )}

                            <div className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
                                {/* Left Column */}
                                <div className="col-span-12 sm:col-span-4 space-y-2">
                                    <Label htmlFor={`left-column-${index}`} className="text-xs">
                                        Left Table Column
                                    </Label>
                                    <Select
                                        value={condition.left_column}
                                        onValueChange={(value) => update_condition(index, 'left_column', value)}
                                    >
                                        <SelectTrigger id={`left-column-${index}`}>
                                            <SelectValue placeholder="Select column" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {left_columns.map((col) => (
                                                <SelectItem key={col.id} value={col.column_name}>
                                                    {col.display_name}
                                                    <span className="ml-1 text-xs text-gray-500">
                                                        ({col.data_type})
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Operator */}
                                <div className="col-span-12 sm:col-span-3 space-y-2">
                                    <Label htmlFor={`operator-${index}`} className="text-xs">
                                        Operator
                                    </Label>
                                    <Select
                                        value={condition.operator}
                                        onValueChange={(value) =>
                                            update_condition(index, 'operator', value as JoinCondition['operator'])
                                        }
                                    >
                                        <SelectTrigger id={`operator-${index}`}>
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
                                    <Label htmlFor={`right-column-${index}`} className="text-xs">
                                        Right Table Column
                                    </Label>
                                    <Select
                                        value={condition.right_column}
                                        onValueChange={(value) => update_condition(index, 'right_column', value)}
                                    >
                                        <SelectTrigger id={`right-column-${index}`}>
                                            <SelectValue placeholder="Select column" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {right_columns.map((col) => (
                                                <SelectItem key={col.id} value={col.column_name}>
                                                    {col.display_name}
                                                    <span className="ml-1 text-xs text-gray-500">
                                                        ({col.data_type})
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
                                        onClick={() => remove_condition(index)}
                                        disabled={conditions.length === 1}
                                        className="w-full sm:w-auto"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add Condition Button */}
                    <Button type="button" variant="outline" onClick={add_condition} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Condition
                    </Button>

                    {/* Validation Messages */}
                    {conditions.some((c) => !c.left_column || !c.right_column) && (
                        <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md">
                            Please fill in all condition fields before proceeding
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <p className="font-medium text-gray-900 dark:text-gray-100">Tips:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Multiple conditions are combined with AND logic</li>
                            <li>Typically, you join on columns with matching values (use = operator)</li>
                            <li>Ensure column data types are compatible for comparison</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
