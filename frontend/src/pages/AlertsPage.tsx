import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import PageHeader from "../components/layout/PageHeader"
import PageLayout from "../components/layout/PageLayout"
import Card from "../components/ui/Card"
import FormError from "../components/ui/FormError"
import SeverityBadge from "../components/ui/SeverityBadge"
import StatusBadge from "../components/ui/StatusBadge"
import Button from "../components/ui/Button"
import { useAuth } from "../lib/AuthContext"
import { getAlerts, resolveAlert } from "../services/alertService"
import type { Alert, AlertSeverity, AlertStatus } from "../types/alert"

function formatAlertType(alertType: string) {
    return alertType.split('_')
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(' ')
}

function AlertsPage() {
    const { token } = useAuth()
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [statusFilter, setStatusFilter] = useState<AlertStatus | ''>('')
    const [severityFilter, setSeverityFilter] = useState<AlertSeverity | ''>('')
    const [isLoading, setIsLoading] = useState(true)
    const [isResolvingId, setIsResolvingId] = useState<number | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null)

    useEffect(() => {
        async function loadAlerts() {
            if (!token) {
                return
            }
            try {
                setErrorMessage(null)
                const alertList = await getAlerts(token, {
                    status: statusFilter || undefined,
                    severity: severityFilter || undefined,
                })
                setAlerts(alertList)
                setLastRefreshedAt(new Date())
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unable to load alerts.'
                setErrorMessage(message)
            } finally {
                setIsLoading(false)
            }
        }
        loadAlerts() //Load immediately.

        const intervalId = window.setInterval(() => {
            loadAlerts()
        }, 5000)

        return () => {
            window.clearInterval(intervalId)
        }
    }, [severityFilter, statusFilter, token])

    async function handleResolveAlert(alertId: number) {
        if (!token) {
            return
        }
        try {
            setIsResolvingId(alertId)
            setErrorMessage(null)
            const updatedAlert = await resolveAlert(alertId, token)

            // Update the resolved alert in the UI without full reload.
            setAlerts((currentAlerts) =>
                currentAlerts.map((alert) => alert.id === updatedAlert.id ? updatedAlert : alert)
            )
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to resolve alert.'
            setErrorMessage(message)
        } finally {
            setIsResolvingId(null)
        }
    }

    const activeAlertCount = alerts.filter((alert) => alert.status === 'active').length
    const criticalAlertCount = alerts.filter((alert) =>
        alert.severity === 'critical' && alert.status === 'active').length

    return (
        <PageLayout>
            <PageHeader
                title="Alerts"
                description="Review active and resolved system health alerts across your devices."
            />

            {lastRefreshedAt && (
                <p className="mt-4 text-sm text-slate-500">
                    Last updated: {lastRefreshedAt.toLocaleTimeString()}
                </p>
            )}
            <div className="mt-8 grid gap-4 md:grid-cols-3">
                <Card>
                    <p className="text-sm text-slate-500">Visible alerts</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                        {alerts.length}
                    </p>
                </Card>
                <Card>
                    <p className="text-sm text-slate-500">Active alerts</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                        {activeAlertCount}
                    </p>
                </Card>
                <Card>
                    <p className="text-sm text-slate-500">Active critical alerts</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                        {criticalAlertCount}
                    </p>
                </Card>
            </div>
            <Card className="mt-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Alert history
                        </h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Filter alerts by status or severity.
                        </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="text-sm">
                            <span className="block font-medium text-slate-700">Status</span>
                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(event.target.value as AlertStatus | '')
                                }
                                className="mt-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            >
                                <option value="">All</option>
                                <option value="active">Active</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </label>
                        <label className="text-sm">
                            <span className="block font-medium text-slate-700">Severity</span>
                            <select
                                value={severityFilter}
                                onChange={(event) =>
                                    setSeverityFilter(event.target.value as AlertSeverity | '')
                                }
                                className="mt-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            >
                                <option value="">All</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </label>
                    </div>
                </div>
                <div className="mt-5">
                    <FormError message={errorMessage} />
                    {isLoading && (
                        <p className="text-sm text-slate-600">Loading alerts...</p>
                    )}
                    {!isLoading && alerts.length === 0 && (
                        <p className="text-sm text-slate-600">
                            No alerts found for the selected filter.
                        </p>
                    )}
                    {!isLoading && alerts.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead>
                                    <tr className="text-left text-slate-500">
                                        <th className="py-3 pr-4 font-medium">Alert</th>
                                        <th className="py-3 pr-4 font-medium">Device</th>
                                        <th className="py-3 pr-4 font-medium">Severity</th>
                                        <th className="py-3 pr-4 font-medium">Status</th>
                                        <th className="py-3 pr-4 font-medium">Created</th>
                                        <th className="py-3 pr-4 font-medium">Resolved</th>
                                        <th className="py-3 pr-4 font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {alerts.map((alert) => (
                                        <tr key={alert.id}>
                                            <td className="py-4 pr-4 align-top">
                                                <p className="font-medium text-slate-900">
                                                    {formatAlertType(alert.alertType)}
                                                </p>
                                                <p className="mt-1 max-w-md text-sm text-slate-600">
                                                    {alert.message}
                                                </p>
                                            </td>
                                            <td className="py-4 pr-4 align-top">
                                                <Link
                                                    to={`/devices/${alert.deviceDatabaseId}`}
                                                    className="font-medium text-emerald-700 hover:text-emerald-800"
                                                >
                                                    {alert.deviceName}
                                                </Link>
                                                <p className="mt-1 font-mono text-xs text-slate-500">
                                                    {alert.deviceUid}
                                                </p>
                                            </td>
                                            <td className="py-4 pr-4 align-top">
                                                <SeverityBadge severity={alert.severity} />
                                            </td>
                                            <td className="py-4 pr-4 align-top">
                                                <StatusBadge status={alert.status} />
                                            </td>
                                            <td className="py-4 pr-4 align-top text-slate-700">
                                                {new Date(alert.createdAt).toLocaleString()}
                                            </td>
                                            <td className="py-4 pr-4 align-top text-slate-700">
                                                {alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleString() : '-'}
                                            </td>
                                            <td className="py-4 pr-4 align-top">
                                                {alert.status === 'active' ? (
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="sm"
                                                        fullWidth={false}
                                                        onClick={() => handleResolveAlert(alert.id)}
                                                        disabled={isResolvingId === alert.id}
                                                    >
                                                        {isResolvingId === alert.id ? 'Resolving...' : 'Resolve'}
                                                    </Button>
                                                ) : (
                                                    <span className="text-xs text-slate-500">
                                                        No action
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Card>
        </PageLayout>
    )
}

export default AlertsPage