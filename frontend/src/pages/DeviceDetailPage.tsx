import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import PageHeader from "../components/layout/PageHeader"
import PageLayout from "../components/layout/PageLayout"
import Card from "../components/ui/Card"
import MetricCard from "../components/ui/MetricCard"
import StatusBadge from "../components/ui/StatusBadge"
import Button from "../components/ui/Button"
import SeverityBadge from "../components/ui/SeverityBadge"
import { useAuth } from "../lib/AuthContext"
import { getDevice } from "../services/deviceService"
import { getDeviceTelemetry, getLatestTelemetry } from "../services/telemetryService"
import { getDeviceAlerts, resolveAlert } from "../services/alertService"
import TelemetryLineChart from "../components/charts/TelemetryLineChart"
import type { Device } from "../types/device"
import type { TelemetryReading, TelemetryRange } from "../types/telemetry"
import type { Alert } from "../types/alert"
import DevicePredictionCard from "../components/devices/DevicePredictionCard"
import { getLatestDevicePrediction, runDevicePrediction } from "../services/predictionService"
import type { Prediction } from "../types/prediction"
import DeviceAISummaryCard from "../components/devices/DeviceAISummaryCard"
import { generateDeviceAISummary, getLatestDeviceAISummary } from "../services/aiSummaryService"
import type { AISummary } from "../types/aiSummary"
import DeviceDetailSkeleton from "../components/devices/DeviceDetailSkeleton"
import EmptyState from "../components/ui/EmptyState"
import PageError from "../components/ui/PageError"


function DeviceDetailPage() {
    const { token } = useAuth()
    // Read the deviceId value from the route: /devices/:deviceId
    const { deviceId } = useParams()
    const [device, setDevice] = useState<Device | null>(null)
    const [telemetry, setTelemetry] = useState<TelemetryReading[]>([])
    const [latestDeviceTelemetry, setLatestDeviceTelemetry] = useState<TelemetryReading | null>(null)
    const [telemetryRange, setTelemetryRange] = useState<TelemetryRange>('24h')
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [isResolvingAlertId, setIsResolvingAlertId] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null)

    const [prediction, setPrediction] = useState<Prediction | null>(null)
    const [isPredictionLoading, setIsPredictionLoading] = useState(false)
    const [isRunningPrediction, setIsRunningPrediction] = useState(false)

    const [aiSummary, setAiSummary] = useState<AISummary | null>(null)
    const [isAiSummaryLoading, setIsAiSummaryLoading] = useState(false)
    const [isGeneratingAiSummary, setIsGeneratingAiSummary] = useState(false)
    const [aiSummaryErrorMessage, setAiSummaryErrorMessage] = useState<string | null>(null)

    useEffect(() => {
        async function loadDeviceDetails(options = { showPredictionLoader: false, showAiSummaryLoader: false }) {
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

                try {
                    const latestReading = await getLatestTelemetry(selectedDevice.deviceId, token)
                    setLatestDeviceTelemetry(latestReading)
                } catch {
                    setLatestDeviceTelemetry(null)
                }

                //Load telemetry using the public device UID and selected range.
                const readings = await getDeviceTelemetry(
                    selectedDevice.deviceId,
                    token,
                    {
                        range: telemetryRange,
                        limit: 1000,
                    },
                )
                setTelemetry(readings)

                // Load alerts for this device.
                const alertList = await getDeviceAlerts(selectedDevice.deviceId, token)
                setAlerts(alertList)

                // Load latest prediction using the public device UID.
                // This is separated because a device may not have any prediction yet.
                if (options.showPredictionLoader) {
                    setIsPredictionLoading(true)
                }

                try {
                    const latestPrediction = await getLatestDevicePrediction(selectedDevice.deviceId, token)
                    setPrediction(latestPrediction)
                } catch {
                    setPrediction(null)
                } finally {
                    if (options.showPredictionLoader) {
                        setIsPredictionLoading(false)
                    }
                }

                // Load latest ai summary.
                if (options.showAiSummaryLoader) {
                    setIsAiSummaryLoading(true)
                }
                try {
                    const latestAiSummary = await getLatestDeviceAISummary(selectedDevice.deviceId, token)
                    setAiSummary(latestAiSummary)
                    setAiSummaryErrorMessage(null)
                } catch {
                    setAiSummary(null)
                } finally {
                    if (options.showAiSummaryLoader) {
                        setIsAiSummaryLoading(false)
                    }
                }

                setLastRefreshedAt(new Date())
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unable to load device details.'
                setErrorMessage(message)
            } finally {
                setIsLoading(false)
            }
        }

        //Load device details immediately when page opens.
        loadDeviceDetails({ showPredictionLoader: true, showAiSummaryLoader: true })

        //Refresh every 5 seconds.
        const intervalId = window.setInterval(() => {
            loadDeviceDetails({ showPredictionLoader: false, showAiSummaryLoader: false })
        }, 5000)

        return () => {
            window.clearInterval(intervalId)
        }

    }, [deviceId, telemetryRange, token])

    const latestRangeTelemetry = telemetry[0] ?? null //Return newest readings first.
    const recentTelemetry = telemetry.slice(0, 10) //Show latest 10 readings in the table.

    // Charts should read from left to right, from old to new. Keep up to 200 points so historical trends are visible without overloading the chart.
    const MAX_CHART_POINTS = 200
    const chartTelemetry = [...telemetry].reverse().slice(-MAX_CHART_POINTS)

    const chartData = chartTelemetry.map((reading) => ({
        time: formatChartTime(reading.timestamp),
        temperature: reading.temperature,
        humidity: reading.humidity,
        batteryLevel: reading.batteryLevel,
        generatedPower: reading.generatedPower,
        coolingLoad: reading.coolingLoad,
    }))

    const activeAlerts = alerts.filter((alert) => alert.status === 'active')
    const resolvedAlerts = alerts.filter((alert) => alert.status === 'resolved')
    const telemetryRangeOptions: {
        label: string
        value: TelemetryRange
    }[] = [
            { label: '1h', value: '1h' },
            { label: '6h', value: '6h' },
            { label: '24h', value: '24h' },
            { label: '7d', value: '7d' },
        ]

    const displayStatus = activeAlerts.some(
        (alert) => alert.alertType === 'device_offline',
    ) ? 'offline' : latestDeviceTelemetry?.status

    function formatAlertType(alertType: string) {
        return alertType.split('_').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ')
    }

    function formatChartTime(timestamp: string) {
        const date = new Date(timestamp)

        if (telemetryRange === '7d') {
            return date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
            })
        }

        return date.toLocaleTimeString()
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

    async function handleRunPrediction() {
        if (!token || !device) {
            return
        }

        try {
            setIsRunningPrediction(true)
            setErrorMessage(null)

            const newPrediction = await runDevicePrediction(device.deviceId, token)
            setPrediction(newPrediction)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to run prediction.'
            setErrorMessage(message)
        } finally {
            setIsRunningPrediction(false)
        }

    }

    async function handleGenerateAiSummary() {
        if (!token || !device) {
            return
        }
        try {
            setIsGeneratingAiSummary(true)
            setAiSummaryErrorMessage(null)

            const newAiSummary = await generateDeviceAISummary(device.deviceId, token)
            setAiSummary(newAiSummary)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to generate AI summary.'
            setAiSummaryErrorMessage(message)
        } finally {
            setIsGeneratingAiSummary(false)
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
                    className="inline-flex w-full justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 md:w-auto"
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
                <PageError message={errorMessage} />
                {isLoading && <DeviceDetailSkeleton />}
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
                                <div className="mt-5">
                                    <EmptyState
                                        title="No active alerts"
                                        description="This device does not currently have any active system health issues."
                                    />
                                </div>
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

                        <DevicePredictionCard
                            prediction={prediction}
                            isLoading={isPredictionLoading}
                            isRunning={isRunningPrediction}
                            onRunPrediction={handleRunPrediction}
                        />

                        <DeviceAISummaryCard
                            aiSummary={aiSummary}
                            isLoading={isAiSummaryLoading}
                            isGenerating={isGeneratingAiSummary}
                            errorMessage={aiSummaryErrorMessage}
                            onGenerateSummary={handleGenerateAiSummary}
                        />

                        {latestDeviceTelemetry ? (
                            <>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                                    <MetricCard
                                        label="Temperature"
                                        value={`${latestDeviceTelemetry.temperature}°C`}
                                        helperText={`Target: ${device.minTemperature}°C to ${device.maxTemperature}°C`}
                                    />
                                    <MetricCard
                                        label="Humidity"
                                        value={`${latestDeviceTelemetry.humidity}%`}
                                        helperText={`Target: ${device.minHumidity}% to ${device.maxHumidity}%`}
                                    />
                                    <MetricCard
                                        label="Battery"
                                        value={`${latestDeviceTelemetry.batteryLevel}%`}
                                        helperText={`Threshold: ${device.batteryThreshold}%`}
                                    />
                                    <MetricCard
                                        label="Generated power"
                                        value={`${latestDeviceTelemetry.generatedPower} W`}
                                    />
                                    <MetricCard
                                        label="Cooling load"
                                        value={`${latestDeviceTelemetry.coolingLoad} W`}
                                    />
                                </div>
                                <Card>
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h2 className="text-lg font-semibold text-slate-900">
                                                Current status
                                            </h2>
                                            <p className="mt-1 text-sm text-slate-600">
                                                Latest reading received at{' '}
                                                {new Date(latestDeviceTelemetry.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        {displayStatus && <StatusBadge status={displayStatus} />}
                                    </div>
                                </Card>
                            </>

                        ) : (
                            <Card>
                                <EmptyState
                                    title="No latest telemetry yet"
                                    description="Start the simulator for this device to generate the first telemetry reading."
                                />
                            </Card>

                        )}

                        <Card>
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Historical telemetry
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-600">
                                        Filter charts and recent readings by time range.
                                    </p>
                                </div>
                                <div className="grid grid-cols-4 gap-2 rounded-lg bg-slate-100 p-1">
                                    {telemetryRangeOptions.map((option) => {
                                        const isSelected = telemetryRange === option.value

                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setTelemetryRange(option.value)}
                                                className={`rounded-md px-3 py-2 text-sm font-medium transition ${isSelected
                                                    ? 'bg-white text-emerald-700 shadow-sm'
                                                    : 'text-slate-600 hover:text-slate-900'
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </Card>

                        {latestRangeTelemetry ? (
                            <>
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
                                        Recent telemetry in selected range
                                    </h2>
                                    <div className="mt-5 overflow-x-auto">
                                        <table className="min-w-[850px] divide-y divide-slate-200 text-sm">
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
                                <EmptyState
                                    title="No telemetry found"
                                    description="No telemetry was found for the selected time range. Choose a wider range or run the simulator to generate new readings."
                                />
                            </Card>
                        )}
                        <Card>
                            <h2 className="text-lg font-semibold text-slate-900">
                                Resolved alert history
                            </h2>
                            {resolvedAlerts.length === 0 ? (
                                <div className="mt-5">
                                    <EmptyState
                                        title="No resolved alerts yet"
                                        description="Resolved alerts will appear here after active alerts are cleared."
                                    />
                                </div>
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