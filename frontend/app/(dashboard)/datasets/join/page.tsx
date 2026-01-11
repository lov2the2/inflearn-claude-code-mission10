'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { JoinBuilderState, JoinTableConfig, JoinQueryRequest } from '@/types/dataset'
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
    { id: 1, name: 'Select Tables', description: 'Choose datasets to join (up to 5)' },
    { id: 2, name: 'Join Types', description: 'Select join operation for each table' },
    { id: 3, name: 'Join Conditions', description: 'Define matching criteria' },
    { id: 4, name: 'Select Columns', description: 'Choose result columns' },
    { id: 5, name: 'Execute & Results', description: 'Run query and view results' },
]

/**
 * Join Builder Page Component - Supports multi-table joins (up to 5 tables)
 */
function JoinBuilderPageContent() {
    const search_params = useSearchParams()
    const initial_base_id = search_params.get('base')

    const [current_step, set_current_step] = useState(1)
    const [builder_state, set_builder_state] = useState<JoinBuilderState>({
        base_dataset_id: initial_base_id,
        join_tables: [],
        selected_columns: [],
    })

    const execute_join_mutation = use_join_query()
    const export_join_mutation = use_export_join_query()

    // Validation checks
    const can_proceed_step_1 = builder_state.base_dataset_id && builder_state.join_tables.length > 0
    const can_proceed_step_2 = builder_state.join_tables.every((t) => t.join_type)
    const can_proceed_step_3 = builder_state.join_tables.every(
        (t) => t.join_type === 'cross' || (t.conditions.length > 0 && t.conditions.every((c) => c.left_column && c.right_column && c.operator))
    )
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
        if (
            !builder_state.base_dataset_id ||
            builder_state.join_tables.length === 0 ||
            builder_state.selected_columns.length === 0
        ) {
            return
        }

        const request: JoinQueryRequest = {
            base_dataset_id: builder_state.base_dataset_id,
            join_tables: builder_state.join_tables,
            select_columns: builder_state.selected_columns,
            page: 1,
            limit: 50,
        }

        execute_join_mutation.mutate(request)
    }

    const handle_export_join = () => {
        if (
            !builder_state.base_dataset_id ||
            builder_state.join_tables.length === 0 ||
            builder_state.selected_columns.length === 0
        ) {
            return
        }

        const request: JoinQueryRequest = {
            base_dataset_id: builder_state.base_dataset_id,
            join_tables: builder_state.join_tables,
            select_columns: builder_state.selected_columns,
        }

        export_join_mutation.mutate(request)
    }

    // Get all dataset IDs for column selection
    const get_all_dataset_ids = (): string[] => {
        const ids: string[] = []
        if (builder_state.base_dataset_id) {
            ids.push(builder_state.base_dataset_id)
        }
        builder_state.join_tables.forEach((t) => {
            if (t.dataset_id) {
                ids.push(t.dataset_id)
            }
        })
        return ids
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Join Builder</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Create multi-table joins with visual workflow (up to 5 tables)
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
                        base_dataset_id={builder_state.base_dataset_id}
                        join_tables={builder_state.join_tables}
                        on_change={(base_id, join_tables) =>
                            set_builder_state((prev) => ({
                                ...prev,
                                base_dataset_id: base_id,
                                join_tables,
                            }))
                        }
                    />
                )}

                {current_step === 2 && (
                    <JoinStepType
                        join_tables={builder_state.join_tables}
                        on_change={(join_tables) =>
                            set_builder_state((prev) => ({
                                ...prev,
                                join_tables,
                            }))
                        }
                    />
                )}

                {current_step === 3 && (
                    <JoinStepConditions
                        base_dataset_id={builder_state.base_dataset_id}
                        join_tables={builder_state.join_tables}
                        on_change={(join_tables) =>
                            set_builder_state((prev) => ({
                                ...prev,
                                join_tables,
                            }))
                        }
                    />
                )}

                {current_step === 4 && (
                    <JoinStepColumns
                        dataset_ids={get_all_dataset_ids()}
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
                                    !builder_state.base_dataset_id ||
                                    builder_state.join_tables.length === 0
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
                            {current_step === 1 && 'Please select a base table and at least one join table'}
                            {current_step === 2 && 'Please select join type for each table'}
                            {current_step === 3 && 'Please complete all join conditions (not required for CROSS JOIN)'}
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
