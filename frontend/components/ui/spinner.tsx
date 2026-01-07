import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

interface SpinnerProps extends React.HTMLAttributes<SVGElement> {
    size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
    sm: 'size-4', // 16px - button inline
    md: 'size-5', // 20px - default
    lg: 'size-6', // 24px - standalone
    xl: 'size-8', // 32px - page level
}

export function Spinner({ size = 'md', className, ...props }: SpinnerProps) {
    return (
        <Loader2
            className={cn(sizeClasses[size], 'animate-spin', className)}
            {...props}
        />
    )
}
