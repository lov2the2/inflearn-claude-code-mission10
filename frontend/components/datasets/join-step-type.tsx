'use client'

import { JoinTableConfig } from '@/types/dataset'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Info } from 'lucide-react'

interface JoinStepTypeProps {
    joinTables: JoinTableConfig[]
    onChange: (joinTables: JoinTableConfig[]) => void
}

type JoinType = 'inner' | 'left' | 'right' | 'full' | 'cross'

const JOIN_TYPE_INFO: Record<JoinType, { title: string; description: string; example: string }> = {
    inner: {
        title: 'INNER JOIN',
        description: 'Returns only rows that have matching values in both tables',
        example: 'Only includes records that exist in both tables',
    },
    left: {
        title: 'LEFT JOIN',
        description: 'Returns all rows from the previous tables, and matched rows from this table',
        example: 'All previous records + matching records (NULL if no match)',
    },
    right: {
        title: 'RIGHT JOIN',
        description: 'Returns all rows from this table, and matched rows from previous tables',
        example: 'All records from this table + matching previous records (NULL if no match)',
    },
    full: {
        title: 'FULL OUTER JOIN',
        description: 'Returns all rows when there is a match in either table',
        example: 'All records from both tables (NULL where no match exists)',
    },
    cross: {
        title: 'CROSS JOIN',
        description: 'Returns the Cartesian product - every combination of rows',
        example: 'Every row from one table combined with every row from another (no condition needed)',
    },
}

/**
 * Step 2: Join type selection component
 * Allows users to select the type of join operation for each join table
 */
export function JoinStepType({ joinTables, onChange }: JoinStepTypeProps) {
    const handleTypeChange = (index: number, joinType: JoinType) => {
        const updated = joinTables.map((table, i) =>
            i === index ? { ...table, joinType: joinType, conditions: joinType === 'cross' ? [] : table.conditions } : table
        )
        onChange(updated)
    }

    if (joinTables.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">No join tables selected</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {joinTables.map((table, index) => (
                <Card key={index}>
                    <CardHeader>
                        <CardTitle>Join Table {index + 1} - Select Join Type</CardTitle>
                        <CardDescription>
                            Choose how this table should be joined with the previous tables
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            value={table.joinType}
                            onValueChange={(value) => handleTypeChange(index, value as JoinType)}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(Object.keys(JOIN_TYPE_INFO) as JoinType[]).map((type) => {
                                    const info = JOIN_TYPE_INFO[type]
                                    const isSelected = table.joinType === type

                                    return (
                                        <div
                                            key={type}
                                            className={`
                                                relative flex items-start space-x-3 rounded-lg border p-4 cursor-pointer
                                                transition-colors duration-200
                                                ${
                                                    isSelected
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                }
                                            `}
                                            onClick={() => handleTypeChange(index, type)}
                                        >
                                            <RadioGroupItem value={type} id={`${type}-${index}`} className="mt-1" />
                                            <div className="flex-1">
                                                <Label htmlFor={`${type}-${index}`} className="cursor-pointer">
                                                    <div className="font-semibold mb-1">{info.title}</div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                        {info.description}
                                                    </p>
                                                </Label>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </RadioGroup>

                        {/* Info about selected type */}
                        <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md">
                            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                {JOIN_TYPE_INFO[table.joinType].example}
                            </p>
                        </div>

                        {/* Cross join warning */}
                        {table.joinType === 'cross' && (
                            <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-md">
                                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-amber-800 dark:text-amber-300">
                                    CROSS JOIN does not require join conditions. Be careful with large tables as the result
                                    can be very large (rows = table1_rows × table2_rows).
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
