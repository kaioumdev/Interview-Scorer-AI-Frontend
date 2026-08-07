import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router'
import { toast } from 'sonner'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'

const NAV_ITEMS = [
    {
        id: 'technical', label: 'Technical Questions',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
    },
    {
        id: 'behavioral', label: 'Behavioral Questions',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
    },
    {
        id: 'roadmap', label: 'Road Map',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
    },
    {
        id: 'mock', label: 'Mock Interview',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    },
]

// ── Score helpers ─────────────────────────────────────────────────────────────
function scoreColor(score) {
    if (score >= 80) return 'score--high'
    if (score >= 60) return 'score--mid'
    return 'score--low'
}
function scoreLabel(score) {
    if (score >= 80) return 'Strong match for this role'
    if (score >= 60) return 'Moderate match — preparation will help'
    return 'Low match — focused study needed'
}

const SEVERITY_LABELS = {
    high: 'Critical gap — heavily impacts hiring chances',
    medium: 'Notable gap — worth investing time in',
    low: 'Minor gap — nice to address'
}

// ── Question Card (accordion) ─────────────────────────────────────────────────
const QuestionCard = ({ item, index }) => {
    const [open, setOpen] = useState(false)

    return (
        <div className={`q-card ${open ? 'q-card--open' : ''}`}>
            <button
                className='q-card__header'
                onClick={() => setOpen(o => !o)}
                aria-expanded={open}
            >
                <span className='q-card__index'>Q{index + 1}</span>
                <p className='q-card__question'>{item.question}</p>
                <span className={`q-card__chevron ${open ? 'q-card__chevron--open' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </span>
            </button>
            <div className='q-card__body-wrapper'>
                <div className='q-card__body'>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--intention'>Intention</span>
                        <p>{item.intention}</p>
                    </div>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--answer'>Model Answer</span>
                        <p>{item.answer}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Road Map Day ──────────────────────────────────────────────────────────────
const RoadMapDay = ({ day }) => (
    <div className='roadmap-day'>
        <div className='roadmap-day__header'>
            <span className='roadmap-day__badge'>Day {day.day}</span>
            <h3 className='roadmap-day__focus'>{day.focus}</h3>
        </div>
        <ul className='roadmap-day__tasks'>
            {day.tasks.map((task, i) => (
                <li key={i}>
                    <span className='roadmap-day__bullet' />
                    {task}
                </li>
            ))}
        </ul>
    </div>
)

// ── Mock Interview Mode ───────────────────────────────────────────────────────
const MockInterview = ({ questions }) => {
    const allQ = questions
    const [idx, setIdx] = useState(0)
    const [userAnswer, setUserAnswer] = useState("")
    const [revealed, setRevealed] = useState(false)
    const [confidence, setConfidence] = useState(null)  // 'low' | 'mid' | 'high'
    const [scores, setScores] = useState([])

    const current = allQ[idx]

    const handleReveal = () => setRevealed(true)

    const handleConfidence = (level) => {
        setConfidence(level)
        setScores(s => [...s, { q: idx, level }])
    }

    const handleNext = () => {
        setIdx(i => i + 1)
        setUserAnswer("")
        setRevealed(false)
        setConfidence(null)
    }

    const handleRestart = () => {
        setIdx(0)
        setUserAnswer("")
        setRevealed(false)
        setConfidence(null)
        setScores([])
    }

    if (allQ.length === 0) {
        return <p className='mock-empty'>No questions available.</p>
    }

    if (idx >= allQ.length) {
        const highCount = scores.filter(s => s.level === 'high').length
        const midCount = scores.filter(s => s.level === 'mid').length
        const lowCount = scores.filter(s => s.level === 'low').length
        return (
            <div className='mock-summary'>
                <div className='mock-summary__icon'>🎉</div>
                <h3>Session Complete!</h3>
                <p>You answered {allQ.length} questions.</p>
                <div className='mock-summary__stats'>
                    <div className='mock-stat mock-stat--high'><span>{highCount}</span> Confident</div>
                    <div className='mock-stat mock-stat--mid'><span>{midCount}</span> Okay</div>
                    <div className='mock-stat mock-stat--low'><span>{lowCount}</span> Needs work</div>
                </div>
                <button className='button primary-button' onClick={handleRestart}>Practice Again</button>
            </div>
        )
    }

    return (
        <div className='mock-interview'>
            <div className='mock-progress'>
                <div className='mock-progress__bar'>
                    <div className='mock-progress__fill' style={{ width: `${(idx / allQ.length) * 100}%` }} />
                </div>
                <span className='mock-progress__label'>{idx + 1} / {allQ.length}</span>
            </div>

            <div className='mock-card'>
                <div className='mock-card__question'>
                    <span className='mock-card__num'>Q{idx + 1}</span>
                    <p>{current.question}</p>
                </div>

                <textarea
                    className='mock-card__textarea'
                    placeholder='Type your answer here before revealing the model answer…'
                    value={userAnswer}
                    onChange={e => setUserAnswer(e.target.value)}
                    rows={5}
                />

                {!revealed ? (
                    <button className='button primary-button mock-reveal-btn' onClick={handleReveal}>
                        Reveal Model Answer
                    </button>
                ) : (
                    <>
                        <div className='mock-card__answer'>
                            <span className='mock-card__answer-label'>Model Answer</span>
                            <p>{current.answer}</p>
                        </div>
                        {!confidence && (
                            <div className='mock-confidence'>
                                <p className='mock-confidence__label'>How did you do?</p>
                                <div className='mock-confidence__buttons'>
                                    <button className='confidence-btn confidence-btn--low' onClick={() => handleConfidence('low')}>
                                        😬 Needs Work
                                    </button>
                                    <button className='confidence-btn confidence-btn--mid' onClick={() => handleConfidence('mid')}>
                                        🙂 Okay
                                    </button>
                                    <button className='confidence-btn confidence-btn--high' onClick={() => handleConfidence('high')}>
                                        💪 Nailed It
                                    </button>
                                </div>
                            </div>
                        )}
                        {confidence && (
                            <button className='button primary-button mock-next-btn' onClick={handleNext}>
                                {idx < allQ.length - 1 ? 'Next Question →' : 'See Results'}
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

// ── Main Component ────────────────────────────────────────────────────────────
const Interview = () => {
    const [activeNav, setActiveNav] = useState('technical')
    const [downloadingPdf, setDownloadingPdf] = useState(false)
    const { report, getReportById, loading, getResumePdf } = useInterview()
    const { interviewId } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId).catch(err => {
                toast.error(err.message)
                navigate('/')
            })
        }
    }, [interviewId])

    const handleDownloadPdf = async () => {
        setDownloadingPdf(true)
        const id = toast.loading("Generating tailored resume…")
        try {
            await getResumePdf(interviewId)
            toast.success("Resume downloaded!", { id })
        } catch (err) {
            toast.error(err.message, { id })
        } finally {
            setDownloadingPdf(false)
        }
    }

    if (loading || !report) {
        return (
            <main className='loading-screen'>
                <div className='spinner' aria-label="Loading" />
                <p>Loading your interview plan…</p>
            </main>
        )
    }

    const sc = scoreColor(report.matchScore)
    const sl = scoreLabel(report.matchScore)

    // Combine tech + behavioral for mock mode
    const allQuestions = [
        ...report.technicalQuestions,
        ...report.behavioralQuestions
    ]

    return (
        <div className='interview-page'>
            <div className='interview-layout'>

                {/* ── Left Nav ── */}
                <nav className='interview-nav' aria-label="Interview sections">
                    <div className='nav-content'>
                        {/* Back link */}
                        <Link to='/' className='nav-back'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                            All Plans
                        </Link>

                        <p className='interview-nav__label'>Sections</p>
                        {NAV_ITEMS.map(item => (
                            <button
                                key={item.id}
                                className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                                onClick={() => setActiveNav(item.id)}
                                aria-current={activeNav === item.id ? 'page' : undefined}
                            >
                                <span className='interview-nav__icon'>{item.icon}</span>
                                {item.label}
                                {item.id === 'mock' && (
                                    <span className='nav-badge-new'>NEW</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Download Resume */}
                    <button
                        onClick={handleDownloadPdf}
                        className='button primary-button download-btn'
                        disabled={downloadingPdf}
                    >
                        {downloadingPdf ? (
                            <><span className='btn-spinner' />Generating…</>
                        ) : (
                            <>
                                <svg height="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956Z" />
                                </svg>
                                Download Resume
                            </>
                        )}
                    </button>
                </nav>

                <div className='interview-divider' />

                {/* ── Center Content ── */}
                <main className='interview-content'>

                    {activeNav === 'technical' && (
                        <section>
                            <div className='content-header'>
                                <h2>Technical Questions</h2>
                                <span className='content-header__count'>{report.technicalQuestions.length} questions</span>
                            </div>
                            <div className='q-list'>
                                {report.technicalQuestions.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'behavioral' && (
                        <section>
                            <div className='content-header'>
                                <h2>Behavioral Questions</h2>
                                <span className='content-header__count'>{report.behavioralQuestions.length} questions</span>
                            </div>
                            <div className='q-list'>
                                {report.behavioralQuestions.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'roadmap' && (
                        <section>
                            <div className='content-header'>
                                <h2>Preparation Road Map</h2>
                                <span className='content-header__count'>{report.preparationPlan.length}-day plan</span>
                            </div>
                            <div className='roadmap-list'>
                                {report.preparationPlan.map((day) => (
                                    <RoadMapDay key={day.day} day={day} />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'mock' && (
                        <section>
                            <div className='content-header'>
                                <h2>Mock Interview</h2>
                                <span className='content-header__count'>{allQuestions.length} questions</span>
                            </div>
                            <MockInterview questions={allQuestions} />
                        </section>
                    )}

                </main>

                <div className='interview-divider' />

                {/* ── Right Sidebar ── */}
                <aside className='interview-sidebar'>

                    {/* Match Score */}
                    <div className='match-score'>
                        <p className='match-score__label'>Match Score</p>
                        <div className={`match-score__ring ${sc}`}>
                            <span className='match-score__value'>{report.matchScore}</span>
                            <span className='match-score__pct'>%</span>
                        </div>
                        <p className={`match-score__sub match-score__sub--${sc}`}>{sl}</p>
                    </div>

                    <div className='sidebar-divider' />

                    {/* Skill Gaps */}
                    <div className='skill-gaps'>
                        <p className='skill-gaps__label'>Skill Gaps</p>
                        <div className='skill-gaps__list'>
                            {report.skillGaps.map((gap, i) => (
                                <span
                                    key={i}
                                    className={`skill-tag skill-tag--${gap.severity}`}
                                    title={SEVERITY_LABELS[gap.severity]}
                                    aria-label={`${gap.skill} — ${SEVERITY_LABELS[gap.severity]}`}
                                >
                                    {gap.skill}
                                </span>
                            ))}
                        </div>
                        <div className='severity-legend'>
                            {['high', 'medium', 'low'].map(s => (
                                <div key={s} className={`legend-item legend-item--${s}`}>
                                    <span className='legend-dot' />
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='sidebar-divider' />

                    {/* Quick Stats */}
                    <div className='quick-stats'>
                        <p className='skill-gaps__label'>Quick Stats</p>
                        <div className='quick-stat'>
                            <span className='quick-stat__val'>{report.technicalQuestions.length}</span>
                            <span className='quick-stat__lbl'>Technical Qs</span>
                        </div>
                        <div className='quick-stat'>
                            <span className='quick-stat__val'>{report.behavioralQuestions.length}</span>
                            <span className='quick-stat__lbl'>Behavioral Qs</span>
                        </div>
                        <div className='quick-stat'>
                            <span className='quick-stat__val'>{report.preparationPlan.length}</span>
                            <span className='quick-stat__lbl'>Day Plan</span>
                        </div>
                    </div>

                </aside>
            </div>
        </div>
    )
}

export default Interview
