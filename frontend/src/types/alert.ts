export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'

export type AlertStatus = 'active' | 'resolved'

export type Alert = {
    id: number
    deviceDatabaseId: number
    deviceUid: string
    deviceName: string
    alertType: string
    severity: AlertSeverity
    message: string
    status: AlertStatus
    createdAt: string
    resolvedAt: string | null
}

export type AlertFilters = {
    status?: AlertStatus
    severity?: AlertSeverity
}