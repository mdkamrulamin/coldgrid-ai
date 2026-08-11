import Card from "../ui/Card"
import Skeleton from "../ui/Skeleton"

function AlertsPageSkeleton() {
    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="mt-3 h-8 w-16" />
                </Card>

                <Card>
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="mt-3 h-8 w-16" />
                </Card>

                <Card>
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="mt-3 h-8 w-16" />
                </Card>
            </div>

            <Card>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <Skeleton className="h-6 w-36" />
                        <Skeleton className="mt-3 h-4 w-72" />
                    </div>

                    <div className="flex gap-3">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>

                <div className="mt-6 space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </Card>
        </div>
    )
}

export default AlertsPageSkeleton