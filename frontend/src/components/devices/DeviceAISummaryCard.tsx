import Button from "../ui/Button"
import Card from "../ui/Card"
import RiskLevelBadge from "../ui/RiskLevelBadge"
import type { AISummary } from "../../types/aiSummary"

type DeviceAISummaryCardProps = {
    aiSummary: AISummary | null
    isLoading: boolean
    isGenerating: boolean
    errorMessage: string | null
    onGenerateSummary: () => void
}

function DeviceAISummaryCard({ aiSummary, isLoading, isGenerating, errorMessage, onGenerateSummary }: DeviceAISummaryCardProps) {
    return (
        <Card>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                        AI Summary
                    </h2>

                    <p className="mt-1 text-sm text-slate-600">
                        Summarizes the last 24 hours of telemetry, alerts, and prediction data.
                    </p>
                </div>

                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    fullWidth={false}
                    onClick={onGenerateSummary}
                    disabled={isGenerating}
                >
                    {isGenerating ? 'Generating...' : 'Regenerate summary'}
                </Button>
            </div>

            {errorMessage && (
                <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {errorMessage}
                </div>
            )}

            {isLoading ? (
                <p className="mt-6 text-sm text-slate-600">
                    Loading latest AI summary...
                </p>
            ) : !aiSummary ? (
                <p className="mt-6 text-sm text-slate-600">
                    No AI summary has been generated for this device yet.
                </p>
            ) : (
                <div className="mt-6 space-y-6">
                    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Current risk</p>
                            <div className="mt-2">
                                <RiskLevelBadge riskLevel={aiSummary.riskLevel} />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500">
                            Generated: {new Date(aiSummary.createdAt).toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-900">Summary</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            {aiSummary.summary}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-900">
                            Recommended actions
                        </p>
                        <ul className="mt-3 space-y-2 text-sm text-slate-600">
                            {aiSummary.recommendedActions.map((action) => (
                                <li key={action} className="flex gap-2">
                                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400" />
                                    <span>{action}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="grid gap-4 text-sm md:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 p-4">
                            <p className="text-slate-500">Telemetry readings</p>
                            <p className="mt-2 text-xl font-semibold text-slate-900">
                                {aiSummary.telemetryCount}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-4">
                            <p className="text-slate-500">Active alerts</p>
                            <p className="mt-2 text-xl font-semibold text-slate-900">
                                {aiSummary.activeAlertCount}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-4">
                            <p className="text-slate-500">Prediction used</p>
                            <p className="mt-2 text-xl font-semibold text-slate-900">
                                {aiSummary.predictionId ? `#${aiSummary.predictionId}` : '-'}
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500">
                        Data window:{' '}
                        {new Date(aiSummary.dataStartAt).toLocaleString()} -{' '}
                        {new Date(aiSummary.dataEndAt).toLocaleString()}
                    </p>
                </div>
            )}
        </Card>
    )
}

export default DeviceAISummaryCard