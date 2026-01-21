'use client'

import { useDeleteDataset } from '@/lib/hooks/mutations/use-delete-dataset'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'

interface DeleteDatasetDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    datasetId: string | null
    datasetName: string
}

export function DeleteDatasetDialog({
    open,
    onOpenChange,
    datasetId,
    datasetName,
}: DeleteDatasetDialogProps) {
    const deleteMutation = useDeleteDataset()

    const handleDelete = async () => {
        if (!datasetId) return

        await new Promise<void>((resolve, reject) => {
            deleteMutation.mutate(datasetId, {
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
                    Are you sure you want to delete <strong>{datasetName}</strong>?
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
            isLoading={deleteMutation.isPending}
            loadingText="Deleting..."
        />
    )
}
