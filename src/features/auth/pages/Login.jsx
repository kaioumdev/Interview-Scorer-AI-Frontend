import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { toast } from 'sonner'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Login = () => {
    const { handleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errors, setErrors] = useState({})
    const [submitting, setSubmitting] = useState(false)

    const validate = () => {
        const e = {}
        if (!email.trim()) e.email = "Email is required"
        else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email address"
        if (!password) e.password = "Password is required"
        return e
    }

    const handleSubmit = async (evt) => {
        evt.preventDefault()
        const e = validate()
        if (Object.keys(e).length) { setErrors(e); return }
        setErrors({})
        setSubmitting(true)
        try {
            await handleLogin({ email, password })
            toast.success("Welcome back!")
            navigate('/')
        } catch (err) {
            toast.error(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* Brand */}
                <div className="auth-brand">
                    <div className="auth-brand__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                        </svg>
                    </div>
                    <h1>Welcome back</h1>
                    <p>Sign in to your InterviewAI account</p>
                </div>

                {/* Form */}
                <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
                        />
                        {errors.email && <p id="email-error" className="input-error-msg">{errors.email}</p>}
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className={errors.password ? "input--error" : ""}
                            aria-describedby={errors.password ? "password-error" : undefined}
                        />
                        {errors.password && <p id="password-error" className="input-error-msg">{errors.password}</p>}
                    </div>

                    <button
                        type="submit"
                        className="button primary-button auth-submit-btn"
                        disabled={submitting}
                    >
                        {submitting ? "Signing in…" : "Sign In"}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account? <Link to="/register">Create one</Link>
                </p>
            </div>
        </div>
    )
}

export default Login
