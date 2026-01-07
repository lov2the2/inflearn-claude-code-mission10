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
    current_password: z
        .string()
        .min(1, 'Current password is required'),
    new_password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password must not exceed 128 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain uppercase, lowercase, and number'
        ),
    confirm_password: z
        .string()
        .min(1, 'Please confirm your password')
}).refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password']
})

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>
