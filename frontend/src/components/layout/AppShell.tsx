import type { ReactNode } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"

import { useAuth } from "../../lib/AuthContext"

type AppShellProps = {
    children: ReactNode
}

const navItems = [
    {
        label: 'Dashboard',
        to: '/dashboard',
    },
    {
        label: 'Devices',
        to: '/devices',
    },
    {
        label: 'Alerts',
        to: '/alerts',
    }
]

// Main authenticated app layout. This wraps protected pages with:
// - top navigation
// - logged-in user info
// - logout button
// - page content area

function AppShell({ children }: AppShellProps) {
    const navigate = useNavigate()
    const { user, logout } = useAuth()

    function handleLogout() {
        logout()    // Clear saved token and user state.
        navigate('/login')      // Send user back to login page.
    }
    return (
        <main className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
                    <div>
                        <Link to="/dashboard" className="text-lg font-bold text-slate-900">
                            ColdGrid AI
                        </Link>
                        <p className="text-sm text-slate-500">
                            Renewable cold storage monitoring
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-medium text-slate-900">
                                {user?.name}
                            </p>
                            <p className="text-xs text-slate-500">
                                {user?.email}
                            </p>
                        </div>
                        <button type="button" onClick={handleLogout} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                            Logout
                        </button>
                    </div>
                </div>
            </header>
            <nav className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-6xl gap-2 px-8 py-3">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`
                            }>
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            </nav>
            <div className="px-8 py-8">
                {children}
            </div>
        </main>
    )
}

export default AppShell