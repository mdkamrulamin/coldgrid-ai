import { Link } from 'react-router-dom'

function NotFoundPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 p-8">
            <section className="max-w-md rouded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <p className="text-sm font-medium text-red-600">
                    404
                </p>
                <h1 className="mt-3 text-2xl font-bold text-slate-900">
                    Page not found
                </h1>
                <p className="mt-2 text-sm text-slate-900">
                    The page you are lookin for does not exist.
                </p>
                <Link
                    to="/dashboard"
                    className="mt-6 inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                        Go to dashboard
                    </Link>
            </section>
        </main>
    )
}

export default NotFoundPage