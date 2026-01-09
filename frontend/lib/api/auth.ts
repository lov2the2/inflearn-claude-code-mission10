import apiClient from './client'
import { LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth'
import { ApiResponse } from '@/types/api'

export const authApi = {
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<ApiResponse<AuthResponse>>(
            '/api/v1/auth/register',
            data
        )
        return response.data.data
    },

    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<ApiResponse<AuthResponse>>(
            '/api/v1/auth/login',
            data
        )
        return response.data.data
    },

    logout: async (): Promise<void> => {
        // Backend reads refresh token from HttpOnly cookie
        await apiClient.post('/api/v1/auth/logout')
    },
}
