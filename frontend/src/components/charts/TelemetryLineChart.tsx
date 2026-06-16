import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, } from "recharts"

type ChartDataPoint = {
    time: string
    [key: string]: string | number
}

type TelemetryLineChartProps = {
    title: string
    data: ChartDataPoint[]
    dataKeys: string[]
}

//Reusable line chart for telemetry data.
function TelemetryLineChart({title, data, dataKeys}: TelemetryLineChartProps) {
    return (
        <div>
            <h3 className="text-sm font-medium text-slate-700">
                {title}
            </h3>
            <div className="mt-3 h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        {dataKeys.map((dataKey) => (
                            <Line
                                key={dataKey}
                                type="monotone"
                                dataKey={dataKey}
                                strokeWidth={2}
                                dot={false}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default TelemetryLineChart