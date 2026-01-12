import { ReactNode } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog'
import { Button } from './button'

export interface FormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description?: string | ReactNode
    children: ReactNode
    submitLabel?: string
    cancelLabel?: string
    onSubmit?: (e: React.FormEvent) => void
    onCancel?: () => void
    isLoading?: boolean
    loadingText?: string
    isValid?: boolean
    className?: string
    hideFooter?: boolean
    customFooter?: ReactNode
}

/**
 * Reusable form dialog component
 * Wraps form content with standard dialog structure
 * Handles form submission and loading states
 *
 * @example
 * ```tsx
 * <FormDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Update User Role"
 *   description="Select a new role for the user"
 *   onSubmit={handleSubmit(onSubmit)}
 *   submitLabel="Update"
 *   isLoading={isLoading}
 * >
 *   <Select ... />
 * </FormDialog>
 * ```
 */
export function FormDialog({
    open,
    onOpenChange,
    title,
    description,
    children,
    submitLabel = 'Submit',
    cancelLabel = 'Cancel',
    onSubmit,
    onCancel,
    isLoading = false,
    loadingText = 'Processing...',
    isValid = true,
    className = '',
    hideFooter = false,
    customFooter,
}: FormDialogProps) {
    const handleCancel = () => {
        if (onCancel) {
            onCancel()
        } else {
            onOpenChange(false)
        }
    }

    const content = (
        <>
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                {description && (
                    <DialogDescription asChild={typeof description !== 'string'}>
                        {typeof description === 'string' ? description : <div>{description}</div>}
                    </DialogDescription>
                )}
            </DialogHeader>

            <div className="space-y-4 py-4">{children}</div>

            {!hideFooter && (
                <DialogFooter>
                    {customFooter || (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isLoading}
                            >
                                {cancelLabel}
                            </Button>
                            <Button
                                type="submit"
                                isLoading={isLoading}
                                loadingText={loadingText}
                                disabled={isLoading || !isValid}
                            >
                                {submitLabel}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            )}
        </>
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={className}>
                {onSubmit ? <form onSubmit={onSubmit}>{content}</form> : content}
            </DialogContent>
        </Dialog>
    )
}
