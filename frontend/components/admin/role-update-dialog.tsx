'use client'

import { useState } from 'react'
import { User } from '@/types'
import { FormDialog } from '@/components/ui/form-dialog'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface RoleUpdateDialogProps {
    user: User
    onConfirm: (newRole: 'admin' | 'user') => Promise<void>
    onCancel: () => void
    isLoading?: boolean
}

export function RoleUpdateDialog({ user, onConfirm, onCancel, isLoading = false }: RoleUpdateDialogProps) {
    const [newRole, setNewRole] = useState<'admin' | 'user'>(user.role as 'admin' | 'user')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onConfirm(newRole)
    }

    return (
        <FormDialog
            open={true}
            onOpenChange={(open) => !open && onCancel()}
            title="Change User Role"
            description={
                <>
                    Update the role for <strong>{user.name}</strong> ({user.email})
                </>
            }
            onSubmit={handleSubmit}
            submitLabel="Update Role"
            isLoading={isLoading}
            loadingText="Updating..."
            isValid={newRole !== user.role}
        >
            <div>
                <Label htmlFor="role" className="block text-sm font-medium mb-2">
                    New Role
                </Label>
                <Select
                    value={newRole}
                    onValueChange={(value) => setNewRole(value as 'admin' | 'user')}
                    disabled={isLoading}
                >
                    <SelectTrigger id="role">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </FormDialog>
    )
}
