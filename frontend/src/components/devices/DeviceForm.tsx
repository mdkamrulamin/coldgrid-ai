import { useState, type ComponentProps } from "react"

import Button from "../ui/Button"
import FormError from "../ui/FormError"
import TextInput from "../ui/TextInput"
import type { CreateDeviceRequest, Device } from "../../types/device"

type DeviceFromProps = {
    initialDevice?: Device
    submitLabel: string
    isSubmitting: boolean
    errorMessage: string | null
    onSubmit: (payload: CreateDeviceRequest) => Promise<void>
}

// Reusable form for both create and update a device
function DeviceForm({ initialDevice, submitLabel, isSubmitting, errorMessage, onSubmit, }: DeviceFromProps) {
    const [name, setName] = useState(initialDevice?.name ?? '')
    const [location, setLocation] = useState(initialDevice?.location ?? '')
    const [storageType, setStorageType] = useState(initialDevice?.storageType ?? 'Cold room')
    const [minTemperature, setMinTemperature] = useState(String(initialDevice?.minTemperature ?? 2))
    const [maxTemperature, setMaxTemperature] = useState(String(initialDevice?.maxTemperature ?? 8))
    const [minHumidity, setMinHumidity] = useState(String(initialDevice?.minHumidity ?? 60))
    const [maxHumidity, setMaxHumidity] = useState(String(initialDevice?.maxHumidity ?? 85))
    const [batteryThreshold, setBatteryThreshold] = useState(String(initialDevice?.batteryThreshold ?? 30))

    const handleSubmit: ComponentProps<'form'>['onSubmit'] = async (event) => {
        event.preventDefault()

        await onSubmit({
            name,
            location,
            storageType,
            minTemperature: Number(minTemperature),
            maxTemperature: Number(maxTemperature),
            minHumidity: Number(minHumidity),
            maxHumidity: Number(maxHumidity),
            batteryThreshold: Number(batteryThreshold),
        })
    }
    return (
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
                {isSubmitting ? 'Saving...' : submitLabel}
            </Button>
        </form>
    )
}

export default DeviceForm