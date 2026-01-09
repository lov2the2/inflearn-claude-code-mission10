import axios from 'axios'
import { clearSession } from '@/lib/auth/session'
import { API_CONFIG } from '@/lib/config/api'

/**
 * Axios instance for API requests
 * Configured with base URL, default headers, and cookie-based authentication
 * withCredentials enables automatic cookie transmission for HttpOnly cookies
 */
const apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: API_CONFIG.TIMEOUT,
    withCredentials: true,
})

/**
 * Request interceptor to add request ID for distributed tracing
 * Authentication is handled via HttpOnly cookies (no manual token injection)
 */
apiClient.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
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
 * Response interceptor for handling authentication errors
 * With cookie-based auth, backend handles token refresh automatically
 * Frontend only needs to handle session expiry (redirect to login)
 */
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // If 401 Unauthorized, session expired - redirect to login
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            // Clear client-side user data
            clearSession()

            // Redirect to login page
            if (typeof window !== 'undefined') {
                window.location.href = '/login'
            }
        }

        return Promise.reject(error)
    }
)

export default apiClient
