import { apiRequest } from "./apiClient"
import type { CreateDeviceRequest, CreateDeviceaResponse, Device, } from "../types/device"

//Fetch all devices owned by the logged-in user.
export function getDevices(token: string) {
    return apiRequest<Device[]>('/devices', {
        method: 'GET',
        token,
    })
}

//Fetch one device by its internal db ID.
export function getDevice(deviceId: number, token: string) {
    return apiRequest<Device>(`/devices/${deviceId}`, {
        method: 'GET',
        token,
    })
}

//Create a new device. The backend will reutnr the raw API key once.
export function createDevice(payload: CreateDeviceRequest, token: string) {
    return apiRequest<CreateDeviceaResponse>('/devices', {
        method: 'POST',
        body: payload,
        token,
    })
}

export function updateDevice(deviceId: number, payload: Partial<CreateDeviceRequest>, token: string) {
    return apiRequest<Device>(`/devices/${deviceId}`, {
        method: 'PATCH',
        body: payload,
        token,
    })
}

//Delete one device by its internal db ID.
export function deleteDevice(deviceId: number, token: string) {
    return apiRequest<void>(`/devices/${deviceId}`, {
        method: 'DELETE',
        token,
    })
}