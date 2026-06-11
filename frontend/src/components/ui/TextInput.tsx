import type { ComponentProps } from "react"

type TextInputProps = ComponentProps<'input'> & {
    label: string
    error?: string
}

// Reusable text input component. Supports:
// - label
// - error message
// - normal input props like type, value, onChange, placeholder
function TextInput({ label, error, id, name, ...props }: TextInputProps) {
    const inputId = id ?? name
    return (
        <div>
            <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
                {label}
            </label>

            <input
                id={inputId}
                name={name}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${inputId}-error` : undefined}
                className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                {...props}
            />

            {error && (
                <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    )
}

export default TextInput