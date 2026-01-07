'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { User } from '@/lib/api/admin'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface RoleUpdateDialogProps {
    user: User
    onConfirm: (newRole: 'admin' | 'user') => void
    onCancel: () => void
}

export function RoleUpdateDialog({ user, onConfirm, onCancel }: RoleUpdateDialogProps) {
    const [newRole, setNewRole] = useState<'admin' | 'user'>(user.role as 'admin' | 'user')
    const [isLoading, setIsLoading] = useState(false)

    const handleUpdate = async () => {
        setIsLoading(true)
        try {
            await onConfirm(newRole)
            toast.success('Role updated successfully')
            onCancel()
        } catch (error) {
            toast.error('Failed to update role')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={true} onOpenChange={onCancel}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Change User Role</DialogTitle>
                    <DialogDescription>
                        Update the role for {user.name} ({user.email})
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Role
                    </label>
                    <Select
                        value={newRole}
                        onValueChange={(value) => setNewRole(value as 'admin' | 'user')}
                        disabled={isLoading}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onCancel} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpdate}
                        isLoading={isLoading}
                        disabled={isLoading || newRole === user.role}
                    >
                        Update Role
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
