'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Database } from 'lucide-react'
import { use_dataset_list } from '@/lib/hooks/queries/use-dataset-list'
import { DatasetCard } from '@/components/datasets/dataset-card'
import { UploadDatasetDialog } from '@/components/datasets/upload-dataset-dialog'
import { DeleteDatasetDialog } from '@/components/datasets/delete-dataset-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/ui/table-skeleton'
import { getUser } from '@/lib/auth/session'
import { isAdmin } from '@/lib/auth/role'

export default function DatasetsPage() {
    const router = useRouter()
    const [page, setPage] = useState(1)
    const [limit] = useState(12) // Grid layout: 3 columns x 4 rows
    const [upload_dialog_open, setUploadDialogOpen] = useState(false)
    const [delete_dialog_open, setDeleteDialogOpen] = useState(false)
    const [selected_dataset, setSelectedDataset] = useState<{ id: string; name: string } | null>(null)
    const [user_is_admin, setUserIsAdmin] = useState(false)

    // Check admin role on mount
    useEffect(() => {
        const user = getUser()
        if (user) {
            setUserIsAdmin(isAdmin(user))
        }
    }, [])

    // Query hook for dataset list
    const { data, isLoading } = use_dataset_list(page, limit)
    const datasets = data?.datasets ?? []
    const total = data?.total ?? 0

    const handleView = (id: string) => {
        router.push(`/datasets/${id}`)
    }

    const handleDeleteClick = (id: string, name: string) => {
        setSelectedDataset({ id, name })
        setDeleteDialogOpen(true)
    }

    const total_pages = Math.ceil(total / limit)

    return (
        <>
            <Card>
                <CardHeader className="flex flex-col space-y-4">
                    <div className="flex flex-row items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Database className="h-6 w-6 text-blue-600" />
                            <CardTitle>Datasets</CardTitle>
                        </div>
                        {user_is_admin && (
                            <Button
                                onClick={() => setUploadDialogOpen(true)}
                                className="gap-2"
                            >
                                <Upload className="h-4 w-4" />
                                Upload CSV
                            </Button>
                        )}
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Manage and query dynamic datasets created from CSV files
                    </div>
                </CardHeader>

                <CardContent>
                    {isLoading ? (
                        <TableSkeleton rows={4} columns={3} />
                    ) : datasets.length === 0 ? (
                        <div className="text-center py-12">
                            <Database className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                No datasets yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                {user_is_admin
                                    ? 'Upload your first CSV file to get started'
                                    : 'Contact an administrator to upload datasets'}
                            </p>
                            {user_is_admin && (
                                <Button onClick={() => setUploadDialogOpen(true)} className="gap-2">
                                    <Upload className="h-4 w-4" />
                                    Upload CSV
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Dataset Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {datasets.map((dataset) => (
                                    <DatasetCard
                                        key={dataset.id}
                                        dataset={dataset}
                                        onView={handleView}
                                        onDelete={(id) => handleDeleteClick(id, dataset.display_name)}
                                        canDelete={user_is_admin}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {total_pages > 1 && (
                                <div className="mt-6 flex justify-between items-center">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} datasets
                                    </p>
                                    <div className="space-x-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                        >
                                            Previous
                                        </Button>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Page {page} of {total_pages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            onClick={() => setPage(p => Math.min(total_pages, p + 1))}
                                            disabled={page === total_pages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <UploadDatasetDialog
                open={upload_dialog_open}
                onOpenChange={setUploadDialogOpen}
            />

            <DeleteDatasetDialog
                open={delete_dialog_open}
                onOpenChange={setDeleteDialogOpen}
                dataset_id={selected_dataset?.id ?? null}
                dataset_name={selected_dataset?.name ?? ''}
            />
        </>
    )
}
