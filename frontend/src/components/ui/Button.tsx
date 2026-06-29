import type { ComponentProps } from "react"

type ButtonVariant = 'primary' | 'secondary' | 'danger'
type ButtonSize = 'sm' | 'md'

type ButtonProps = Omit<ComponentProps<'button'>, 'className'> & {
    variant?: ButtonVariant
    size?: ButtonSize
    fullWidth?: boolean
    className?: string
}

// Reusable button component.
// Supports:
// - primary button for main actions
// - secondary button for small table/card actions
// - danger button for destructive actions
// - fullWidth option for forms

function Button({
    children,
    className = '',
    disabled,
    variant = 'primary',
    size = 'md',
    fullWidth = true,
    ...props
}: ButtonProps) {
    const baseClassName =
        'inline-flex items-center justify-center rounded-lg font-medium shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60'

    const variantClassName =
        variant === 'primary'
            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
            : variant === 'danger'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'

    const sizeClassName =
        size === 'sm'
            ? 'px-3 py-2 text-xs'
            : 'px-4 py-2.5 text-sm'

    const widthClassName = fullWidth ? 'w-full' : ''

    return (
        <button
            disabled={disabled}
            className={`${baseClassName} ${variantClassName} ${sizeClassName} ${widthClassName} ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}

export default Button