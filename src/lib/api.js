/**
 * api.js — Shared Axios instance with professional error handling
 *
 * All HTTP errors are normalized into a consistent AppError shape before
 * being re-thrown so every caller gets the same interface regardless of
 * whether the error came from the network, the server, or a timeout.
 */
import axios from "axios"

// ── AppError ──────────────────────────────────────────────────────────────────
// A typed error that every caller can rely on. Extends the native Error so
// instanceof checks and stack traces still work.
export class AppError extends Error {
    /**
     * @param {string}  message   Human-readable message safe to show the user
     * @param {number}  status    HTTP status code (0 = network / no response)
     * @param {'auth'|'network'|'validation'|'rateLimit'|'server'|'unknown'} type
     * @param {object}  [raw]     Original axios error — available in dev for debugging
     */
    constructor(message, status = 0, type = "unknown", raw = null) {
        super(message)
        this.name = "AppError"
        this.status = status
        this.type = type
        this.raw = import.meta.env.DEV ? raw : null   // never leak raw errors in prod
    }
}

// ── Error classifier ──────────────────────────────────────────────────────────
/**
 * Turns any Axios error into an AppError with a meaningful message and type.
 * Exported so tests can import it independently.
 */
export function classifyAxiosError(error, url = "") {
    // No response at all — network down, DNS failure, CORS preflight blocked, timeout
    if (!error.response) {
        if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
            return new AppError(
                "The request timed out. Please check your connection and try again.",
                0, "network", error
            )
        }
        return new AppError(
            "Unable to reach the server. Please check your internet connection.",
            0, "network", error
        )
    }

    const { status, data } = error.response
    // Prefer the server's own message, fall back to a sensible default
    const serverMessage = data?.message || null

    switch (status) {
        case 400:
            return new AppError(
                serverMessage || "The request contains invalid data. Please check your input.",
                400, "validation", error
            )
        case 401:
            return new AppError(
                serverMessage || "Your session has expired. Please sign in again.",
                401, "auth", error
            )
        case 403:
            return new AppError(
                serverMessage || "You don't have permission to perform this action.",
                403, "auth", error
            )
        case 404:
            return new AppError(
                serverMessage || "The requested resource was not found.",
                404, "unknown", error
            )
        case 409:
            return new AppError(
                serverMessage || "A conflict occurred. This resource may already exist.",
                409, "validation", error
            )
        case 413:
            return new AppError(
                "The file you uploaded is too large. Maximum size is 3 MB.",
                413, "validation", error
            )
        case 429:
            return new AppError(
                serverMessage || "You've made too many requests. Please wait a moment and try again.",
                429, "rateLimit", error
            )
        case 500:
        case 502:
        case 503:
        case 504:
            return new AppError(
                "Something went wrong on our end. Please try again in a few moments.",
                status, "server", error
            )
        default:
            return new AppError(
                serverMessage || `An unexpected error occurred (${status}).`,
                status, "unknown", error
            )
    }
}

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
    withCredentials: true,   // send httpOnly cookies cross-origin
    timeout: 90_000          // 90 s — AI endpoints can take ~40 s
})

// ── Response interceptor ──────────────────────────────────────────────────────
api.interceptors.response.use(
    // 2xx — pass straight through
    (response) => response,

    (error) => {
        const status  = error?.response?.status
        const method  = error?.config?.method?.toUpperCase() ?? "?"
        const url     = error?.config?.url ?? ""

        // ── Silent expected cases ──────────────────────────────────────────
        // GET /api/auth/get-me returning 401 is not an error — it simply means
        // the user has no active session yet. The useAuth hook handles it by
        // setting user to null and showing the login page. Logging this as an
        // error is misleading and pollutes the console.
        const isSilent =
            status === 401 && method === "GET" && url.includes("/api/auth/get-me")

        // ── Dev-only structured logging ────────────────────────────────────
        // In development, log real errors in a compact, readable format.
        // Nothing is ever logged in production — end users should not see
        // internal error details in the console.
        if (import.meta.env.DEV && !isSilent) {
            const label = status
                ? `%c[API ${status}]`
                : "%c[API Network Error]"
            const style = status >= 500
                ? "color:#ff4d4d;font-weight:bold"
                : status >= 400
                    ? "color:#f5a623;font-weight:bold"
                    : "color:#7d8590;font-weight:bold"

            console.groupCollapsed(`${label} ${method} ${url}`, style)
            console.log("Status  :", status || "no response")
            if (error.response?.data)
                console.log("Body    :", error.response.data)
            if (error.message)
                console.log("Message :", error.message)
            console.groupEnd()
        }

        // ── Normalize and re-throw ─────────────────────────────────────────
        // Always reject with an AppError so callers get a consistent interface.
        // Silent cases get an AppError too — the caller just won't toast it.
        return Promise.reject(classifyAxiosError(error, url))
    }
)

export default api
