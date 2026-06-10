export type TelemetryReading = {
    id: number
    deviceId: string
    timestamp: string
    temperature: number
    humidity: number
    batteryLevel: number
    generatedPower: number
    coolingLoad: number
    windSpeed: number
    status: string
}           // Telemetry reading returned by the backend.