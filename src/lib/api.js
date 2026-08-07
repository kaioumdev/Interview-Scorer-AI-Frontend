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

export default api
