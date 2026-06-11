type StatusBadgeProps = {
    status: string
}

//Shows telemetry/device status with a consistent badge style.
function StatusBadge({ status }: StatusBadgeProps) {
    const normalizedStatus = status.toLowerCase()

    const statusClassName = 
        normalizedStatus === 'normal'
            ? 'bg-emerald-50 text-emerald-700'
            : normalizedStatus === 'warning'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-red-50 text-red-700'
    
    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClassName}`}>
            {status}
        </span>
    )
}

export default StatusBadge