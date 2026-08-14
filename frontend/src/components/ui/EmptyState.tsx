import type { ReactNode } from "react"

type EmptyStateProps = {
    title: string
    description: string
    action?: ReactNode
    className?: string
}

function EmptyState({ title, description, action, className = '' }: EmptyStateProps) {
    return (
        <div className={`rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center ${className}`}>
            <h3 className="text-sm font-semibold text-slate-900">
                {title}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                {description}
            </p>

            {action && (
                <div className="mt-5 flex justify-center">
                    {action}
                </div>
            )}
        </div>
    )
}

export default EmptyState