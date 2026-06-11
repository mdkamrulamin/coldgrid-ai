import { apiRequest } from "./apiClient"
import type { TelemetryReading } from "../types/telemetry"

//Fetch all telemetry readings for a device using its public device UID.
export function getDeviceTelemetry(deviceUid: string, token: string) {
    return apiRequest<TelemetryReading[]>(`/devices/${deviceUid}/telemetry`, {
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