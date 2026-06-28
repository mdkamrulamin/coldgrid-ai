import type { AlertSeverity } from "../../types/alert"

type SeverityBadgeProps = {
    severity: AlertSeverity
}

function SeverityBadge({ severity }: SeverityBadgeProps) {
    const severityClassName = severity === 'critical' ?
        'bg-red-50 text-red-700' : severity === 'high' ?
            'bg-orange-50 text-orange-700' : severity === 'medium' ?
                'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'

    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${severityClassName}`}
        >
            {severity}
        </span>
    )
}

export default SeverityBadge