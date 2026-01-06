import { User } from '@/types/auth'

export const isAdmin = (user: User | null): boolean => {
    return user?.role === 'admin'
}

export const requireAdmin = (user: User | null): void => {
    if (!isAdmin(user)) {
        throw new Error('Admin access required')
    }
}
