import type { ReactNode } from 'react'

type PageLayoutProps = {
    children: ReactNode
}

// Reusable layout for main dashboard-style pages.
// Example pages:
// - /dashboard
// - /devices
// - /devices/:deviceId
function PageLayout({ children }: PageLayoutProps) {
    return (
        <main className="min-h-screen bg-slate-50 p-8">
            <section className="mx-auto max-w-6xl">
                {children}
            </section>
        </main>
    )
}

export default PageLayout