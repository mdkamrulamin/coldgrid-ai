import { apiRequest } from "./apiClient"
import type { AISummary } from "../types/aiSummary"

// Fetch latest stored AI summary for a device.
export function getLatestDeviceAISummary(deviceUid: string, token: string) {
    return apiRequest<AISummary>(
        `/devices/${deviceUid}/ai-summary/latest`,
        {
            method: 'GET',
            token,
        },
    )
}

// Generate a new AI summary and store it in the backend.
export function generateDeviceAISummary(deviceUid: string, token: string) {
    return apiRequest<AISummary>(
        `/devices/${deviceUid}/ai-summary`,
        {
            method: 'POST',
            token,
        },
    )
}