import axios from 'axios'
import { getAccessToken, getRefreshToken, setSession, clearSession } from '@/lib/auth/session'
import { AuthResponse } from '@/types/auth'
import { API_CONFIG } from '@/lib/config/api'

/**
 * Axios instance for API requests
 * Configured with base URL and default headers
 * Includes request/response interceptors for authentication
 */
const apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: API_CONFIG.TIMEOUT,
})

/**
 * Request interceptor to add authentication token and request ID
 * Automatically adds Bearer token and X-Request-ID to all requests
 */
apiClient.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            // Add authentication token
            const token = getAccessToken()
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }

            // Generate and add request ID for tracing
            const requestId = crypto.randomUUID()
            config.headers['X-Request-ID'] = requestId
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

/**
 * Response interceptor for automatic token refresh
 * Handles 401 errors by refreshing the access token
 * Queues failed requests and retries them after refresh
 */

let isRefreshing = false
let failedQueue: Array<{
    resolve: (value?: unknown) => void
    reject: (reason?: any) => void
}> = []

/**
 * Process queued requests after token refresh
 * @param error - Error object if refresh failed
 * @param token - New access token if refresh succeeded
 */
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // If error is not 401 or request already retried, reject
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error)
        }

        // If already refreshing, queue this request
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject })
            }).then(token => {
                originalRequest.headers.Authorization = `Bearer ${token}`
                return apiClient(originalRequest)
            }).catch(err => Promise.reject(err))
        }

        originalRequest._retry = true
        isRefreshing = true

        const refreshToken = getRefreshToken()

        if (!refreshToken) {
            clearSession()
            if (typeof window !== 'undefined') {
                window.location.href = '/login'
            }
            return Promise.reject(error)
        }

        try {
            // Call refresh endpoint using axios
            const response = await axios.post<{ data: AuthResponse }>(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`,
                { refresh_token: refreshToken },
                {
                    headers: { 'Content-Type': 'application/json' }
                }
            )

            const authResponse: AuthResponse = response.data.data

            // Save new tokens
            setSession(authResponse)

            // Update authorization header
            apiClient.defaults.headers.common.Authorization = `Bearer ${authResponse.access_token}`
            originalRequest.headers.Authorization = `Bearer ${authResponse.access_token}`

            // Process queued requests
            processQueue(null, authResponse.access_token)

            return apiClient(originalRequest)
        } catch (refreshError) {
            processQueue(refreshError, null)
            clearSession()
            if (typeof window !== 'undefined') {
                window.location.href = '/login'
            }
            return Promise.reject(refreshError)
        } finally {
            isRefreshing = false
        }
    }
)

export default apiClient
