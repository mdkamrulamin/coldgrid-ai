import type { ReactNode } from 'react'
import AppShell from './AppShell'

type PageLayoutProps = {
    children: ReactNode
}

// Reusable layout for main dashboard-style pages like
// - /dashboard
// - /devices
// - /devices/:deviceId
function PageLayout({ children }: PageLayoutProps) {
    return (
        <AppShell>
            <section className="mx-auto max-w-6xl">
                {children}
            </section>
        </AppShell>
    )
}

export default PageLayout