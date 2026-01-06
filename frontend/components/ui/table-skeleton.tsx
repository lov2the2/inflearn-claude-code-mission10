import { Skeleton } from './skeleton'

export interface TableSkeletonProps {
    rows?: number
    columns?: number
}

/**
 * Skeleton loader for data tables
 * Provides better UX than "Loading..." text
 * Shows animated placeholder rows and columns
 *
 * @example
 * ```tsx
 * {isLoading ? (
 *   <TableSkeleton rows={5} columns={4} />
 * ) : (
 *   <DataTable data={data} columns={columns} />
 * )}
 * ```
 */
export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex gap-4">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={`header-${i}`} className="h-4 flex-1" />
                ))}
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={`row-${rowIndex}`} className="flex gap-4">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <Skeleton
                            key={`cell-${rowIndex}-${colIndex}`}
                            className="h-8 flex-1"
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}
