type PageErrorProps = {
    message: string | null
}

function PageError({ message }: PageErrorProps) {
    if (!message) {
        return null
    }

    return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">
                Something went wrong
            </p>
            <p className="mt-1 text-sm text-red-700">
                {message}
            </p>
        </div>
    )
}

export default PageError