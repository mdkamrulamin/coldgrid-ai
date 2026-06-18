import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import DeviceForm from "../components/devices/DeviceForm"
import PageHeader from "../components/layout/PageHeader"
import PageLayout from "../components/layout/PageLayout"
import Card from "../components/ui/Card"
import FormError from "../components/ui/FormError"
import { useAuth } from "../lib/AuthContext"
import { getDevice, updateDevice } from "../services/deviceService"
import type { CreateDeviceRequest, Device } from "../types/device"

function EditDevicePage() {
    const { token } = useAuth()
    const navigate = useNavigate()
    const { deviceId } = useParams()

    const [device, setDevice] = useState<Device | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    useEffect(() => {
        async function loadDevice() {
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
                //Load existing device values so the form is pre-filled.
                const selectedDevice = await getDevice(numericDeviceId, token)
                setDevice(selectedDevice)
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unable to load device.'
                setErrorMessage(message)
            } finally {
                setIsLoading(false)
            }
        }
        loadDevice()
    }, [deviceId, token])

    async function handleUpdate(payload: CreateDeviceRequest) {
        if (!token || !deviceId) {
            return
        }
        const numericDeviceId = Number(deviceId)
        if (Number.isNaN(numericDeviceId)) {
            setErrorMessage('Invalid device ID.')
            return
        }
        try {
            setIsSubmitting(true)
            setErrorMessage(null)
            //Update device settings.
            await updateDevice(numericDeviceId, payload, token)
            //Go back to device detail page after saving.
            navigate(`/devices/${numericDeviceId}`)

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to update device.'
            setErrorMessage(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <PageLayout>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <PageHeader 
                    title="Edit device"
                    description="Update device settings, thresholds, and location."
                />
                <Link
                    to={deviceId ? `/devices/${deviceId}` : '/devices'}
                    className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                    Back
                </Link>
            </div>
            <div className="mt-8">
                {isLoading && (
                    <Card>
                        <p className="text-sm text-slate-600">Loading device...</p>
                    </Card>
                )}
                {!isLoading && !device && (
                    <FormError message={errorMessage ?? 'Device not found.'} />
                )}
                {!isLoading && device && (
                    <Card>
                        <DeviceForm 
                            initialDevice={device}
                            submitLabel="Save changes"
                            isSubmitting={isSubmitting}
                            errorMessage={errorMessage}
                            onSubmit={handleUpdate}
                        />
                    </Card>
                )}
            </div>
        </PageLayout>
    )
}

export default EditDevicePage