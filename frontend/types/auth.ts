import type { User } from './user'

export type { User }

export interface RegisterRequest {
    email: string
    password: string
    name: string
}

export interface LoginRequest {
    email: string
    password: string
}

export interface AuthResponse {
    user: User
}

export interface RefreshTokenRequest {
    refreshToken: string
}

export interface RefreshTokenResponse {
    accessToken: string
    refreshToken: string
    user: User
}
