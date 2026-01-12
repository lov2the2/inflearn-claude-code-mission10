import { ReactNode } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog'
import { Button } from './button'

export interface ConfirmationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string | ReactNode
    confirmLabel?: string
    cancelLabel?: string
    variant?: 'default' | 'destructive'
    onConfirm: () => void | Promise<void>
    isLoading?: boolean
    loadingText?: string
}

/**
 * Reusable confirmation dialog component
 * Handles async operations and loading states
 * Used for delete confirmations, role updates, etc.
 *
 * @example
 * ```tsx
 * <ConfirmationDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Delete User"
 *   description="Are you sure you want to delete this user?"
 *   confirmLabel="Delete"
 *   variant="destructive"
 *   onConfirm={handleDelete}
 *   isLoading={isDeleting}
 * />
 * ```
 */
export function ConfirmationDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'default',
    onConfirm,
    isLoading = false,
    loadingText = 'Processing...',
}: ConfirmationDialogProps) {
    const handleConfirm = async () => {
        await onConfirm()
        if (!isLoading) {
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription asChild={typeof description !== 'string'}>
                        {typeof description === 'string' ? description : <div>{description}</div>}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={variant}
                        onClick={handleConfirm}
                        isLoading={isLoading}
                        loadingText={loadingText}
                        disabled={isLoading}
                    >
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
