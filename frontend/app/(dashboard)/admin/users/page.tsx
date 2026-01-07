'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { adminApi } from '@/lib/api/admin'
import { use_user_list } from '@/lib/hooks/queries/use-user-list'
import { use_update_role } from '@/lib/hooks/mutations/use-update-role'
import { use_delete_user } from '@/lib/hooks/mutations/use-delete-user'
import { UserListTable } from '@/components/admin/user-list-table'
import { CSVImportDialog } from '@/components/admin/csv-import-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/ui/table-skeleton'

export default function AdminUsersPage() {
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [exporting, setExporting] = useState(false)
    const [importDialogOpen, setImportDialogOpen] = useState(false)

    // Query hook for user list
    const { data, isLoading } = use_user_list(page, limit)
    const users = data?.users ?? []
    const total = data?.total ?? 0

    // Mutation hooks
    const update_role_mutation = use_update_role()
    const delete_user_mutation = use_delete_user()

    const handleRoleUpdate = async (userId: number, newRole: 'admin' | 'user') => {
        update_role_mutation.mutate({ user_id: userId, new_role: newRole })
    }

    const handleDelete = async (userId: number) => {
        delete_user_mutation.mutate(userId)
    }

    const handleExport = async () => {
        try {
            setExporting(true)
            const blob = await adminApi.exportCSV()

            // Create download link
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            toast.success('CSV exported successfully')
        } catch (error) {
            console.error('Failed to export CSV:', error)
            toast.error('Failed to export CSV')
        } finally {
            setExporting(false)
        }
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>User Management</CardTitle>
                    <div className="flex gap-2">
                        <Button onClick={handleExport} isLoading={exporting} loadingText="Exporting..." variant="outline">
                            Export CSV
                        </Button>
                        <Button onClick={() => setImportDialogOpen(true)} variant="outline">
                            Import CSV
                        </Button>
                    </div>
                </CardHeader>
            <CardContent>
                {isLoading ? (
                    <TableSkeleton rows={10} columns={5} />
                ) : (
                    <UserListTable
                        users={users}
                        onRoleUpdate={handleRoleUpdate}
                        onDelete={handleDelete}
                    />
                )}

                {/* Pagination */}
                <div className="mt-4 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                        Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} users
                    </p>
                    <div className="space-x-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page * limit >= total}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>

        <CSVImportDialog
            open={importDialogOpen}
            onOpenChange={setImportDialogOpen}
        />
        </>
    )
}
