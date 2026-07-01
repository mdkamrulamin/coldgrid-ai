type StatusBadgeProps = {
    status: string
}

// Reusable badge for status values.
// Used in:
// - telemetry status: normal, warning, failure, sensor_error
// - alert status: active, resolved
function StatusBadge({ status }: StatusBadgeProps) {
    const normalizedStatus = status.toLowerCase()

    const statusClassName =
        normalizedStatus === 'normal' || normalizedStatus === 'resolved'
            ? 'bg-emerald-50 text-emerald-700'
            : normalizedStatus === 'warning' || normalizedStatus === 'active'
                ? 'bg-amber-50 text-amber-700'
                : normalizedStatus === 'offline'
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-red-50 text-red-700'

    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClassName}`}>
            {status}
        </span>
    )
}

export default StatusBadge