import { useState, type ComponentProps } from "react"
import { Link } from "react-router-dom"

import PageHeader from "../components/layout/PageHeader"
import PageLayout from "../components/layout/PageLayout"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import CopyableCodeField from "../components/ui/CopyableCodeField"
import FormError from "../components/ui/FormError"
import TextInput from "../components/ui/TextInput"
import { useAuth } from "../lib/AuthContext"
import { createDevice } from "../services/deviceService"
import type { CreateDeviceaResponse } from "../types/device"

function CreateDevicePage() {
    const { token } = useAuth()

    const [name, setName] = useState('')
    const [location, setLocation] = useState('')
    const [storageType, setStorageType] = useState('Cold room')
    const [minTemperature, setMinTemperature] = useState('2')
    const [maxTemperature, setMaxTemperature] = useState('8')
    const [minHumidity, setMinHumidity] = useState('60')
    const [maxHumidity, setMaxHumidity] = useState('85')
    const [batteryThreshold, setBatteryThreshold] = useState('30')

    const [createdDevice, setCreatedDevice] = useState<CreateDeviceaResponse | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const handleSubmit: ComponentProps<'form'>['onSubmit'] = async (event) => {
        event.preventDefault()

        if (!token) {
            setErrorMessage('You mush be logged in to create a device.')
            return
        }

        setIsSubmitting(true)
        setErrorMessage(null)
        setCreatedDevice(null)

        try {
            // Create the device using the logged-in user's JWT token.  Number inputs are stored as strings in React state because
            // input values always come from the browser as strings. We convert them to numbers before sending to the backend.
            const device = await createDevice(
                {
                    name,
                    location,
                    storageType,
                    minTemperature: Number(minTemperature),
                    maxTemperature: Number(maxTemperature),
                    minHumidity: Number(minHumidity),
                    maxHumidity: Number(maxHumidity),
                    batteryThreshold: Number(batteryThreshold),
                },
                token,
            )
            setCreatedDevice(device)

            //Clear form after device creation success.
            setName('')
            setLocation('')
            setStorageType('2')
            setMinTemperature('2')
            setMaxTemperature('8')
            setMinHumidity('60')
            setMaxHumidity('85')
            setBatteryThreshold('30')
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
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <FormError message={errorMessage} />
                        <TextInput
                            label="Device name"
                            name="name"
                            type="text"
                            placeholder="Ottawa Cold Room 01"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                        />
                        <TextInput
                            label="Location"
                            name="location"
                            type="text"
                            placeholder="Ottawa, Canada"
                            value={location}
                            onChange={(event) => setLocation(event.target.value)}
                            required
                        />
                        <TextInput
                            label="Storage type"
                            name="storageType"
                            type="text"
                            placeholder="Cold room"
                            value={storageType}
                            onChange={(event) => setStorageType(event.target.value)}
                            required
                        />
                        <div className="grid gap-4 sm:grid-cols-2">
                            <TextInput
                                label="Minimum temperature"
                                name="minTemperature"
                                type="number"
                                value={minTemperature}
                                onChange={(event) => setMinTemperature(event.target.value)}
                                required
                            />
                            <TextInput
                                label="Maximum temperature"
                                name="maxTemperature"
                                type="number"
                                value={maxTemperature}
                                onChange={(event) => setMaxTemperature(event.target.value)}
                                required
                            />
                            <TextInput
                                label="Minimum humidity"
                                name="minHumidity"
                                type="number"
                                value={minHumidity}
                                onChange={(event) => setMinHumidity(event.target.value)}
                                required
                            />
                            <TextInput
                                label="Maximum humidity"
                                name="maxHumidity"
                                type="number"
                                value={maxHumidity}
                                onChange={(event) => setMaxHumidity(event.target.value)}
                                required
                            />
                            <TextInput
                                label="Battery threshold"
                                name="batteryThreshold"
                                type="number"
                                value={batteryThreshold}
                                onChange={(event) => setBatteryThreshold(event.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating device...' : 'Create device'}
                        </Button>
                    </form>
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