'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { JoinBuilderState, JoinCondition, JoinQueryRequest } from '@/types/dataset'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { JoinStepTables } from '@/components/datasets/join-step-tables'
import { JoinStepType } from '@/components/datasets/join-step-type'
import { JoinStepConditions } from '@/components/datasets/join-step-conditions'
import { JoinStepColumns } from '@/components/datasets/join-step-columns'
import { JoinResult } from '@/components/datasets/join-result'
import { use_join_query, use_export_join_query } from '@/lib/hooks/mutations/use-join-query'
import { ChevronLeft, ChevronRight, Play, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const STEPS = [
    { id: 1, name: 'Select Tables', description: 'Choose datasets to join' },
    { id: 2, name: 'Join Type', description: 'Select join operation' },
    { id: 3, name: 'Join Conditions', description: 'Define matching criteria' },
    { id: 4, name: 'Select Columns', description: 'Choose result columns' },
    { id: 5, name: 'Execute & Results', description: 'Run query and view results' },
]

/**
 * Join Builder Page Component
 */
function JoinBuilderPageContent() {
    const search_params = useSearchParams()
    const initial_left_id = search_params.get('left')

    const [current_step, set_current_step] = useState(1)
    const [builder_state, set_builder_state] = useState<JoinBuilderState>({
        left_dataset_id: initial_left_id,
        right_dataset_id: null,
        join_type: 'inner',
        conditions: [],
        selected_columns: [],
    })

    const execute_join_mutation = use_join_query()
    const export_join_mutation = use_export_join_query()

    // Validation checks
    const can_proceed_step_1 = builder_state.left_dataset_id && builder_state.right_dataset_id
    const can_proceed_step_2 = builder_state.join_type !== null
    const can_proceed_step_3 =
        builder_state.conditions.length > 0 &&
        builder_state.conditions.every((c) => c.left_column && c.right_column && c.operator)
    const can_proceed_step_4 = builder_state.selected_columns.length > 0

    const can_proceed = () => {
        switch (current_step) {
            case 1:
                return can_proceed_step_1
            case 2:
                return can_proceed_step_2
            case 3:
                return can_proceed_step_3
            case 4:
                return can_proceed_step_4
            default:
                return true
        }
    }

    const handle_next = () => {
        if (can_proceed() && current_step < STEPS.length) {
            set_current_step(current_step + 1)
        }
    }

    const handle_previous = () => {
        if (current_step > 1) {
            set_current_step(current_step - 1)
        }
    }

    const handle_execute_join = () => {
        if (!builder_state.left_dataset_id || !builder_state.right_dataset_id) {
            return
        }

        // For now, use the first condition (backend expects single left_column/right_column)
        // TODO: Update backend to support multiple conditions
        const first_condition = builder_state.conditions[0]
        if (!first_condition) {
            return
        }

        const request: JoinQueryRequest = {
            left_dataset_id: builder_state.left_dataset_id,
            right_dataset_id: builder_state.right_dataset_id,
            left_column: first_condition.left_column,
            right_column: first_condition.right_column,
            join_type: builder_state.join_type,
        }

        execute_join_mutation.mutate(request)
    }

    const handle_export_join = () => {
        if (!builder_state.left_dataset_id || !builder_state.right_dataset_id) {
            return
        }

        const first_condition = builder_state.conditions[0]
        if (!first_condition) {
            return
        }

        const request: JoinQueryRequest = {
            left_dataset_id: builder_state.left_dataset_id,
            right_dataset_id: builder_state.right_dataset_id,
            left_column: first_condition.left_column,
            right_column: first_condition.right_column,
            join_type: builder_state.join_type,
        }

        export_join_mutation.mutate(request)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Join Builder</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Create joins between datasets with visual workflow
                    </p>
                </div>
                <Link href="/datasets">
                    <Button variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Datasets
                    </Button>
                </Link>
            </div>

            {/* Progress Steps */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        {STEPS.map((step, index) => {
                            const is_current = current_step === step.id
                            const is_completed = current_step > step.id
                            const is_last = index === STEPS.length - 1

                            return (
                                <div key={step.id} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center flex-1">
                                        <div
                                            className={`
                                                w-10 h-10 rounded-full flex items-center justify-center font-semibold
                                                transition-colors duration-200
                                                ${
                                                    is_current
                                                        ? 'bg-primary text-primary-foreground'
                                                        : is_completed
                                                        ? 'bg-green-600 text-white'
                                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                }
                                            `}
                                        >
                                            {is_completed ? '✓' : step.id}
                                        </div>
                                        <div className="mt-2 text-center">
                                            <p
                                                className={`
                                                    text-sm font-medium
                                                    ${
                                                        is_current
                                                            ? 'text-primary'
                                                            : is_completed
                                                            ? 'text-green-600 dark:text-green-400'
                                                            : 'text-gray-500 dark:text-gray-400'
                                                    }
                                                `}
                                            >
                                                {step.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 hidden lg:block">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                    {!is_last && (
                                        <div
                                            className={`
                                                flex-1 h-0.5 -mt-5
                                                ${
                                                    is_completed
                                                        ? 'bg-green-600'
                                                        : 'bg-gray-200 dark:bg-gray-700'
                                                }
                                            `}
                                        />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Step Content */}
            <div className="min-h-[400px]">
                {current_step === 1 && (
                    <JoinStepTables
                        left_dataset_id={builder_state.left_dataset_id}
                        right_dataset_id={builder_state.right_dataset_id}
                        on_change={(left_id, right_id) =>
                            set_builder_state((prev) => ({
                                ...prev,
                                left_dataset_id: left_id,
                                right_dataset_id: right_id,
                            }))
                        }
                    />
                )}

                {current_step === 2 && (
                    <JoinStepType
                        join_type={builder_state.join_type}
                        on_change={(type) =>
                            set_builder_state((prev) => ({
                                ...prev,
                                join_type: type,
                            }))
                        }
                    />
                )}

                {current_step === 3 && (
                    <JoinStepConditions
                        left_dataset_id={builder_state.left_dataset_id}
                        right_dataset_id={builder_state.right_dataset_id}
                        conditions={builder_state.conditions}
                        on_change={(conditions) =>
                            set_builder_state((prev) => ({
                                ...prev,
                                conditions,
                            }))
                        }
                    />
                )}

                {current_step === 4 && (
                    <JoinStepColumns
                        left_dataset_id={builder_state.left_dataset_id}
                        right_dataset_id={builder_state.right_dataset_id}
                        selected_columns={builder_state.selected_columns}
                        on_change={(columns) =>
                            set_builder_state((prev) => ({
                                ...prev,
                                selected_columns: columns,
                            }))
                        }
                    />
                )}

                {current_step === 5 && (
                    <JoinResult
                        result={execute_join_mutation.data || null}
                        is_loading={execute_join_mutation.isPending}
                        is_error={execute_join_mutation.isError}
                        on_export={handle_export_join}
                        is_exporting={export_join_mutation.isPending}
                    />
                )}
            </div>

            {/* Navigation Buttons */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-4">
                        <Button
                            variant="outline"
                            onClick={handle_previous}
                            disabled={current_step === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Previous
                        </Button>

                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Step {current_step} of {STEPS.length}
                        </div>

                        {current_step < STEPS.length - 1 ? (
                            <Button onClick={handle_next} disabled={!can_proceed()}>
                                Next
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        ) : current_step === STEPS.length - 1 ? (
                            <Button onClick={handle_next} disabled={!can_proceed()}>
                                Review & Execute
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handle_execute_join}
                                disabled={
                                    execute_join_mutation.isPending ||
                                    !builder_state.left_dataset_id ||
                                    !builder_state.right_dataset_id ||
                                    builder_state.conditions.length === 0
                                }
                            >
                                <Play className="h-4 w-4 mr-2" />
                                {execute_join_mutation.isPending ? 'Executing...' : 'Execute Join'}
                            </Button>
                        )}
                    </div>

                    {/* Validation Messages */}
                    {current_step < STEPS.length && !can_proceed() && (
                        <div className="mt-4 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md">
                            {current_step === 1 && 'Please select both left and right tables'}
                            {current_step === 2 && 'Please select a join type'}
                            {current_step === 3 && 'Please complete all join conditions'}
                            {current_step === 4 && 'Please select at least one column'}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

/**
 * Main page wrapper with Suspense
 */
export default function JoinBuilderPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center h-screen">
                    <p>Loading join builder...</p>
                </div>
            }
        >
            <JoinBuilderPageContent />
        </Suspense>
    )
}
