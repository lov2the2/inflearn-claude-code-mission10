'use client'

import { User } from '@/types/user'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

interface DeleteUserDialogProps {
    user: User
    onConfirm: () => Promise<void>
    onCancel: () => void
    isLoading?: boolean
}

export function DeleteUserDialog({ user, onConfirm, onCancel, isLoading = false }: DeleteUserDialogProps) {
    return (
        <ConfirmationDialog
            open={true}
            onOpenChange={(open) => !open && onCancel()}
            title="Delete User"
            description={
                <>
                    Are you sure you want to delete <strong>{user.name}</strong> ({user.email})?
                    <br />
                    <br />
                    This action cannot be undone.
                </>
            }
            confirmLabel="Delete User"
            variant="destructive"
            onConfirm={onConfirm}
            isLoading={isLoading}
            loadingText="Deleting..."
        />
    )
}
