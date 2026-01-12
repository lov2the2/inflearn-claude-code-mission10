import apiClient from './client'
import {
    ApiResponse,
    User,
    UserDetail,
    ListUsersParams,
    ListUsersResponse,
    CSVImportError,
    CSVImportResult,
    CreateUserRequest,
    CreateUserResponse,
} from '@/types'

export const adminApi = {
    listUsers: async (params: ListUsersParams = {}): Promise<ListUsersResponse> => {
        const response = await apiClient.get<ApiResponse<ListUsersResponse>>(
            '/api/v1/admin/users',
            { params }
        )
        return response.data.data
    },

    getUser: async (id: number): Promise<UserDetail> => {
        const response = await apiClient.get<ApiResponse<UserDetail>>(
            `/api/v1/admin/users/${id}`
        )
        return response.data.data
    },

    createUser: async (data: CreateUserRequest): Promise<CreateUserResponse> => {
        const response = await apiClient.post<ApiResponse<CreateUserResponse>>(
            '/api/v1/admin/users',
            data
        )
        return response.data.data
    },

    updateUserRole: async (id: number, role: 'admin' | 'user'): Promise<void> => {
        await apiClient.patch(`/api/v1/admin/users/${id}/role`, { role })
    },

    deleteUser: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/v1/admin/users/${id}`)
    },

    exportCSV: async (): Promise<Blob> => {
        const response = await apiClient.get('/api/v1/admin/users/export', {
            responseType: 'blob'
        })
        return response.data
    },

    importCSV: async (file: File): Promise<CSVImportResult> => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await apiClient.post<ApiResponse<CSVImportResult>>(
            '/api/v1/admin/users/import',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        )
        return response.data.data
    },
}
