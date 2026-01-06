export interface ApiResponse<T = any> {
    success: boolean
    data: T
    message?: string
}

export interface ApiError {
    success: false
    error: string
}
