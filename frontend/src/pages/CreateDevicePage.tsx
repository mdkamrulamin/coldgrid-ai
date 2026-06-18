import { useState } from "react"
import { Link } from "react-router-dom"

import DeviceForm from "../components/devices/DeviceForm"
import PageHeader from "../components/layout/PageHeader"
import PageLayout from "../components/layout/PageLayout"
import Card from "../components/ui/Card"
import CopyableCodeField from "../components/ui/CopyableCodeField"
import { useAuth } from "../lib/AuthContext"
import { createDevice } from "../services/deviceService"
import type { CreateDeviceRequest, CreateDeviceaResponse } from "../types/device"

function CreateDevicePage() {
    const { token } = useAuth()

    const [createdDevice, setCreatedDevice] = useState<CreateDeviceaResponse | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    async function handleCreateDevice(payload: CreateDeviceRequest) {
        if (!token) {
            setErrorMessage('You mush be logged in to create a device.')
            return
        }
        try {
            setIsSubmitting(true)
            setErrorMessage(null)
            setCreatedDevice(null)
            //Create the device using values received from common DeviceForm.
            const device = await createDevice(payload, token)
            // The api returns the key only once.
            setCreatedDevice(device)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to create device.'
            setErrorMessage(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <PageLayout>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <PageHeader
                    title="Create device"
                    description="Onboard a new renewable cold storage monitoring device."
                />
                <Link
                    to="/devices"
                    className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                    Back to devices
                </Link>
            </div>
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px">
                <Card>
                    <DeviceForm 
                        submitLabel="Create device"
                        isSubmitting={isSubmitting}
                        errorMessage={errorMessage}
                        onSubmit={handleCreateDevice}
                    />
                </Card>
                <Card>
                    <h2 className="text-lg font-semibold text-slate-900">
                        Device API key
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        The raw API key is returned only once after device creation.
                        Save it before leaving this page.
                    </p>

                    {createdDevice ? (
                        <div className="mt-5 space-y-4">
                            <CopyableCodeField
                                label="Device UID"
                                text={createdDevice.deviceId}
                            />

                            <CopyableCodeField
                                label="API key"
                                text={createdDevice.apiKey}
                                tone="warning"
                            />
                            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                Save this API key now. You will not be able to view it again.
                            </p>
                        </div>
                    ) : (
                        <p className="mt-5 text-sm text-slate-500">
                            Create a device to generate its simulator API key.
                        </p>
                    )}
                </Card>
                
            </div>

        </PageLayout>
    )
}

export default CreateDevicePage