export type AISummaryRiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type AISummary = {
    id: number
    deviceDatabaseId: number
    deviceUid: string
    deviceName: string
    summary: string
    riskLevel: AISummaryRiskLevel
    recommendedActions: string[]
    dataStartAt: string
    dataEndAt: string
    telemetryCount: number
    activeAlertCount: number
    predictionId: number | null
    createdAt: string
}