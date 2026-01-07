'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import { User } from '@/lib/api/admin'
import { RoleUpdateDialog } from './role-update-dialog'
import { DeleteUserDialog } from './delete-user-dialog'
import { Button } from '@/components/ui/button'
import { getUser } from '@/lib/auth/session'

interface UserListTableProps {
    users: User[]
    onRoleUpdate: (userId: number, newRole: 'admin' | 'user') => Promise<void>
    onDelete: (userId: number) => Promise<void>
}

export function UserListTable({ users, onRoleUpdate, onDelete }: UserListTableProps) {
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [dialogType, setDialogType] = useState<'role' | 'delete' | null>(null)
    const currentUser = getUser()

    const isCurrentUser = (user: User) => user.id === currentUser?.id

    return (
        <>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {user.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {user.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <Link
                                        href={`/admin/users/${user.id}`}
                                        className="text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                        {user.name}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        user.role === 'admin'
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                    <Link href={`/admin/users/${user.id}`}>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="gap-1"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View
                                        </Button>
                                    </Link>
                                    <Button
                                        onClick={() => {
                                            setSelectedUser(user)
                                            setDialogType('role')
                                        }}
                                        disabled={isCurrentUser(user)}
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
                                        disabled={isCurrentUser(user)}
                                        size="sm"
                                        variant="destructive"
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedUser && dialogType === 'role' && (
                <RoleUpdateDialog
                    user={selectedUser}
                    onConfirm={(newRole) => {
                        onRoleUpdate(selectedUser.id, newRole)
                        setDialogType(null)
                    }}
                    onCancel={() => setDialogType(null)}
                />
            )}

            {selectedUser && dialogType === 'delete' && (
                <DeleteUserDialog
                    user={selectedUser}
                    onConfirm={() => {
                        onDelete(selectedUser.id)
                        setDialogType(null)
                    }}
                    onCancel={() => setDialogType(null)}
                />
            )}
        </>
    )
}
