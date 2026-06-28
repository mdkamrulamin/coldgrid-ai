import { apiRequest } from "./apiClient"
import type { Alert, AlertFilters } from "../types/alert"

function buildAlertQuery(filters?: AlertFilters) {
    const params = new URLSearchParams()

    if (filters?.status) {
        params.set('status', filters.status)
    }
    if (filters?.severity) {
        params.set('severity', filters.severity)
    }
    const queryString = params.toString()
    return queryString ? `?${queryString}` : ''
}

// Fetch all alerts across all devices owned by the user.
export function getAlerts(token: string, filters?: AlertFilters) {
    return apiRequest<Alert[]>(`/alerts${buildAlertQuery(filters)}`, {
        method: 'GET',
        token,
    })
}

// Fetch alerts for signle device using public device UID.
export function getDeviceAlerts(deviceUid: string, token: string, filters?: AlertFilters) {
    return apiRequest<Alert[]>(`/devices/${deviceUid}/alerts${buildAlertQuery(filters)}`, {
        method: 'GET',
        token,
    })
}

//Resolve single alert.
export function resolveAlert(alertId: number, token: string) {
    return apiRequest<Alert>(`/alerts/${alertId}/resolve`, {
        method: 'PATCH',
        token,
    })
}