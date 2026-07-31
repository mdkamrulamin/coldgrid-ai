import type { RiskLevel } from "../../types/prediction"

type RiskLevelBadgeProps = {
    riskLevel: RiskLevel
}

function RiskLevelBadge({ riskLevel }: RiskLevelBadgeProps) {
    const riskClassName =
        riskLevel === 'critical'
            ? 'bg-red-50 text-red-700'
            : riskLevel === 'high'
                ? 'bg-orange-50 text-orange-700'
                : riskLevel === 'medium'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-emerald-50 text-emerald-700'

    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${riskClassName}`}>
            {riskLevel}
        </span>
    )
}

export default RiskLevelBadge