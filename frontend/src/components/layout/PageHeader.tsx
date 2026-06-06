type PageHeaderProps = {
    title: string
    description: string
}

// Reusable page heading used across dashboard pages.
function PageHeader({ title, description }: PageHeaderProps) {
    return (
        <header>
            <p className="text-sm font-medium text-emerald-600">
                ColdGrid AI
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">
                {title}
            </h1>
            <p className="mt-2 text-slate-600">
                {description}
            </p>
        </header>

    )
}

export default PageHeader