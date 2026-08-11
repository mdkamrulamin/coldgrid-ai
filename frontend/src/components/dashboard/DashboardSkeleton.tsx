import Card from "../ui/Card"
import Skeleton from "../ui/Skeleton"

function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="mt-3 h-8 w-16" />
                </Card>

                <Card>
                    <Skeleton className="h-4 w-36" />
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

            <div className="space-y-4">
                <Card>
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="mt-3 h-4 w-56" />
                            <Skeleton className="mt-4 h-4 w-72" />
                        </div>

                        <Skeleton className="h-7 w-24 rounded-full" />
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                </Card>

                <Card>
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <Skeleton className="h-6 w-44" />
                            <Skeleton className="mt-3 h-4 w-52" />
                            <Skeleton className="mt-4 h-4 w-72" />
                        </div>

                        <Skeleton className="h-7 w-24 rounded-full" />
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default DashboardSkeleton