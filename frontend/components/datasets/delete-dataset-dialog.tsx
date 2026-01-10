'use client'

import { use_delete_dataset } from '@/lib/hooks/mutations/use-delete-dataset'
import { Button } from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

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

    const handleDelete = () => {
        if (!dataset_id) return

        delete_mutation.mutate(dataset_id, {
            onSuccess: () => {
                onOpenChange(false)
            },
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Dataset</AlertDialogTitle>
                    <AlertDialogDescription>
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
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={delete_mutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        isLoading={delete_mutation.isPending}
                        loadingText="Deleting..."
                    >
                        Delete
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
