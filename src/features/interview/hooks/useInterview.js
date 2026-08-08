import { useContext } from "react"
import { InterviewContext } from "../interview.context"
import { AppError } from "../../../lib/api"
import {
    getAllInterviewReports,
    generateInterviewReport,
    getInterviewReportById,
    generateResumePdf
} from "../services/interview.api"

// ── User-friendly messages keyed by AppError type ─────────────────────────────
const FALLBACK_MESSAGES = {
    network:    "No internet connection. Please check your network and try again.",
    rateLimit:  "You've reached the hourly limit. Please wait a moment and try again.",
    server:     "Something went wrong on our end. Please try again in a few moments.",
    auth:       "Your session has expired. Please sign in again.",
    validation: "Invalid request. Please check your input.",
    unknown:    "An unexpected error occurred. Please try again."
}

function toAppError(err, fallback) {
    if (err instanceof AppError) return err
    return new AppError(err?.message || fallback, 0, "unknown")
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export const useInterview = () => {
    const context = useContext(InterviewContext)
    if (!context) throw new Error("useInterview must be used within an InterviewProvider")

    const { loading, setLoading, report, setReport, reports, setReports } = context

    // ── Generate report ────────────────────────────────────────────────────────
    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        try {
            const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (err) {
            throw toAppError(err, FALLBACK_MESSAGES.unknown)
        } finally {
            setLoading(false)
        }
    }

    // ── Get single report ──────────────────────────────────────────────────────
    const getReportById = async (interviewId) => {
        setLoading(true)
        try {
            const response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (err) {
            throw toAppError(err, FALLBACK_MESSAGES.unknown)
        } finally {
            setLoading(false)
        }
    }

    // ── Get all reports ────────────────────────────────────────────────────────
    const getReports = async () => {
        setLoading(true)
        try {
            const response = await getAllInterviewReports()
            setReports(response.interviewReports)
            return response.interviewReports
        } catch (err) {
            throw toAppError(err, FALLBACK_MESSAGES.unknown)
        } finally {
            setLoading(false)
        }
    }

    // ── Download resume PDF ────────────────────────────────────────────────────
    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        try {
            const blob = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (err) {
            throw toAppError(err, FALLBACK_MESSAGES.unknown)
        } finally {
            setLoading(false)
        }
    }

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }
}
