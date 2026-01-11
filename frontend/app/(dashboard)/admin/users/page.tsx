'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Search, UserPlus, Filter } from 'lucide-react'
import { adminApi } from '@/lib/api/admin'
import { use_user_list } from '@/lib/hooks/queries/use-user-list'
import { use_update_role } from '@/lib/hooks/mutations/use-update-role'
import { use_delete_user } from '@/lib/hooks/mutations/use-delete-user'
import { UserListTable } from '@/components/admin/user-list-table'
import { CSVImportDialog } from '@/components/admin/csv-import-dialog'
import { CreateUserDialog } from '@/components/admin/create-user-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TableSkeleton } from '@/components/ui/table-skeleton'

export default function AdminUsersPage() {
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [search, setSearch] = useState('')
    const [role, setRole] = useState<'admin' | 'user' | ''>('')
    const [exporting, setExporting] = useState(false)
    const [importDialogOpen, setImportDialogOpen] = useState(false)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)

    // Query hook for user list with search and role filter
    const { data, isLoading } = use_user_list(page, limit, search, role)
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

    const handleSearchChange = (value: string) => {
        setSearch(value)
        setPage(1) // Reset to first page on search
    }

    const handleRoleChange = (value: string) => {
        setRole(value as 'admin' | 'user' | '')
        setPage(1) // Reset to first page on filter
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-col space-y-4">
                    <div className="flex flex-row items-center justify-between">
                        <CardTitle>User Management</CardTitle>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => setCreateDialogOpen(true)}
                                className="gap-2"
                            >
                                <UserPlus className="h-4 w-4" />
                                Create User
                            </Button>
                            <Button onClick={handleExport} disabled={exporting} variant="outline">
                                {exporting ? 'Exporting...' : 'Export CSV'}
                            </Button>
                            <Button onClick={() => setImportDialogOpen(true)} variant="outline">
                                Import CSV
                            </Button>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                            <Input
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={role} onValueChange={handleRoleChange}>
                            <SelectTrigger className="w-[180px]">
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Roles</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                        </Select>
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} users
                    </p>
                    <div className="space-x-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-700"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page * limit >= total}
                            className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-700"
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

        <CreateUserDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
        />
        </>
    )
}
