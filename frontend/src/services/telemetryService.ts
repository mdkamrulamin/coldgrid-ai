import { apiRequest } from "./apiClient"
import type { TelemetryRange, TelemetryReading } from "../types/telemetry"

type GetDeviceTelemetryOptions = {
    range?: TelemetryRange
    limit?: number
}

function buildTelemetryQuery(options?: GetDeviceTelemetryOptions) {
    const params = new URLSearchParams()
    if (options?.range) {
        params.set('range', options.range)
    }

    if (options?.limit) {
        params.set('limit', String(options.limit))
    }

    const queryString = params.toString()

    return queryString ? `?${queryString}` : ''

}

//Fetch all telemetry readings for a device using its public device UID.
export function getDeviceTelemetry(deviceUid: string, token: string, options?: GetDeviceTelemetryOptions) {
    return apiRequest<TelemetryReading[]>(`/devices/${deviceUid}/telemetry${buildTelemetryQuery(options)}`, {
        method: 'GET',
        token,
    })
}

//Fetch only the latest telemetry reading for a device
export function getLatestTelemetry(deviceUid: string, token: string) {
    return apiRequest<TelemetryReading>(`/devices/${deviceUid}/telemetry/latest`, {
        method: 'GET',
        token,
    })
}