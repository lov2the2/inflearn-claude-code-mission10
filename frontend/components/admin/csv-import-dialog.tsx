'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { adminApi, CSVImportResult } from '@/lib/api/admin'
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
    onSuccess: () => void
}

export function CSVImportDialog({ open, onOpenChange, onSuccess }: CSVImportDialogProps) {
    const [file, setFile] = useState<File | null>(null)
    const [importing, setImporting] = useState(false)
    const [result, setResult] = useState<CSVImportResult | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setResult(null)
        }
    }

    const handleImport = async () => {
        if (!file) return

        try {
            setImporting(true)
            const importResult = await adminApi.importCSV(file)
            setResult(importResult)

            if (importResult.failure_count === 0) {
                toast.success(`Successfully imported ${importResult.success_count} users`)
                // All succeeded, close dialog and refresh
                setTimeout(() => {
                    onSuccess()
                    onOpenChange(false)
                    setFile(null)
                    setResult(null)
                }, 2000)
            } else {
                toast.warning(`Imported ${importResult.success_count} users with ${importResult.failure_count} failures`)
            }
        } catch (error) {
            console.error('Failed to import CSV:', error)
            toast.error('Failed to import CSV')
        } finally {
            setImporting(false)
        }
    }

    const handleClose = () => {
        if (result && result.success_count > 0) {
            onSuccess() // Refresh list if any succeeded
        }
        onOpenChange(false)
        setFile(null)
        setResult(null)
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
                    {!result && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    CSV File
                                </label>
                                <Input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    disabled={importing}
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

                    {result && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-50 p-3 rounded">
                                    <p className="text-sm text-gray-600">Success</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {result.success_count}
                                    </p>
                                </div>
                                <div className="bg-red-50 p-3 rounded">
                                    <p className="text-sm text-gray-600">Failed</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {result.failure_count}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <p>Created: <span className="font-medium">{result.created_count}</span></p>
                                <p>Updated: <span className="font-medium">{result.updated_count}</span></p>
                            </div>

                            {result.default_password && (
                                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                                    <p className="text-sm font-medium text-yellow-800 mb-1">
                                        Default Password for New Users:
                                    </p>
                                    <code className="text-sm bg-white px-2 py-1 rounded border">
                                        {result.default_password}
                                    </code>
                                    <p className="text-xs text-yellow-700 mt-1">
                                        Save this password! Users should change it on first login.
                                    </p>
                                </div>
                            )}

                            {result.errors && result.errors.length > 0 && (
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
                                            {result.errors.map((error, idx) => (
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
                    {!result ? (
                        <>
                            <Button variant="outline" onClick={handleClose} disabled={importing}>
                                Cancel
                            </Button>
                            <Button onClick={handleImport} disabled={!file || importing}>
                                {importing ? 'Importing...' : 'Import'}
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
