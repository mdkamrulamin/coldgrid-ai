import { useParams } from "react-router-dom";

import PageHeader from "../components/layout/PageHeader";
import PageLayout from "../components/layout/PageLayout";

function DevicesDetailPage() {
  // Read the deviceId value from the route:
  // /devices/:deviceId

  const { deviceId } = useParams()

    return (
        <PageLayout>
            <PageHeader
                title="Device Detail"
                description="Current telemetry, recent recods and charts will be shown here"
            />

            <div className="mt-6 rounded-xl border boreder-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Selected device ID</p>
                <p className="mt-1 font-mono text-slate-900">{deviceId}</p>
            </div>
        </PageLayout>
    )
}

export default DevicesDetailPage