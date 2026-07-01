import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import PageHeader from "../components/layout/PageHeader"
import PageLayout from "../components/layout/PageLayout"
import Card from "../components/ui/Card"
import FormError from "../components/ui/FormError"
import { useAuth } from "../lib/AuthContext"
import { getDevices, deleteDevice } from "../services/deviceService"
import type { Device } from "../types/device"

function DevicesPage() {
    const { token } = useAuth()
    const [devices, setDevices] = useState<Device[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    useEffect(() => {
        async function loadDevices() {
            if (!token) {
                return
            }
            try {
                setIsLoading(true)
                setErrorMessage(null)
                //Fetch devices owned by the logged-in user.
                const deviceList = await getDevices(token)
                setDevices(deviceList)
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unable to load devices.'
                setErrorMessage(message)
            } finally {
                setIsLoading(false)
            }
        }

        loadDevices()
    }, [token])

    async function handleDeleteDevice(device: Device) {
            if (!token) {
                return
            }
            const confirmed = window.confirm(
                `Delete "${device.name}"? This action cannot be undone.`
            )
            if (!confirmed) {
                return
            }
            try {
                setErrorMessage(null)
                //Delete the device from db.
                await deleteDevice(device.id, token)
                //Remove it from the UI without full reload.
                setDevices((currentDevices) =>
                    currentDevices.filter((item) => item.id !== device.id), 
                )
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unable to delete device.'
                setErrorMessage(message)
            }
        }

    return (
        <PageLayout>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <PageHeader
                    title="Devices"
                    description="View renewable cold storage devices connected to your account."
                />
                <Link
                    to="/devices/new"
                    className="inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
                >
                    Create device
                </Link>
            </div>
            <div className="mt-8">
                <FormError message={errorMessage} />
                {isLoading && (
                    <Card>
                        <p className="text-sm text-slate-600">Loading devices...</p>
                    </Card>
                )}
                {!isLoading && devices.length === 0 && (
                    <Card>
                        <h2 className="text-lg font-semibold text-slate-900">
                            No devices yet
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Once you create a device, it will appear here.
                        </p>
                    </Card>
                )}
                {!isLoading && devices.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2">
                        {devices.map((device) => (
                            <Card key={device.id}>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900">
                                            {device.name}
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-600">
                                            {device.location}
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                        {device.storageType}
                                    </span>
                                </div>
                                <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <dt className="text-slate-500">Device UID</dt>
                                        <dd className="mt-1 font-mono text-xs text-slate-900">
                                            {device.deviceId}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-slate-500">Battery threshold</dt>
                                        <dd className="mt-1 font-medium text-slate-900">
                                            {device.batteryThreshold}%
                                        </dd>
                                    </div>
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
                                </dl>
                                <div className="mt-5 flex flex-wrap gap-3">
                                    <Link
                                        to={`/devices/${device.id}`}
                                        className="inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-800"
                                    >
                                        View details
                                    </Link>
                                    <Link
                                        to={`/devices/${device.id}/edit`}
                                        className="inline-flex text-sm font-medium text-slate-700 hover:text-slate-900"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteDevice(device)}
                                        className="inline-flex text-sm font-medium text-red-600 hover:text-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </PageLayout>
    )
}

export default DevicesPage