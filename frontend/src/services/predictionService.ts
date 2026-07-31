import { apiRequest } from "./apiClient"
import type { Prediction } from "../types/prediction"

// Fetch the latest stored prediction for a device.
export function getLatestDevicePrediction(deviceUid: string, token: string) {
    return apiRequest<Prediction>(
        `/devices/${deviceUid}/predictions/latest`,
        {
            method: 'GET',
            token,
        }
    )
}

export function runDevicePrediction(deviceUid: string, token: string) {
    return apiRequest<Prediction>(
        `/devices/${deviceUid}/predictions/run`,
        {
            method: 'POST',
            token,
        }
    )
}