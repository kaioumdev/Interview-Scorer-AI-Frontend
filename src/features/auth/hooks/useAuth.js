import { useContext, useEffect } from "react"
import { AuthContext } from "../auth.context"
import { login, register, logout, getMe } from "../services/auth.api"

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth must be used within an AuthProvider")

    const { user, setUser, loading, setLoading } = context

    /**
     * Returns the logged-in user on success, throws on failure.
     * Callers can toast the error message.
     */
    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            setUser(data.user)
            return data.user
        } catch (err) {
            const message = err?.response?.data?.message || "Login failed. Please try again."
            throw new Error(message)
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            setUser(data.user)
            return data.user
        } catch (err) {
            const message = err?.response?.data?.message || "Registration failed. Please try again."
            throw new Error(message)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
        } catch (err) {
            // Logout should still clear client state even if server call fails
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    // Rehydrate session on mount
    useEffect(() => {
        const init = async () => {
            try {
                const data = await getMe()
                setUser(data.user)
            } catch {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [])

    return { user, loading, handleRegister, handleLogin, handleLogout }
}
