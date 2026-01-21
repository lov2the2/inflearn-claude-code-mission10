'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { use_upload_dataset } from '@/lib/hooks/mutations/use-upload-dataset'
import { FormDialog } from '@/components/ui/form-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface UploadDatasetDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const upload_schema = z.object({
    display_name: z.string().min(1, 'Display name is required').max(100),
    description: z.string().max(500).optional(),
    file: z.instanceof(File, { message: 'CSV file is required' }),
})

type UploadFormData = z.infer<typeof upload_schema>

export function UploadDatasetDialog({ open, onOpenChange }: UploadDatasetDialogProps) {
    const [file, setFile] = useState<File | null>(null)
    const upload_mutation = use_upload_dataset()

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<UploadFormData>({
        resolver: zodResolver(upload_schema),
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected_file = e.target.files[0]
            setFile(selected_file)
            setValue('file', selected_file)
            upload_mutation.reset()
        }
    }

    const onSubmit = (data: UploadFormData) => {
        upload_mutation.mutate(
            {
                file: data.file,
                display_name: data.display_name,
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
        upload_mutation.reset()
    }

    return (
        <FormDialog
            open={open}
            onOpenChange={handleClose}
            title="Upload Dataset"
            description="Upload a CSV file to create a new dynamic dataset"
            onSubmit={handleSubmit(onSubmit)}
            submitLabel="Upload"
            isLoading={upload_mutation.isPending}
            loadingText="Uploading..."
            isValid={!!file}
            className="max-w-2xl"
            hideFooter={!!upload_mutation.data}
            customFooter={
                upload_mutation.data ? (
                    <Button type="button" onClick={handleClose} className="w-full">
                        Close
                    </Button>
                ) : undefined
            }
        >
            {!upload_mutation.data ? (
                <>
                    <div>
                        <Label htmlFor="display_name">Display Name *</Label>
                        <Input
                            id="display_name"
                            {...register('display_name')}
                            placeholder="e.g., Sales Data 2024"
                            disabled={upload_mutation.isPending}
                        />
                        {errors.display_name && (
                            <p className="text-sm text-red-600 mt-1">{errors.display_name.message}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            placeholder="Brief description of the dataset"
                            rows={3}
                            disabled={upload_mutation.isPending}
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
                            disabled={upload_mutation.isPending}
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
                        <p>Name: {upload_mutation.data.dataset.displayName}</p>
                        <p>Rows imported: {upload_mutation.data.rowsImported.toLocaleString()}</p>
                        <p>Columns: {upload_mutation.data.dataset.columns.length}</p>
                    </div>
                </div>
            )}
        </FormDialog>
    )
}
