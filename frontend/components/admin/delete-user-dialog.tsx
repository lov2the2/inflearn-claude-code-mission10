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

interface DeleteUserDialogProps {
    user: User
    onConfirm: () => void
    onCancel: () => void
}

export function DeleteUserDialog({ user, onConfirm, onCancel }: DeleteUserDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleConfirm = async () => {
        setIsDeleting(true)
        try {
            await onConfirm()
            toast.success('User deleted successfully')
            onCancel()
        } catch (error) {
            toast.error('Failed to delete user')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={true} onOpenChange={onCancel}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete User</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete {user.name} ({user.email})?
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleConfirm} isLoading={isDeleting}>
                        Delete User
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
