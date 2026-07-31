import Button from "../ui/Button"
import Card from "../ui/Card"
import RiskLevelBadge from "../ui/RiskLevelBadge"
import type { Prediction } from "../../types/prediction"

type DevicePredictionCardProps = {
    prediction: Prediction | null
    isLoading: boolean
    isRunning: boolean
    onRunPrediction: () => void
}

function formatNullableNumber(value: number | null, suffix = '') {
    if (value === null) {
        return '-'
    }
    return `${value}${suffix}`
}

function DevicePredictionCard({ prediction, isLoading, isRunning, onRunPrediction }: DevicePredictionCardProps) {
    return (
        <Card>
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                        Risk prediction
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                        Predicts battery depletion, temperature risk, and current cooling risk level.
                    </p>
                </div>

                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    fullWidth={false}
                    onClick={onRunPrediction}
                    disabled={isRunning}
                >
                    {isRunning ? 'Running...' : 'Run prediction'}
                </Button>
            </div>

            {isLoading ? (
                <p className="mt-6 text-sm text-slate-600">
                    Loading latest prediction...
                </p>
            ) : !prediction ? (
                <p className="mt-6 text-sm text-slate-600">
                    No prediction has been generated for this device yet.
                </p>
            ) : (
                <div className="mt-6 space-y-6">
                    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Current risk level</p>
                            <div className="mt-2 flex items-center gap-3">
                                <RiskLevelBadge riskLevel={prediction.riskLevel} />
                                <span className="text-sm font-medium text-slate-700">
                                    Score: {prediction.riskScore}/100
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500">
                            Last run: {new Date(prediction.createdAt).toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-900">Summary</p>
                        <p className="mt-1 text-sm text-slate-600">
                            {prediction.summary}
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-slate-200 p-4">
                            <p className="text-sm font-medium text-slate-900">
                                Battery prediction
                            </p>
                            <p className="mt-2 text-sm text-slate-600">
                                {prediction.batteryPredictionMessage}
                            </p>
                            <div className="mt-4 grid gap-2 text-sm text-slate-600">
                                <p>
                                    Current battery:{' '}
                                    <span className="font-medium text-slate-900">
                                        {formatNullableNumber(prediction.batteryCurrentLevel, '%')}
                                    </span>
                                </p>
                                <p>
                                    Drain rate/hour:{' '}
                                    <span className="font-medium text-slate-900">
                                        {formatNullableNumber(prediction.batteryDrainRatePerHour, '%')}
                                    </span>
                                </p>
                                <p>
                                    Threshold:{' '}
                                    <span className="font-medium text-slate-900">
                                        {formatNullableNumber(prediction.batteryThreshold, '%')}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-4">
                            <p className="text-sm font-medium text-slate-900">
                                Temperature prediction
                            </p>
                            <p className="mt-2 text-sm text-slate-600">
                                {prediction.temperaturePredictionMessage}
                            </p>
                            <div className="mt-4 grid gap-2 text-sm text-slate-600">
                                <p>
                                    Current temperature:{' '}
                                    <span className="font-medium text-slate-900">
                                        {formatNullableNumber(prediction.currentTemperature, '°C')}
                                    </span>
                                </p>
                                <p>
                                    Change rate/hour:{' '}
                                    <span className="font-medium text-slate-900">
                                        {formatNullableNumber(prediction.temperatureChangeRatePerHour, '°C')}
                                    </span>
                                </p>
                                <p>
                                    Safe range:{' '}
                                    <span className="font-medium text-slate-900">
                                        {formatNullableNumber(prediction.minTemperature, '°C')} -{' '}
                                        {formatNullableNumber(prediction.maxTemperature, '°C')}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 p-4">
                            <p className="text-sm text-slate-500">Generated power</p>
                            <p className="mt-2 text-xl font-semibold text-slate-900">
                                {formatNullableNumber(prediction.generatedPowerCurrent, ' W')}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-4">
                            <p className="text-sm text-slate-500">Cooling load</p>
                            <p className="mt-2 text-xl font-semibold text-slate-900">
                                {formatNullableNumber(prediction.coolingLoadCurrent, ' W')}
                            </p>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-4">
                            <p className="text-sm text-slate-500">Power/cooling ratio</p>
                            <p className="mt-2 text-xl font-semibold text-slate-900">
                                {formatNullableNumber(prediction.powerToCoolingRatio)}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 p-4">
                            <p className="text-sm text-slate-500">Active alerts</p>
                            <p className="mt-2 text-xl font-semibold text-slate-900">
                                {prediction.activeAlertCount}
                            </p>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-4">
                            <p className="text-sm text-slate-500">Critical alerts</p>
                            <p className="mt-2 text-xl font-semibold text-slate-900">
                                {prediction.criticalAlertCount}
                            </p>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-4">
                            <p className="text-sm text-slate-500">Offline alert</p>
                            <p className="mt-2 text-xl font-semibold text-slate-900">
                                {prediction.offlineAlertActive ? 'Yes' : 'No'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    )
}

export default DevicePredictionCard