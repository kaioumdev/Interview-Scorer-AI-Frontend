/**
 * Single shared Axios instance used by all API modules.
 * Base URL is read from the environment variable VITE_API_URL, falling
 * back to localhost for local development.
 */
import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
    withCredentials: true
})

/**
 * Response interceptor — suppress expected 401s from the console.
 *
 * A 401 on GET /api/auth/get-me simply means the user has no active session
 * (not logged in yet, or cookie expired). This is normal, expected behavior —
 * not an error. Without this interceptor Axios logs it as a red console error,
 * which is misleading.
 *
 * Real 401s on other endpoints (e.g. trying to access interview reports without
 * being logged in) still propagate normally so callers can handle them.
 */
api.interceptors.response.use(
    // Pass successful responses straight through
    (response) => response,

    (error) => {
        const status = error?.response?.status
        const url = error?.config?.url || ""

        // Silence the console noise for the session-check endpoint.
        // A 401 here just means "no active session" — the catch block in
        // useAuth handles it correctly by setting user to null.
        const isExpected401 =
            status === 401 && url.includes("/api/auth/get-me")

        if (!isExpected401) {
            // Only log unexpected errors (real failures, 500s, network errors, etc.)
            // Avoid logging in production to keep the console clean for end users.
            if (import.meta.env.DEV) {
                console.error(
                    `[API Error] ${error?.config?.method?.toUpperCase()} ${url} → ${status || "Network Error"}`,
                    error?.response?.data?.message || error.message
                )
            }
        }

        // Always reject so callers' catch blocks still run correctly
        return Promise.reject(error)
    }
)

export default api
