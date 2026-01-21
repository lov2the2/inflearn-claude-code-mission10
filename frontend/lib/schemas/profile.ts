import { z } from 'zod'

export const profileEditSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must not exceed 100 characters')
        .trim()
})

export type ProfileEditFormData = z.infer<typeof profileEditSchema>

export const passwordChangeSchema = z.object({
    currentPassword: z
        .string()
        .min(1, 'Current password is required'),
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password must not exceed 128 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain uppercase, lowercase, and number'
        ),
    confirmPassword: z
        .string()
        .min(1, 'Please confirm your password')
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
})

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>
