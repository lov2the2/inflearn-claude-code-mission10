'use client'

import { Dataset } from '@/types/dataset'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Database, FileText, Trash2, Calendar, GitMerge } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface DatasetCardProps {
    dataset: Dataset
    onDelete?: (id: string) => void
    onView: (id: string) => void
    onJoin?: (id: string) => void
    canDelete?: boolean
}

export function DatasetCard({ dataset, onDelete, onView, onJoin, canDelete = false }: DatasetCardProps) {
    const file_size_mb = (dataset.file_size_bytes / (1024 * 1024)).toFixed(2)

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                        <Database className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">{dataset.display_name}</CardTitle>
                    </div>
                    {canDelete && onDelete && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(dataset.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {dataset.description || 'No description'}
                </p>

                <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>{dataset.columns.length} columns</span>
                        <span className="mx-2">•</span>
                        <span>{dataset.row_count.toLocaleString()} rows</span>
                    </div>

                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                            Updated {formatDistanceToNow(new Date(dataset.updated_at), { addSuffix: true })}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t gap-2">
                    <Badge variant="secondary">{file_size_mb} MB</Badge>
                    <div className="flex items-center gap-2">
                        {onJoin && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onJoin(dataset.id)}
                            >
                                <GitMerge className="h-4 w-4 mr-1" />
                                Join
                            </Button>
                        )}
                        <Button
                            size="sm"
                            onClick={() => onView(dataset.id)}
                        >
                            View
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
