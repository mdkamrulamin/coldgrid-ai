import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../../lib/AuthContext"

type ProtectedRouteProps = {
    children: ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth()
    if (isLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50">
                <p className="text-sm text-slate-600">Loading...</p>
            </main>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace/>
    }
    return children
}

export default ProtectedRoute