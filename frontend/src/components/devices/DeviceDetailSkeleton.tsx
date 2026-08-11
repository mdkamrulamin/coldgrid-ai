import Card from "../ui/Card"
import Skeleton from "../ui/Skeleton"

function DeviceDetailSkeleton() {
    return (
        <div className="space-y-8">
            <Card>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="mt-3 h-4 w-64" />
                        <Skeleton className="mt-4 h-4 w-72" />
                    </div>

                    <Skeleton className="h-7 w-28 rounded-full" />
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            </Card>

            <Card>
                <Skeleton className="h-6 w-36" />
                <Skeleton className="mt-3 h-4 w-72" />
                <Skeleton className="mt-6 h-20 w-full" />
            </Card>

            <Card>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="mt-3 h-4 w-80" />
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </Card>

            <Card>
                <Skeleton className="h-6 w-32" />
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </Card>
        </div>
    )
}

export default DeviceDetailSkeleton