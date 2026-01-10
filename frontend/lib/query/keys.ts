/**
 * Centralized query key management
 * Follow hierarchical structure for easy invalidation
 */
export const query_keys = {
    // User-related queries
    user: {
        all: ['user'] as const,
        profile: () => [...query_keys.user.all, 'profile'] as const,
        stats: () => [...query_keys.user.all, 'stats'] as const,
        activity: (page: number, limit: number) =>
            [...query_keys.user.all, 'activity', { page, limit }] as const,
    },

    // Admin-related queries
    admin: {
        all: ['admin'] as const,
        users: {
            all: () => [...query_keys.admin.all, 'users'] as const,
            list: (page: number, limit: number, search: string, role: string) =>
                [...query_keys.admin.users.all(), 'list', { page, limit, search, role }] as const,
            detail: (id: number) =>
                [...query_keys.admin.users.all(), 'detail', id] as const,
        },
    },

    // Dataset-related queries
    datasets: {
        all: ['datasets'] as const,
        list: (page: number, limit: number) =>
            [...query_keys.datasets.all, 'list', { page, limit }] as const,
        detail: (id: string) =>
            [...query_keys.datasets.all, 'detail', id] as const,
        data: (id: string, page: number, limit: number) =>
            [...query_keys.datasets.all, 'data', id, { page, limit }] as const,
    },
} as const
