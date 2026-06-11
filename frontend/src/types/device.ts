export type Device = {
    id: number
    deviceId: string
    name: string
    location: string
    storageType: string
    minTemperature: number
    maxTemperature: number
    minHumidity: number
    maxHumidity: number
    batteryThreshold: number
    createdAt: string
}           // Device object returned by the backend.

export type CreateDeviceRequest = {
    name: string
    location: string
    storageType: string
    minTemperature: number
    maxTemperature: number
    minHumidity: number
    maxHumidity: number
    batteryThreshold: number
}           // Request body for POST /devices.

// Response body from POST /devices. It includes apiKey only once after device creation.
export type CreateDeviceaResponse = Device & {
    apiKey: string
}