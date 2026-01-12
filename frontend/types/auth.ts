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
    access_token: string
    refresh_token: string
    user: User
}

export interface RefreshTokenRequest {
    refresh_token: string
}

export interface RefreshTokenResponse {
    access_token: string
    refresh_token: string
    user: User
}
