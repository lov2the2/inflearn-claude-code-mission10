'use client'

import { use_delete_dataset } from '@/lib/hooks/mutations/use-delete-dataset'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

interface DeleteDatasetDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    dataset_id: string | null
    dataset_name: string
}

export function DeleteDatasetDialog({
    open,
    onOpenChange,
    dataset_id,
    dataset_name,
}: DeleteDatasetDialogProps) {
    const delete_mutation = use_delete_dataset()

    const handleDelete = async () => {
        if (!dataset_id) return

        await new Promise<void>((resolve, reject) => {
            delete_mutation.mutate(dataset_id, {
                onSuccess: () => {
                    onOpenChange(false)
                    resolve()
                },
                onError: (error) => {
                    reject(error)
                },
            })
        })
    }

    return (
        <ConfirmationDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Delete Dataset"
            description={
                <>
                    Are you sure you want to delete <strong>{dataset_name}</strong>?
                    <br />
                    <br />
                    This will permanently delete:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Dataset metadata</li>
                        <li>All data rows in the dynamic table</li>
                        <li>Column definitions</li>
                    </ul>
                    <br />
                    <strong className="text-red-600">This action cannot be undone.</strong>
                </>
            }
            confirmLabel="Delete"
            variant="destructive"
            onConfirm={handleDelete}
            isLoading={delete_mutation.isPending}
            loadingText="Deleting..."
        />
    )
}
