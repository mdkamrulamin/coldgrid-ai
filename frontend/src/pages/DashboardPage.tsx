import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import PageHeader from "../components/layout/PageHeader"
import PageLayout from "../components/layout/PageLayout"
import Card from "../components/ui/Card"
import FormError from "../components/ui/FormError"
import StatusBadge from "../components/ui/StatusBadge"
import { useAuth } from "../lib/AuthContext"
import { getDevices } from "../services/deviceService"
import { getLatestTelemetry } from "../services/telemetryService"
import type { Device } from "../types/device"
import type { TelemetryReading } from "../types/telemetry"

type DeviceWithLatestTelemetry = {
    device: Device
    latestTelemetry: TelemetryReading | null
}

function DashboardPage() {
    const { token } = useAuth()
    const [devicesWithTelemetry, setDevicesWithTelemetry] = useState<DeviceWithLatestTelemetry[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    useEffect(() => {
        async function loadDashboardData() {
            if (!token) {
                return
            }

            try {
                setIsLoading(true)
                setErrorMessage(null)
                //First load all devices of this user.
                const devices = await getDevices(token)

                // Then load latest telemetry for each device. If one device has no telemetry yet, keep that device visible and set latestTelemetry to null.
                const dashboardData = await Promise.all(
                    devices.map(async (device) => {
                        try {
                            const latestTelemetry = await getLatestTelemetry(
                                device.deviceId,
                                token,
                            )

                            return {
                                device, latestTelemetry,
                            }
                        } catch {
                            return {
                                device, latestTelemetry: null
                            }
                        }
                    }),
                )

                setDevicesWithTelemetry(dashboardData)
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unable to load dashboard data.'
                setErrorMessage(message)
            } finally {
                setIsLoading(false)
            }
        }

        loadDashboardData()
    }, [token])

    const totalDevices = devicesWithTelemetry.length
    const activeDevices = devicesWithTelemetry.filter((item) => item.latestTelemetry).length

    const warningDevices = devicesWithTelemetry.filter((item) => {
        const status = item.latestTelemetry?.status.toLowerCase()
        return status && status !== 'normal'
    }).length

    return (
        <PageLayout>
            <PageHeader
                title="Dashboard"
                description="Monitor renewable cold storage devices and their latest telemetry."
            />

            <div className="mt-8">
                <FormError message={errorMessage} />
                {isLoading && (
                    <Card>
                        <p className="text-sm text-slate-600">Loading dashboard...</p>
                    </Card>
                )}
                {!isLoading && (
                    <>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <p className="text-sm text-slate-500">Total devices</p>
                                <p className="mt-2 text-3xl font-bold text-slate-900">
                                    {totalDevices}
                                </p>
                            </Card>
                            <Card>
                                <p className="text-sm text-slate-500">Devices with telemetry</p>
                                <p className="mt-2 text-3xl font-bold text-slate-900">
                                    {activeDevices}
                                </p>
                            </Card>
                            <Card>
                                <p className="text-sm text-slate-500">Warnings / issues</p>
                                <p className="mt-2 text-3xl font-bold text-slate-900">
                                    {warningDevices}
                                </p>
                            </Card>
                        </div>
                        <div className="mt-8">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Latest device status
                            </h2>

                            {devicesWithTelemetry.length === 0 ? (
                                <Card className="mt-4">
                                    <p className="text-sm text-slate-600">
                                        No devices found. Create a device first to start monitoring.
                                    </p>
                                </Card>
                            ) : (
                                <div className="mt-4 grid gap-4">
                                    {devicesWithTelemetry.map(({ device, latestTelemetry }) => (
                                        <Card key={device.id}>
                                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-slate-900">
                                                        {device.name}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-slate-600">
                                                        {device.location}
                                                    </p>
                                                    <p className="mt-2 font-mono text-xs text-slate-500">
                                                        {device.deviceId}
                                                    </p>
                                                </div>

                                                {latestTelemetry ? (
                                                    <StatusBadge status={latestTelemetry.status} />
                                                ) : (
                                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                                        No telemetry
                                                    </span>
                                                )}
                                            </div>

                                            {latestTelemetry ? (
                                                <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-5">
                                                    <div>
                                                        <dt className="text-slate-500">Temperature</dt>
                                                        <dd className="mt-1 font-semibold text-slate-900">
                                                            {latestTelemetry.temperature}°C
                                                        </dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-slate-500">Humidity</dt>
                                                        <dd className="mt-1 font-semibold text-slate-900">
                                                            {latestTelemetry.humidity}%
                                                        </dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-slate-500">Battery</dt>
                                                        <dd className="mt-1 font-semibold text-slate-900">
                                                            {latestTelemetry.batteryLevel}%
                                                        </dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-slate-500">Generated power</dt>
                                                        <dd className="mt-1 font-semibold text-slate-900">
                                                            {latestTelemetry.generatedPower} W
                                                        </dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-slate-500">Cooling load</dt>
                                                        <dd className="mt-1 font-semibold text-slate-900">
                                                            {latestTelemetry.coolingLoad} W
                                                        </dd>
                                                    </div>
                                                </dl>
                                            ) : (
                                                <p className="mt-5 text-sm text-slate-600">
                                                    No telemetry has been received for this device yet.
                                                </p>
                                            )}
                                            <Link
                                                to={`/devices/${device.id}`}
                                                className="mt-5 inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-800"
                                            >
                                                View Details
                                            </Link>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </PageLayout>
    )

}


export default DashboardPage