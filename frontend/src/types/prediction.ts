export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type TemperatureThresholdDirection = 'high' | 'low'

export type Prediction = {
    id: number
    deviceDatabaseId: number
    deviceUid: string
    deviceName: string
    riskLevel: RiskLevel
    riskScore: number
    summary: string
    batteryCurrentLevel: number | null
    batteryDrainRatePerHour: number | null
    batteryThreshold: number | null
    estimatedHoursToBatteryThreshold: number | null
    batteryPredictionMessage: string | null
    currentTemperature: number | null
    temperatureChangeRatePerHour: number | null
    minTemperature: number | null
    maxTemperature: number | null
    estimatedHoursToTemperatureThreshold: number | null
    temperatureThresholdDirection: TemperatureThresholdDirection | null
    temperaturePredictionMessage: string | null
    generatedPowerCurrent: number | null
    coolingLoadCurrent: number | null
    powerToCoolingRatio: number | null
    activeAlertCount: number
    criticalAlertCount: number
    offlineAlertActive: boolean
    created: string
}