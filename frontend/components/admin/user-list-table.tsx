'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Eye } from 'lucide-react'
import { User } from '@/types'
import { RoleUpdateDialog } from './role-update-dialog'
import { DeleteUserDialog } from './delete-user-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getUser } from '@/lib/auth/session'
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    flexRender,
} from '@tanstack/react-table'

interface UserListTableProps {
    users: User[]
    onRoleUpdate: (userId: number, newRole: 'admin' | 'user') => Promise<void>
    onDelete: (userId: number) => Promise<void>
}

export function UserListTable({ users, onRoleUpdate, onDelete }: UserListTableProps) {
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [dialogType, setDialogType] = useState<'role' | 'delete' | null>(null)
    const [sorting, setSorting] = useState<SortingState>([])
    const currentUser = getUser()

    const isCurrentUser = (user: User) => user.id === currentUser?.id

    const columns = useMemo<ColumnDef<User>[]>(
        () => [
            {
                accessorKey: 'id',
                header: ({ column }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        >
                            ID
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    )
                },
                cell: ({ row }) => <span className="font-mono">{row.getValue('id')}</span>,
            },
            {
                accessorKey: 'email',
                header: ({ column }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        >
                            Email
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    )
                },
            },
            {
                accessorKey: 'name',
                header: ({ column }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        >
                            Name
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    )
                },
                cell: ({ row }) => (
                    <Link
                        href={`/admin/users/${row.original.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        {row.getValue('name')}
                    </Link>
                ),
            },
            {
                accessorKey: 'role',
                header: ({ column }) => {
                    return (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                        >
                            Role
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    )
                },
                cell: ({ row }) => {
                    const role = row.getValue('role') as string
                    return (
                        <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
                            {role}
                        </Badge>
                    )
                },
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => {
                    const user = row.original
                    const is_current = isCurrentUser(user)

                    return (
                        <div className="flex items-center gap-2">
                            <Link href={`/admin/users/${user.id}`}>
                                <Button size="sm" variant="ghost" className="gap-1">
                                    <Eye className="h-4 w-4" />
                                    View
                                </Button>
                            </Link>
                            <Button
                                onClick={() => {
                                    setSelectedUser(user)
                                    setDialogType('role')
                                }}
                                disabled={is_current}
                                size="sm"
                                variant="outline"
                            >
                                Change Role
                            </Button>
                            <Button
                                onClick={() => {
                                    setSelectedUser(user)
                                    setDialogType('delete')
                                }}
                                disabled={is_current}
                                size="sm"
                                variant="destructive"
                            >
                                Delete
                            </Button>
                        </div>
                    )
                },
            },
        ],
        [currentUser]
    )

    const table = useReactTable({
        data: users,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        },
    })

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {selectedUser && dialogType === 'role' && (
                <RoleUpdateDialog
                    user={selectedUser}
                    onConfirm={async (newRole) => {
                        await onRoleUpdate(selectedUser.id, newRole)
                        setDialogType(null)
                    }}
                    onCancel={() => setDialogType(null)}
                />
            )}

            {selectedUser && dialogType === 'delete' && (
                <DeleteUserDialog
                    user={selectedUser}
                    onConfirm={async () => {
                        await onDelete(selectedUser.id)
                        setDialogType(null)
                    }}
                    onCancel={() => setDialogType(null)}
                />
            )}
        </>
    )
}
