import { AlertCircle } from 'lucide-react'

export interface FormErrorProps {
    message?: string
    className?: string
}

/**
 * Displays form validation errors
 * Uses consistent styling with accessibility support
 *
 * @example
 * ```tsx
 * <FormError message={errors.email?.message} />
 * <FormError message={apiError} className="mt-4" />
 * ```
 */
export function FormError({ message, className = '' }: FormErrorProps) {
    if (!message) return null

    return (
        <div
            className={`flex items-center gap-2 text-sm text-red-600 dark:text-red-400 ${className}`}
            role="alert"
            aria-live="polite"
        >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{message}</span>
        </div>
    )
}
