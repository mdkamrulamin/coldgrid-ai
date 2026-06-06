import type { ReactNode } from 'react'

type AuthLayoutProps = {
    title: string
    description: string
    children?: ReactNode
}

function AuthLayout({ title, description, children }: AuthLayoutProps) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 p-8">
            <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <p className="text-sm font-medium text-emerald-600">
                    ColdGrid AI
                </p>

                <h1 className="mt-3 text-2xl font-bold text-slate-900">
                    {title}
                </h1>

                <p className="mt-2 text-sm text-slate-600">
                    {description}
                </p>

                {children && (
                    <div className="mt-6">
                        {children}
                    </div>
                )}
            </section>
        </main>
    )
}

export default AuthLayout