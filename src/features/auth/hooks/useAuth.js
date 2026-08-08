import { useContext, useEffect } from "react"
import { AuthContext } from "../auth.context"
import { login, register, logout, getMe } from "../services/auth.api"
import { AppError } from "../../../lib/api"

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth must be used within an AuthProvider")

    const { user, setUser, loading, setLoading } = context

    // ── Login ──────────────────────────────────────────────────────────────────
    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            setUser(data.user)
            return data.user
        } catch (err) {
            // Re-throw as AppError so the caller (Login page) can toast the message
            throw err instanceof AppError
                ? err
                : new AppError(err?.message || "Login failed. Please try again.", 0, "unknown")
        } finally {
            setLoading(false)
        }
    }

    // ── Register ───────────────────────────────────────────────────────────────
    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            setUser(data.user)
            return data.user
        } catch (err) {
            throw err instanceof AppError
                ? err
                : new AppError(err?.message || "Registration failed. Please try again.", 0, "unknown")
        } finally {
            setLoading(false)
        }
    }

    // ── Logout ─────────────────────────────────────────────────────────────────
    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
        } catch {
            // Swallow — we always clear client state regardless of server response
        } finally {
            setUser(null)
            setLoading(false)
        }
    }

    // ── Session rehydration on mount ───────────────────────────────────────────
    // Calls GET /api/auth/get-me to check for an existing cookie-based session.
    //
    // A 401 response here is EXPECTED and SILENT — it simply means the user
    // has no active session (first visit, cookie expired, logged out elsewhere).
    // The api.js interceptor already suppresses the console noise for this case.
    // We just set user to null and let Protected redirect to /login.
    useEffect(() => {
        const initSession = async () => {
            try {
                const data = await getMe()
                setUser(data.user)
            } catch (err) {
                // 401 = no session (expected) — silent
                // Any other error (network, 500) = also silent here;
                // the user will just be sent to the login page.
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        initSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return { user, loading, handleRegister, handleLogin, handleLogout }
}
