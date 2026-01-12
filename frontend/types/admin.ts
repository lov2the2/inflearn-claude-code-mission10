/**
 * Admin-related type definitions
 * Centralized types for admin operations (user management, CSV import/export)
 */

import { User } from './user'

export interface ListUsersParams {
    page?: number
    limit?: number
    search?: string
    role?: 'admin' | 'user' | ''
}

export interface ListUsersResponse {
    users: User[]
    total: number
    page: number
    limit: number
}

export interface CSVImportError {
    row: number
    email?: string
    field?: string
    message: string
}

export interface CSVImportResult {
    success_count: number
    failure_count: number
    created_count: number
    updated_count: number
    total_rows: number
    default_password?: string
    errors?: CSVImportError[]
}

export interface CreateUserRequest {
    email: string
    name: string
    password?: string
    role: 'admin' | 'user'
}

export interface CreateUserResponse {
    user: User
    generated_password?: string
}
