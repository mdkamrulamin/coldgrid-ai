import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../../lib/AuthContext"

type ProtectedRouteProps = {
    children: ReactNode
}

// Protects pages that require login. If user is not logged in, redirect to /login.
function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth()
    // While checking saved token, show a simple loading state.
    if (isLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50">
                <p className="text-sm text-slate-600">Loading...</p>
            </main>
        )
    }

    // If there is no logged-in user, send them to login.
    if (!user) {
        return <Navigate to="/login" replace/>
    }
    return children
}

export default ProtectedRoute