import apiClient from './client'
import { LoginRequest, RegisterRequest, AuthResponse, RefreshTokenResponse } from '@/types/auth'
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

    refresh: async (refreshToken: string): Promise<RefreshTokenResponse> => {
        const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>(
            '/api/v1/auth/refresh',
            { refresh_token: refreshToken }
        )
        return response.data.data
    },

    logout: async (refreshToken: string): Promise<void> => {
        await apiClient.post('/api/v1/auth/logout', {
            refresh_token: refreshToken
        })
    },
}
