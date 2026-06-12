type MetricCardProps = {
    label: string
    value: string
    helperText?: string
}

function MetricCard({ label, value, helperText }: MetricCardProps) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
            {helperText && (
                <p className="mt-1 text-xs text-slate-500">
                    {helperText}
                </p>
            )}
        </section>
    )
}

export default MetricCard