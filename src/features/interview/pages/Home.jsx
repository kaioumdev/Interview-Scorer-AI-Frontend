import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useAuth } from '../../auth/hooks/useAuth'

const JD_MAX = 5000

const Home = () => {
    const { loading, generateReport, reports, getReports } = useInterview()
    const { user, handleLogout } = useAuth()
    const navigate = useNavigate()

    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [fileName, setFileName] = useState(null)
    const [generating, setGenerating] = useState(false)
    const resumeInputRef = useRef()

    // Load reports on mount
    useEffect(() => {
        getReports().catch(() => { })
    }, [])

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        setFileName(file ? file.name : null)
    }

    const handleGenerateReport = async () => {
        if (!jobDescription.trim() || jobDescription.trim().length < 20) {
            toast.error("Please enter a job description (at least 20 characters).")
            return
        }
        const resumeFile = resumeInputRef.current?.files[0]
        if (!resumeFile && !selfDescription.trim()) {
            toast.error("Please upload a resume or add a self description.")
            return
        }

        setGenerating(true)
        const toastId = toast.loading("Generating your interview plan… (~30s)")
        try {
            const data = await generateReport({ jobDescription, selfDescription, resumeFile })
            toast.success("Interview plan ready!", { id: toastId })
            navigate(`/interview/${data._id}`)
        } catch (err) {
            toast.error(err.message, { id: toastId })
        } finally {
            setGenerating(false)
        }
    }

    const handleLogoutClick = async () => {
        await handleLogout()
        toast.success("Logged out successfully.")
        navigate('/login')
    }

    const jdLength = jobDescription.length
    const jdNearLimit = jdLength > JD_MAX * 0.85

    return (
        <div className='home-page'>

            {/* ── Top Nav ── */}
            <nav className='top-nav'>
                <div className='top-nav__brand'>
                    <span className='top-nav__star'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                        </svg>
                    </span>
                    <span className='top-nav__name'>InterviewAI</span>
                </div>
                <div className='top-nav__right'>
                    <span className='top-nav__user'>@{user?.username}</span>
                    <button className='button ghost-button top-nav__logout' onClick={handleLogoutClick}>
                        Sign out
                    </button>
                </div>
            </nav>

            {/* ── Page Header ── */}
            <header className='page-header'>
                <h1>Create Your Custom <span className='highlight'>Interview Plan</span></h1>
                <p>Let AI analyze the job requirements and your profile to build a winning strategy.</p>
            </header>

            {/* ── Main Card ── */}
            <div className='interview-card'>
                <div className='interview-card__body'>

                    {/* Left Panel — Job Description */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                </svg>
                            </span>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            className='panel__textarea'
                            placeholder={`Paste the full job description here…\ne.g. "Senior Frontend Engineer at Google — requires proficiency in React, TypeScript, and large-scale system design…"`}
                            maxLength={JD_MAX}
                            aria-label="Job description"
                        />
                        <div className={`char-counter ${jdNearLimit ? 'char-counter--warn' : ''}`}>
                            {jdLength.toLocaleString()} / {JD_MAX.toLocaleString()} chars
                        </div>
                    </div>

                    <div className='panel-divider' />

                    {/* Right Panel — Profile */}
                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </span>
                            <h2>Your Profile</h2>
                        </div>

                        {/* Upload Resume */}
                        <div className='upload-section'>
                            <label className='section-label'>
                                Upload Resume
                                <span className='badge badge--best'>Best Results</span>
                            </label>
                            <label className={`dropzone ${fileName ? 'dropzone--selected' : ''}`} htmlFor='resume'>
                                {fileName ? (
                                    <>
                                        <span className='dropzone__icon dropzone__icon--success'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </span>
                                        <p className='dropzone__title dropzone__title--success'>{fileName}</p>
                                        <p className='dropzone__subtitle'>Click to change file</p>
                                    </>
                                ) : (
                                    <>
                                        <span className='dropzone__icon'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="16 16 12 12 8 16" />
                                                <line x1="12" y1="12" x2="12" y2="21" />
                                                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                                            </svg>
                                        </span>
                                        <p className='dropzone__title'>Click to upload or drag &amp; drop</p>
                                        <p className='dropzone__subtitle'>PDF or DOCX (Max 3 MB)</p>
                                    </>
                                )}
                                <input
                                    ref={resumeInputRef}
                                    hidden
                                    type='file'
                                    id='resume'
                                    name='resume'
                                    accept='.pdf,.docx'
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>

                        {/* OR Divider */}
                        <div className='or-divider'><span>OR</span></div>

                        {/* Self Description */}
                        <div className='self-description'>
                            <label className='section-label' htmlFor='selfDescription'>Quick Self-Description</label>
                            <textarea
                                id='selfDescription'
                                value={selfDescription}
                                onChange={(e) => setSelfDescription(e.target.value)}
                                className='panel__textarea panel__textarea--short'
                                placeholder="Briefly describe your experience, key skills, and years of experience…"
                                aria-label="Self description"
                            />
                        </div>

                        {/* Info Box */}
                        <div className='info-box'>
                            <span className='info-box__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" />
                                </svg>
                            </span>
                            <p>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.</p>
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div className='interview-card__footer'>
                    <span className='footer-info'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '0.35rem' }}>
                            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                        </svg>
                        AI-Powered · Approx 30s
                    </span>
                    <button
                        onClick={handleGenerateReport}
                        className='generate-btn'
                        disabled={generating}
                        aria-busy={generating}
                    >
                        {generating ? (
                            <>
                                <span className='btn-spinner' />
                                Generating…
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                                </svg>
                                Generate My Interview Strategy
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* ── Recent Reports ── */}
            {!loading && (
                <section className='recent-reports'>
                    <h2>My Recent Interview Plans</h2>
                    {reports.length === 0 ? (
                        <div className='empty-state'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                            </svg>
                            <p>No plans yet. Generate your first interview strategy above.</p>
                        </div>
                    ) : (
                        <ul className='reports-list'>
                            {reports.map(report => {
                                const scoreClass = report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'
                                return (
                                    <li
                                        key={report._id}
                                        className='report-item'
                                        onClick={() => navigate(`/interview/${report._id}`)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={e => e.key === 'Enter' && navigate(`/interview/${report._id}`)}
                                        aria-label={`Open ${report.title || 'Untitled Position'} interview plan`}
                                    >
                                        <div className='report-item__header'>
                                            <h3>{report.title || 'Untitled Position'}</h3>
                                            <span className={`report-score ${scoreClass}`}>{report.matchScore}%</span>
                                        </div>
                                        <p className='report-meta'>
                                            {new Date(report.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </p>
                                        <div className='report-item__footer'>
                                            <span className='report-arrow'>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="9 18 15 12 9 6" />
                                                </svg>
                                            </span>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </section>
            )}

            {/* ── Footer ── */}
            <footer className='page-footer'>
                <span>© {new Date().getFullYear()} InterviewAI</span>
            </footer>
        </div>
    )
}

export default Home
