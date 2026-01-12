'use client'

import { useState } from 'react'
import { use_import_csv } from '@/lib/hooks/mutations/use-import-csv'
import { CSVImportError } from '@/types/admin'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface CSVImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void  // Made optional since mutation handles cache invalidation
}

export function CSVImportDialog({ open, onOpenChange }: CSVImportDialogProps) {
    const [file, setFile] = useState<File | null>(null)
    const import_mutation = use_import_csv()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            import_mutation.reset()
        }
    }

    const handleImport = () => {
        if (!file) return

        import_mutation.mutate(file, {
            onSuccess: (result) => {
                if (result.failure_count === 0) {
                    // All succeeded, close dialog after delay
                    setTimeout(() => {
                        onOpenChange(false)
                        setFile(null)
                        import_mutation.reset()
                    }, 2000)
                }
            },
        })
    }

    const handleClose = () => {
        onOpenChange(false)
        setFile(null)
        import_mutation.reset()
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Import Users from CSV</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file with columns: email, name, role
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {!import_mutation.data && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    CSV File
                                </label>
                                <Input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    disabled={import_mutation.isPending}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Format: email,name,role (max 10MB)
                                </p>
                            </div>

                            <div className="bg-gray-50 p-3 rounded text-sm">
                                <p className="font-medium mb-1">CSV Format Example:</p>
                                <pre className="text-xs">
                                    email,name,role{'\n'}
                                    user@example.com,John Doe,user{'\n'}
                                    admin@example.com,Jane Admin,admin
                                </pre>
                            </div>
                        </>
                    )}

                    {import_mutation.data && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-50 p-3 rounded">
                                    <p className="text-sm text-gray-600">Success</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {import_mutation.data.success_count}
                                    </p>
                                </div>
                                <div className="bg-red-50 p-3 rounded">
                                    <p className="text-sm text-gray-600">Failed</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {import_mutation.data.failure_count}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <p>Created: <span className="font-medium">{import_mutation.data.created_count}</span></p>
                                <p>Updated: <span className="font-medium">{import_mutation.data.updated_count}</span></p>
                            </div>

                            {import_mutation.data.default_password && (
                                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                                    <p className="text-sm font-medium text-yellow-800 mb-1">
                                        Default Password for New Users:
                                    </p>
                                    <code className="text-sm bg-white px-2 py-1 rounded border">
                                        {import_mutation.data.default_password}
                                    </code>
                                    <p className="text-xs text-yellow-700 mt-1">
                                        Save this password! Users should change it on first login.
                                    </p>
                                </div>
                            )}

                            {import_mutation.data.errors && import_mutation.data.errors.length > 0 && (
                                <div className="border rounded max-h-48 overflow-y-auto">
                                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left">Row</th>
                                                <th className="px-3 py-2 text-left">Email</th>
                                                <th className="px-3 py-2 text-left">Error</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {import_mutation.data.errors?.map((error: CSVImportError, idx: number) => (
                                                <tr key={idx}>
                                                    <td className="px-3 py-2">{error.row}</td>
                                                    <td className="px-3 py-2">{error.email || '-'}</td>
                                                    <td className="px-3 py-2 text-red-600">
                                                        {error.field && `${error.field}: `}{error.message}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {!import_mutation.data ? (
                        <>
                            <Button variant="outline" onClick={handleClose} disabled={import_mutation.isPending}>
                                Cancel
                            </Button>
                            <Button onClick={handleImport} isLoading={import_mutation.isPending} loadingText="Importing..." disabled={!file}>
                                Import
                            </Button>
                        </>
                    ) : (
                        <Button onClick={handleClose}>
                            Close
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
