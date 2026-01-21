/**
 * Centralized query key management
 * Follow hierarchical structure for easy invalidation
 */
export const queryKeys = {
    // User-related queries
    user: {
        all: ['user'] as const,
        profile: () => [...queryKeys.user.all, 'profile'] as const,
        stats: () => [...queryKeys.user.all, 'stats'] as const,
        activity: (page: number, limit: number) =>
            [...queryKeys.user.all, 'activity', { page, limit }] as const,
    },

    // Admin-related queries
    admin: {
        all: ['admin'] as const,
        users: {
            all: () => [...queryKeys.admin.all, 'users'] as const,
            list: (page: number, limit: number, search: string, role: string) =>
                [...queryKeys.admin.users.all(), 'list', { page, limit, search, role }] as const,
            detail: (id: number) =>
                [...queryKeys.admin.users.all(), 'detail', id] as const,
        },
    },

    // Dataset-related queries
    datasets: {
        all: ['datasets'] as const,
        list: (page: number, limit: number) =>
            [...queryKeys.datasets.all, 'list', { page, limit }] as const,
        detail: (id: string) =>
            [...queryKeys.datasets.all, 'detail', id] as const,
        data: (id: string, params: Record<string, any>) =>
            [...queryKeys.datasets.all, 'data', id, params] as const,
    },
} as const
