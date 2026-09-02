import { type ComponentProps, useState } from "react"

import Button from "../ui/Button"
import Card from "../ui/Card"
import FormError from "../ui/FormError"
import type { SimulationRunRequest, SimulationScenario, SimulationTimeRange } from "../../types/simulation"

type DeviceSimulationCardProps = {
    isRunning: boolean
    successMessage: string | null
    errorMessage: string | null
    onRunSimulation: (simulationData: SimulationRunRequest) => Promise<void>
}

const scenarioOptions: {
    label: string
    value: SimulationScenario
    description: string
}[] = [
    {
        label: 'Normal operation',
        value: 'normal',
        description: 'Generates stable telemetry readings.',
    },
    {
        label: 'Battery drain',
        value: 'battery_drain',
        description: 'Simulates falling battery level.',
    },
    {
        label: 'Temperature rise',
        value: 'temperature_rise',
        description: 'Simulates temperature increasing over time.',
    },
    {
        label: 'Low generation',
        value: 'low_generation',
        description: 'Simulates reduced renewable power generation.',
    },
    {
        label: 'Cooling failure',
        value: 'cooling_failure',
        description: 'Simulates high temperature and high cooling load.',
    },
    {
        label: 'Sensor failure',
        value: 'sensor_failure',
        description: 'Simulates abnormal sensor readings.',
    },
    {
        label: 'Power spike',
        value: 'power_spike',
        description: 'Simulates sudden power and cooling spikes.',
    },
]

const timeRangeOptions: {
    label: string
    value: SimulationTimeRange
}[] = [
    { label: '1h', value: '1h' },
    { label: '6h', value: '6h' },
    { label: '24h', value: '24h' },
    { label: '7d', value: '7d' },
]

function DeviceSimulationCard({
    isRunning,
    successMessage,
    errorMessage,
    onRunSimulation,
}: DeviceSimulationCardProps) {
    const [scenario, setScenario] = useState<SimulationScenario>('temperature_rise')
    const [timeRange, setTimeRange] = useState<SimulationTimeRange>('6h')
    const [readingCount, setReadingCount] = useState(40)
    const selectedScenario = scenarioOptions.find((option) => option.value === scenario)

    const handleSubmit: ComponentProps<'form'>['onSubmit'] = async (event) => {
        event.preventDefault()

        await onRunSimulation({
            scenario,
            readingCount,
            timeRange,
        })
    }

    return (
        <Card>
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                        Demo simulation
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                        Generate a fresh demo scenario for the selected time range. Existing telemetry in that range will be replaced.
                    </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    Browser demo
                </span>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
                <div className="grid gap-4 md:grid-cols-3">
                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                            Scenario
                        </span>

                        <select
                            value={scenario}
                            onChange={(event) => setScenario(event.target.value as SimulationScenario)}
                            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        >
                            {scenarioOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                            Time range
                        </span>
                        <select
                            value={timeRange}
                            onChange={(event) => setTimeRange(event.target.value as SimulationTimeRange)}
                            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        >
                            {timeRangeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block">
                        <span className="text-sm font-medium text-slate-700">
                            Readings
                        </span>
                        <input 
                            type="number"
                            min={5}
                            max={100}
                            value={readingCount}
                            onChange={(event) => setReadingCount(Number(event.target.value))}
                            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                    </label>
                </div>

                {selectedScenario && (
                    <p className="text-sm text-slate-600">
                        {selectedScenario.description}
                    </p>
                )}

                <FormError message={errorMessage} />

                {successMessage && (
                    <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                        {successMessage}
                    </p>
                )}

                <Button type="submit" disabled={isRunning}>
                    {isRunning ? 'Generating telemetry...' : 'Generate demo telemetry'}
                </Button>
            </form>
        </Card>
    )
}

export default DeviceSimulationCard