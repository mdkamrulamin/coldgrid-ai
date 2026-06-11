import type { ComponentProps } from "react"

type ButtonProps = ComponentProps<'button'>

// Reusable button component.
function Button({ children, className = '', disabled, ...props }: ButtonProps) {
    return (
        <button
            disabled={disabled}
            className={`inline-flex w-full items-center justify-center rounder-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}

export default Button