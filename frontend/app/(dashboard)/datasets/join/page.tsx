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
import { useJoinQuery, useExportJoinQuery } from '@/lib/hooks/mutations/use-join-query'
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
    const searchParams = useSearchParams()
    const initialBaseId = searchParams.get('base')

    const [currentStep, setCurrentStep] = useState(1)
    const [builderState, setBuilderState] = useState<JoinBuilderState>({
        baseDatasetId: initialBaseId,
        joinTables: [],
        selectedColumns: [],
    })

    const executeJoinMutation = useJoinQuery()
    const exportJoinMutation = useExportJoinQuery()

    // Validation checks
    const canProceedStep1 = builderState.baseDatasetId && builderState.joinTables.length > 0
    const canProceedStep2 = builderState.joinTables.every((t) => t.joinType)
    const canProceedStep3 = builderState.joinTables.every(
        (t) => t.joinType === 'cross' || (t.conditions.length > 0 && t.conditions.every((c) => c.leftColumn && c.rightColumn && c.operator))
    )
    const canProceedStep4 = builderState.selectedColumns.length > 0

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return canProceedStep1
            case 2:
                return canProceedStep2
            case 3:
                return canProceedStep3
            case 4:
                return canProceedStep4
            default:
                return true
        }
    }

    const handleNext = () => {
        if (canProceed() && currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleExecuteJoin = () => {
        if (
            !builderState.baseDatasetId ||
            builderState.joinTables.length === 0 ||
            builderState.selectedColumns.length === 0
        ) {
            return
        }

        const request: JoinQueryRequest = {
            baseDatasetId: builderState.baseDatasetId,
            joinTables: builderState.joinTables,
            selectColumns: builderState.selectedColumns,
            page: 1,
            limit: 50,
        }

        executeJoinMutation.mutate(request)
    }

    const handleExportJoin = () => {
        if (
            !builderState.baseDatasetId ||
            builderState.joinTables.length === 0 ||
            builderState.selectedColumns.length === 0
        ) {
            return
        }

        const request: JoinQueryRequest = {
            baseDatasetId: builderState.baseDatasetId,
            joinTables: builderState.joinTables,
            selectColumns: builderState.selectedColumns,
        }

        exportJoinMutation.mutate(request)
    }

    // Get all dataset IDs for column selection
    const getAllDatasetIds = (): string[] => {
        const ids: string[] = []
        if (builderState.baseDatasetId) {
            ids.push(builderState.baseDatasetId)
        }
        builderState.joinTables.forEach((t) => {
            if (t.datasetId) {
                ids.push(t.datasetId)
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
                            const isCurrent = currentStep === step.id
                            const isCompleted = currentStep > step.id
                            const isLast = index === STEPS.length - 1

                            return (
                                <div key={step.id} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center flex-1">
                                        <div
                                            className={`
                                                w-10 h-10 rounded-full flex items-center justify-center font-semibold
                                                transition-colors duration-200
                                                ${
                                                    isCurrent
                                                        ? 'bg-primary text-primary-foreground'
                                                        : isCompleted
                                                        ? 'bg-green-600 text-white'
                                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                }
                                            `}
                                        >
                                            {isCompleted ? '✓' : step.id}
                                        </div>
                                        <div className="mt-2 text-center">
                                            <p
                                                className={`
                                                    text-sm font-medium
                                                    ${
                                                        isCurrent
                                                            ? 'text-primary'
                                                            : isCompleted
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
                                    {!isLast && (
                                        <div
                                            className={`
                                                flex-1 h-0.5 -mt-5
                                                ${
                                                    isCompleted
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
                {currentStep === 1 && (
                    <JoinStepTables
                        baseDatasetId={builderState.baseDatasetId}
                        joinTables={builderState.joinTables}
                        onChange={(baseId, joinTables) =>
                            setBuilderState((prev) => ({
                                ...prev,
                                baseDatasetId: baseId,
                                joinTables,
                            }))
                        }
                    />
                )}

                {currentStep === 2 && (
                    <JoinStepType
                        joinTables={builderState.joinTables}
                        onChange={(joinTables) =>
                            setBuilderState((prev) => ({
                                ...prev,
                                joinTables,
                            }))
                        }
                    />
                )}

                {currentStep === 3 && (
                    <JoinStepConditions
                        baseDatasetId={builderState.baseDatasetId}
                        joinTables={builderState.joinTables}
                        onChange={(joinTables) =>
                            setBuilderState((prev) => ({
                                ...prev,
                                joinTables,
                            }))
                        }
                    />
                )}

                {currentStep === 4 && (
                    <JoinStepColumns
                        datasetIds={getAllDatasetIds()}
                        selectedColumns={builderState.selectedColumns}
                        onChange={(columns) =>
                            setBuilderState((prev) => ({
                                ...prev,
                                selectedColumns: columns,
                            }))
                        }
                    />
                )}

                {currentStep === 5 && (
                    <JoinResult
                        result={executeJoinMutation.data || null}
                        isLoading={executeJoinMutation.isPending}
                        isError={executeJoinMutation.isError}
                        onExport={handleExportJoin}
                        isExporting={exportJoinMutation.isPending}
                    />
                )}
            </div>

            {/* Navigation Buttons */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-4">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentStep === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Previous
                        </Button>

                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Step {currentStep} of {STEPS.length}
                        </div>

                        {currentStep < STEPS.length - 1 ? (
                            <Button onClick={handleNext} disabled={!canProceed()}>
                                Next
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        ) : currentStep === STEPS.length - 1 ? (
                            <Button onClick={handleNext} disabled={!canProceed()}>
                                Review & Execute
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleExecuteJoin}
                                disabled={
                                    executeJoinMutation.isPending ||
                                    !builderState.baseDatasetId ||
                                    builderState.joinTables.length === 0
                                }
                            >
                                <Play className="h-4 w-4 mr-2" />
                                {executeJoinMutation.isPending ? 'Executing...' : 'Execute Join'}
                            </Button>
                        )}
                    </div>

                    {/* Validation Messages */}
                    {currentStep < STEPS.length && !canProceed() && (
                        <div className="mt-4 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md">
                            {currentStep === 1 && 'Please select a base table and at least one join table'}
                            {currentStep === 2 && 'Please select join type for each table'}
                            {currentStep === 3 && 'Please complete all join conditions (not required for CROSS JOIN)'}
                            {currentStep === 4 && 'Please select at least one column'}
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
