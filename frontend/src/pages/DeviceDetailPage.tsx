import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import PageHeader from "../components/layout/PageHeader"
import PageLayout from "../components/layout/PageLayout"
import Card from "../components/ui/Card"
import FormError from "../components/ui/FormError"
import MetricCard from "../components/ui/MetricCard"
import StatusBadge from "../components/ui/StatusBadge"
import Button from "../components/ui/Button"
import SeverityBadge from "../components/ui/SeverityBadge"
import { useAuth } from "../lib/AuthContext"
import { getDevice } from "../services/deviceService"
import { getDeviceTelemetry } from "../services/telemetryService"
import { getDeviceAlerts, resolveAlert } from "../services/alertService"
import TelemetryLineChart from "../components/charts/TelemetryLineChart"
import type { Device } from "../types/device"
import type { TelemetryReading } from "../types/telemetry"
import type { Alert } from "../types/alert"



function DeviceDetailPage() {
    const { token } = useAuth()
    // Read the deviceId value from the route: /devices/:deviceId
    const { deviceId } = useParams()
    const [device, setDevice] = useState<Device | null>(null)
    const [telemetry, setTelemetry] = useState<TelemetryReading[]>([])
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [isResolvingAlertId, setIsResolvingAlertId] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null)

    useEffect(() => {
        async function loadDeviceDetails() {
            if (!token || !deviceId) {
                return
            }
            const numericDeviceId = Number(deviceId)
            if (Number.isNaN(numericDeviceId)) {
                setErrorMessage('Invalid device ID.')
                setIsLoading(false)
                return
            }
            try {
                setErrorMessage(null)
                //First load device by internal DB Id.
                const selectedDevice = await getDevice(numericDeviceId, token)
                setDevice(selectedDevice)

                //Load telemetry using the public device UID.
                const readings = await getDeviceTelemetry(selectedDevice.deviceId, token)
                setTelemetry(readings)

                // Load alerts for this device.
                const alertList = await getDeviceAlerts(selectedDevice.deviceId, token)
                setAlerts(alertList)

                setLastRefreshedAt(new Date())
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unable to load device details.'
                setErrorMessage(message)
            } finally {
                setIsLoading(false)
            }
        }

        //Load device details immediately when page opens.
        loadDeviceDetails()

        //Refresh every 5 seconds.
        const intervalId = window.setInterval(() => {
            loadDeviceDetails()
        }, 5000)

        return () => {
            window.clearInterval(intervalId)
        }

    }, [deviceId, token])

    const latestTelemetry = telemetry[0] ?? null //Return newest readings first.
    const recentTelemetry = telemetry.slice(0, 10) //Show latest 10 readings in the table.

    //Charts should read from left to right, from old to new. So reverse the reading and keep latest 30.
    const chartData = [...telemetry].reverse().slice(-30).map((reading) => ({
        time: new Date(reading.timestamp).toLocaleTimeString(),
        temperature: reading.temperature,
        humidity: reading.humidity,
        batteryLevel: reading.batteryLevel,
        generatedPower: reading.generatedPower,
        coolingLoad: reading.coolingLoad,
    }))

    const activeAlerts = alerts.filter((alert) => alert.status === 'active')
    const resolvedAlerts = alerts.filter((alert) => alert.status === 'resolved')

    function formatAlertType(alertType: string) {
        return alertType.split('_').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ')
    }

    async function handleResolveAlert(alertId: number) {
        if (!token) {
            return
        }
        try {
            setIsResolvingAlertId(alertId)
            setErrorMessage(null)
            const updatedAlert = await resolveAlert(alertId, token)
            setAlerts((currentAlerts) => currentAlerts.map((alert) => alert.id === updatedAlert.id ? updatedAlert : alert))
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to resolve alert.'
            setErrorMessage(message)
        } finally {
            setIsResolvingAlertId(null)
        }
    }


    return (
        <PageLayout>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <PageHeader
                    title={device ? device.name : 'Device Detail'}
                    description="View current status, recent telemetry, and historical charts."
                />
                <Link
                    to="/devices"
                    className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                    Back to devices
                </Link>
            </div>
            {lastRefreshedAt && (
                <p className="mt-4 text-sm text-slate-500">
                    Last updated: {lastRefreshedAt.toLocaleTimeString()}
                </p>
            )}
            <div className="mt-8">
                <FormError message={errorMessage} />
                {isLoading && (
                    <Card>
                        <p className="text-sm text-slate-600">Loading device details...</p>
                    </Card>
                )}
                {!isLoading && device && (
                    <div className="space-y-8">
                        <Card>
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Device information
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-600">
                                        {device.location}
                                    </p>
                                    <p className="mt-3 font-mono text-xs text-slate-500">
                                        {device.deviceId}
                                    </p>
                                </div>
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                    {device.storageType}
                                </span>
                            </div>
                            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <dt className="text-slate-500">Temperature range</dt>
                                    <dd className="mt-1 font-medium text-slate-900">
                                        {device.minTemperature}°C to {device.maxTemperature}°C
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Humidity range</dt>
                                    <dd className="mt-1 font-medium text-slate-900">
                                        {device.minHumidity}% to {device.maxHumidity}%
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Battery threshold</dt>
                                    <dd className="mt-1 font-medium text-slate-900">
                                        {device.batteryThreshold}%
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Created at</dt>
                                    <dd className="mt-1 font-medium text-slate-900">
                                        {new Date(device.createdAt).toLocaleDateString()}
                                    </dd>
                                </div>
                            </dl>
                        </Card>
                        <Card>
                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Active alerts
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-600">
                                        Current system health issues detected for this device.
                                    </p>
                                </div>
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                    {activeAlerts.length} active
                                </span>
                            </div>
                            {activeAlerts.length === 0 ? (
                                <p className="mt-5 text-sm text-slate-600">
                                    No active alerts for this device.
                                </p>
                            ) : (
                                <div className="mt-5 space-y-4">
                                    {activeAlerts.map((alert) => (
                                        <div
                                            key={alert.id}
                                            className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                                        >
                                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <SeverityBadge severity={alert.severity} />
                                                        <h3 className="font-semibold text-slate-900">
                                                            {formatAlertType(alert.alertType)}
                                                        </h3>
                                                    </div>
                                                    <p className="mt-2 text-sm text-slate-600">
                                                        {alert.message}
                                                    </p>
                                                    <p className="mt-2 text-xs text-slate-500">
                                                        Created: {new Date(alert.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    fullWidth={false}
                                                    onClick={() => handleResolveAlert(alert.id)}
                                                    disabled={isResolvingAlertId === alert.id}
                                                >
                                                    {isResolvingAlertId === alert.id ? 'Resolving...' : 'Resolve'}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                        {latestTelemetry ? (
                            <>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                                    <MetricCard
                                        label="Temperature"
                                        value={`${latestTelemetry.temperature}°C`}
                                        helperText={`Target: ${device.minTemperature}°C to ${device.maxTemperature}°C`}
                                    />
                                    <MetricCard
                                        label="Humidity"
                                        value={`${latestTelemetry.humidity}%`}
                                        helperText={`Target: ${device.minHumidity}% to ${device.maxHumidity}%`}
                                    />
                                    <MetricCard
                                        label="Battery"
                                        value={`${latestTelemetry.batteryLevel}%`}
                                        helperText={`Threshold: ${device.batteryThreshold}%`}
                                    />
                                    <MetricCard
                                        label="Generated power"
                                        value={`${latestTelemetry.generatedPower} W`}
                                    />
                                    <MetricCard
                                        label="Cooling load"
                                        value={`${latestTelemetry.coolingLoad} W`}
                                    />
                                </div>
                                <Card>
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <h2 className="text-lg font-semibold text-slate-900">
                                                Current status
                                            </h2>
                                            <p className="mt-1 text-sm text-slate-600">
                                                Latest reading received at{' '}
                                                {new Date(latestTelemetry.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <StatusBadge status={latestTelemetry.status} />
                                    </div>
                                </Card>
                                <Card>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Telemetry charts
                                    </h2>
                                    <div className="mt-6 grid gap-8 lg:grid-cols-2">
                                        <TelemetryLineChart
                                            title="Temperature"
                                            data={chartData}
                                            dataKeys={['temperature']}
                                        />
                                        <TelemetryLineChart
                                            title="Battery level"
                                            data={chartData}
                                            dataKeys={['batteryLevel']}
                                        />
                                        <TelemetryLineChart
                                            title="Humidity"
                                            data={chartData}
                                            dataKeys={['humidity']}
                                        />
                                        <TelemetryLineChart
                                            title="Generated power vs Cooling load"
                                            data={chartData}
                                            dataKeys={['generatedPower', 'coolingLoad']}
                                        />
                                    </div>
                                </Card>

                                <Card>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Recent telemetry
                                    </h2>
                                    <div className="mt-5 overflow-x-auto">
                                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                                            <thead>
                                                <tr className="text-left text-slate-500">
                                                    <th className="py-3 pr-4 font-medium">Time</th>
                                                    <th className="py-3 pr-4 font-medium">Status</th>
                                                    <th className="py-3 pr-4 font-medium">Temp</th>
                                                    <th className="py-3 pr-4 font-medium">Humidity</th>
                                                    <th className="py-3 pr-4 font-medium">Battery</th>
                                                    <th className="py-3 pr-4 font-medium">Power</th>
                                                    <th className="py-3 pr-4 font-medium">Cooling</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {recentTelemetry.map((reading) => (
                                                    <tr key={reading.id}>
                                                        <td className="py-3 pr-4 text-slate-700">
                                                            {new Date(reading.timestamp).toLocaleTimeString()}
                                                        </td>
                                                        <td className="py-3 pr-4">
                                                            <StatusBadge status={reading.status} />
                                                        </td>
                                                        <td className="py-3 pr-4 text-slate-700">
                                                            {reading.temperature}°C
                                                        </td>
                                                        <td className="py-3 pr-4 text-slate-700">
                                                            {reading.humidity}%
                                                        </td>
                                                        <td className="py-3 pr-4 text-slate-700">
                                                            {reading.batteryLevel}%
                                                        </td>
                                                        <td className="py-3 pr-4 text-slate-700">
                                                            {reading.generatedPower} W
                                                        </td>
                                                        <td className="py-3 pr-4 text-slate-700">
                                                            {reading.coolingLoad} W
                                                        </td>
                                                    </tr>
                                                ))}

                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </>
                        ) : (
                            <Card>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    No telemetry yet
                                </h2>
                                <p className="mt-2 text-sm text-slate-600">
                                    Start the simulator for this device to see live readings, charts, and recent telemetry.
                                </p>
                            </Card>
                        )}
                        <Card>
                            <h2 className="text-lg font-semibold text-slate-900">
                                Resolved alert history
                            </h2>
                            {resolvedAlerts.length === 0 ? (
                                <p className="mt-5 text-sm text-slate-600">
                                    No resolved alerts yet.
                                </p>
                            ) : (
                                <div className="mt-5 space-y-3">
                                    {resolvedAlerts.slice(0, 5).map((alert) => (
                                        <div
                                            key={alert.id}
                                            className="rounded-lg border border-slate-200 p-4"
                                        >
                                            <div className="flex flex-wrap items-center gap-2">
                                                <SeverityBadge severity={alert.severity} />
                                                <p className="font-medium text-slate-900">
                                                    {formatAlertType(alert.alertType)}
                                                </p>
                                            </div>
                                            <p className="mt-2 text-sm text-slate-600">
                                                {alert.message}
                                            </p>
                                            <p className="mt-2 text-xs text-slate-500">
                                                Resolved:{' '}
                                                {alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleString() : '-'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                )}
            </div>
        </PageLayout>
    )
}

export default DeviceDetailPage