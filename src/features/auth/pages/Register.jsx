import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { toast } from 'sonner'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'
import { AppError } from '../../../lib/api'

const Register = () => {
    const navigate = useNavigate()
    const { handleRegister } = useAuth()

    const [username, setUsername] = useState("")
    const [email, setEmail]       = useState("")
    const [password, setPassword] = useState("")
    const [errors, setErrors]     = useState({})
    const [submitting, setSubmitting] = useState(false)

    const validate = () => {
        const e = {}
        if (!username.trim()) e.username = "Username is required"
        else if (username.trim().length < 3) e.username = "Username must be at least 3 characters"
        if (!email.trim()) e.email = "Email is required"
        else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email address"
        if (!password) e.password = "Password is required"
        else if (password.length < 6) e.password = "Password must be at least 6 characters"
        return e
    }

    const handleSubmit = async (evt) => {
        evt.preventDefault()
        const e = validate()
        if (Object.keys(e).length) { setErrors(e); return }
        setErrors({})
        setSubmitting(true)

        try {
            await handleRegister({ username, email, password })
            toast.success("Account created! Welcome aboard.")
            navigate("/")
        } catch (err) {
            if (err instanceof AppError && err.type === "network") {
                toast.error("No connection. Please check your internet and try again.")
            } else if (err instanceof AppError && err.type === "rateLimit") {
                toast.warning("Too many attempts. Please wait a moment before trying again.")
            } else {
                toast.error(err.message)
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <div className="auth-brand__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                        </svg>
                    </div>
                    <h1>Create account</h1>
                    <p>Start preparing smarter with AI</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            placeholder="e.g. johndoe"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className={errors.username ? "input--error" : ""}
                            aria-describedby={errors.username ? "username-error" : undefined}
                            autoComplete="username"
                        />
                        {errors.username && <p id="username-error" className="input-error-msg">{errors.username}</p>}
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Email address</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className={errors.email ? "input--error" : ""}
                            aria-describedby={errors.email ? "email-error" : undefined}
                            autoComplete="email"
                        />
                        {errors.email && <p id="email-error" className="input-error-msg">{errors.email}</p>}
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="At least 6 characters"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className={errors.password ? "input--error" : ""}
                            aria-describedby={errors.password ? "password-error" : undefined}
                            autoComplete="new-password"
                        />
                        {errors.password && <p id="password-error" className="input-error-msg">{errors.password}</p>}
                    </div>

                    <button
                        type="submit"
                        className="button primary-button auth-submit-btn"
                        disabled={submitting}
                    >
                        {submitting ? "Creating account…" : "Create Account"}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    )
}

export default Register
