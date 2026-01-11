'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Info } from 'lucide-react'

interface JoinStepTypeProps {
    join_type: 'inner' | 'left' | 'right' | 'full'
    on_change: (type: 'inner' | 'left' | 'right' | 'full') => void
}

const JOIN_TYPE_INFO = {
    inner: {
        title: 'INNER JOIN',
        description: 'Returns only rows that have matching values in both tables',
        example: 'Only includes records that exist in both tables',
    },
    left: {
        title: 'LEFT JOIN',
        description: 'Returns all rows from the left table, and matched rows from the right table',
        example: 'All left table records + matching right table records (NULL if no match)',
    },
    right: {
        title: 'RIGHT JOIN',
        description: 'Returns all rows from the right table, and matched rows from the left table',
        example: 'All right table records + matching left table records (NULL if no match)',
    },
    full: {
        title: 'FULL OUTER JOIN',
        description: 'Returns all rows when there is a match in either table',
        example: 'All records from both tables (NULL where no match exists)',
    },
}

/**
 * Step 2: Join type selection component
 * Allows users to select the type of join operation
 */
export function JoinStepType({ join_type, on_change }: JoinStepTypeProps) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Select Join Type</CardTitle>
                    <CardDescription>Choose how the tables should be joined</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={join_type} onValueChange={(value) => on_change(value as any)}>
                        <div className="space-y-4">
                            {(Object.keys(JOIN_TYPE_INFO) as Array<keyof typeof JOIN_TYPE_INFO>).map((type) => {
                                const info = JOIN_TYPE_INFO[type]
                                const is_selected = join_type === type

                                return (
                                    <div
                                        key={type}
                                        className={`
                                            relative flex items-start space-x-3 rounded-lg border p-4 cursor-pointer
                                            transition-colors duration-200
                                            ${
                                                is_selected
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                            }
                                        `}
                                        onClick={() => on_change(type)}
                                    >
                                        <RadioGroupItem value={type} id={type} className="mt-1" />
                                        <div className="flex-1">
                                            <Label htmlFor={type} className="cursor-pointer">
                                                <div className="font-semibold mb-1">{info.title}</div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                    {info.description}
                                                </p>
                                                <div className="flex items-start gap-2 mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-md">
                                                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                                    <p className="text-xs text-blue-800 dark:text-blue-300">
                                                        {info.example}
                                                    </p>
                                                </div>
                                            </Label>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>

            {/* Visual Diagram (Optional Enhancement) */}
            <Card>
                <CardHeader>
                    <CardTitle>Visual Representation</CardTitle>
                    <CardDescription>How the selected join type works</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-8 mb-4">
                                {/* Left Circle */}
                                <div className="relative">
                                    <div
                                        className={`
                                            w-24 h-24 rounded-full border-4 flex items-center justify-center
                                            ${
                                                join_type === 'left' || join_type === 'inner' || join_type === 'full'
                                                    ? 'border-primary bg-primary/20'
                                                    : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800'
                                            }
                                        `}
                                    >
                                        <span className="font-semibold text-sm">Left</span>
                                    </div>
                                </div>

                                {/* Intersection */}
                                <div
                                    className={`
                                        w-12 h-12 rounded-full border-4 flex items-center justify-center
                                        ${
                                            join_type === 'inner' || join_type === 'full'
                                                ? 'border-primary bg-primary/40'
                                                : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800'
                                        }
                                    `}
                                />

                                {/* Right Circle */}
                                <div className="relative">
                                    <div
                                        className={`
                                            w-24 h-24 rounded-full border-4 flex items-center justify-center
                                            ${
                                                join_type === 'right' || join_type === 'inner' || join_type === 'full'
                                                    ? 'border-primary bg-primary/20'
                                                    : 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800'
                                            }
                                        `}
                                    >
                                        <span className="font-semibold text-sm">Right</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Highlighted areas show included data
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
