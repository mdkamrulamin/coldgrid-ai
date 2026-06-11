import type { ReactNode } from "react"

type CardProps = {
    children: ReactNode
    className?: string
}

//Reusable white card used across dashboard and device pages.
function Card({ children, className = '' }: CardProps) {
    return (
        <section className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
            {children}
        </section>
    )
}

export default Card