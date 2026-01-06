'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { adminApi, User } from '@/lib/api/admin'
import { UserListTable } from '@/components/admin/user-list-table'
import { CSVImportDialog } from '@/components/admin/csv-import-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [loading, setLoading] = useState(true)
    const [exporting, setExporting] = useState(false)
    const [importDialogOpen, setImportDialogOpen] = useState(false)

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const data = await adminApi.listUsers({ page, limit })
            setUsers(data.users)
            setTotal(data.total)
        } catch (error) {
            console.error('Failed to fetch users:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [page])

    const handleRoleUpdate = async (userId: number, newRole: 'admin' | 'user') => {
        try {
            await adminApi.updateUserRole(userId, newRole)
            toast.success(`User role updated to ${newRole} successfully`)
            await fetchUsers() // Refresh list
        } catch (error) {
            console.error('Failed to update role:', error)
            toast.error('Failed to update user role')
        }
    }

    const handleDelete = async (userId: number) => {
        try {
            await adminApi.deleteUser(userId)
            toast.success('User deleted successfully')
            await fetchUsers() // Refresh list
        } catch (error) {
            console.error('Failed to delete user:', error)
            toast.error('Failed to delete user')
        }
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
                        <Button onClick={handleExport} disabled={exporting} variant="outline">
                            {exporting ? 'Exporting...' : 'Export CSV'}
                        </Button>
                        <Button onClick={() => setImportDialogOpen(true)} variant="outline">
                            Import CSV
                        </Button>
                    </div>
                </CardHeader>
            <CardContent>
                {loading ? (
                    <div>Loading...</div>
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
            onSuccess={fetchUsers}
        />
        </>
    )
}
