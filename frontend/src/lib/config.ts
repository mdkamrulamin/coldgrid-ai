// Base URL for the FastAPI backend.
// Vite exposes environment variables through import.meta.env.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'