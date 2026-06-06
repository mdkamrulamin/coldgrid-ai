import PageHeader from "../components/layout/PageHeader";
import PageLayout from "../components/layout/PageLayout";

function DashboardPage() {
    return (
        <PageLayout>
            <PageHeader
                title="Dashboard"
                description="Device overview and latest telemetry will be shown here"
            />
        </PageLayout>
    )
}

export default DashboardPage