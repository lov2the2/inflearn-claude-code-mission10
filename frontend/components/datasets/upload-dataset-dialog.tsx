'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUploadDataset } from '@/lib/hooks/mutations/use-upload-dataset'
import { FormDialog } from '@/components/ui/form-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface UploadDatasetDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const uploadSchema = z.object({
    displayName: z.string().min(1, 'Display name is required').max(100),
    description: z.string().max(500).optional(),
    file: z.instanceof(File, { message: 'CSV file is required' }),
})

type UploadFormData = z.infer<typeof uploadSchema>

export function UploadDatasetDialog({ open, onOpenChange }: UploadDatasetDialogProps) {
    const [file, setFile] = useState<File | null>(null)
    const uploadMutation = useUploadDataset()

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<UploadFormData>({
        resolver: zodResolver(uploadSchema),
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            setFile(selectedFile)
            setValue('file', selectedFile)
            uploadMutation.reset()
        }
    }

    const onSubmit = (data: UploadFormData) => {
        uploadMutation.mutate(
            {
                file: data.file,
                displayName: data.displayName,
                description: data.description || '',
            },
            {
                onSuccess: () => {
                    setTimeout(() => {
                        handleClose()
                    }, 2000)
                },
            }
        )
    }

    const handleClose = () => {
        onOpenChange(false)
        reset()
        setFile(null)
        uploadMutation.reset()
    }

    return (
        <FormDialog
            open={open}
            onOpenChange={handleClose}
            title="Upload Dataset"
            description="Upload a CSV file to create a new dynamic dataset"
            onSubmit={handleSubmit(onSubmit)}
            submitLabel="Upload"
            isLoading={uploadMutation.isPending}
            loadingText="Uploading..."
            isValid={!!file}
            className="max-w-2xl"
            hideFooter={!!uploadMutation.data}
            customFooter={
                uploadMutation.data ? (
                    <Button type="button" onClick={handleClose} className="w-full">
                        Close
                    </Button>
                ) : undefined
            }
        >
            {!uploadMutation.data ? (
                <>
                    <div>
                        <Label htmlFor="displayName">Display Name *</Label>
                        <Input
                            id="displayName"
                            {...register('displayName')}
                            placeholder="e.g., Sales Data 2024"
                            disabled={uploadMutation.isPending}
                        />
                        {errors.displayName && (
                            <p className="text-sm text-red-600 mt-1">{errors.displayName.message}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            placeholder="Brief description of the dataset"
                            rows={3}
                            disabled={uploadMutation.isPending}
                        />
                        {errors.description && (
                            <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="file">CSV File *</Label>
                        <Input
                            id="file"
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            disabled={uploadMutation.isPending}
                        />
                        {file && (
                            <p className="text-xs text-gray-500 mt-1">
                                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                            </p>
                        )}
                        {errors.file && <p className="text-sm text-red-600 mt-1">{errors.file.message}</p>}
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded text-sm">
                        <p className="font-medium mb-1">Requirements:</p>
                        <ul className="text-xs space-y-1 list-disc list-inside">
                            <li>First row must contain column headers</li>
                            <li>Column names: alphanumeric, underscores (a-z, 0-9, _)</li>
                            <li>Supported types: text, integer, numeric, boolean, timestamp</li>
                            <li>Maximum file size: 10MB</li>
                        </ul>
                    </div>
                </>
            ) : (
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded">
                    <p className="text-green-800 dark:text-green-300 font-medium mb-2">
                        ✓ Dataset created successfully!
                    </p>
                    <div className="space-y-1 text-sm text-green-700 dark:text-green-400">
                        <p>Name: {uploadMutation.data.dataset.displayName}</p>
                        <p>Rows imported: {uploadMutation.data.rowsImported.toLocaleString()}</p>
                        <p>Columns: {uploadMutation.data.dataset.columns.length}</p>
                    </div>
                </div>
            )}
        </FormDialog>
    )
}
