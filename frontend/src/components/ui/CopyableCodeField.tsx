import { useEffect, useState } from "react"

type CopyStatus = 'copied' | 'error' | null

type CopyableCodeFieldProps = {
    label: string
    text: string
    tone?: 'default' | 'warning'
}

//Reusable code-style field with a copy icon on the right. Used for values like API key.
function CopyableCodeField({ label, text, tone = 'default' }: CopyableCodeFieldProps) {
    const [copyStatus, setCopyStatus] = useState<CopyStatus>(null)

    useEffect(() => {
        if (!copyStatus) {
            return
        }
        //Hide popup after a short delay.
        const timeoutId = window.setTimeout(() => {
            setCopyStatus(null)
        }, 2000)

        return () => {
            window.clearTimeout(timeoutId)
        }
    }, [copyStatus])

    async function handleCopy() {
        try {
            //Copy text to user's clipboard.
            await navigator.clipboard.writeText(text)
            setCopyStatus('copied')
        } catch {
            setCopyStatus('error')
        }
    }

    const fieldClassName =
        tone === 'warning' ? 'border border-amber-200 bg-amber-50 text-amber-900' : 'bg-slate-50 text-slate-900'

    return (
        <div>
            <p className="text-sm font-medium text-slate-700">
                {label}
            </p>
            <div className="relative mt-2">
                <p className={`break-all rounded-lg p-3 pr-12 font-mono text-xs ${fieldClassName}`}>
                    {text}
                </p>
                <button
                    type="button"
                    onClick={handleCopy}
                    aria-label={`Copy ${label}`}
                    className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 rounded-md p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                </button>

                {copyStatus && (
                    <div className="absolute right-0 top-full z-10 mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-lg">
                        {copyStatus === 'copied' ? (
                            <>
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-3.5 w-3.5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M20 6 9 17l-5-5" />
                                    </svg>
                                </span>

                                <span>Copied to clipboard</span>
                            </>
                        ) : (
                            <span className="text-red-600">Copy failed</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CopyableCodeField