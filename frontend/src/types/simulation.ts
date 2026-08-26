export type SimulationScenario =
    | 'normal'
    | 'battery_drain'
    | 'temperature_rise'
    | 'low_generation'
    | 'cooling_failure'
    | 'sensor_failure'
    | 'power_spike'

    export type SimulationTimeRange = '1h' | '6h' | '24h' | '7d'

    export type SimulationRunRequest = {
        scenario: SimulationScenario
        readingCount: number
        timeRange: SimulationTimeRange
    }

    export type SimulationRunResponse = {
        deviceUid: string
        scenario: SimulationScenario
        readingCount: number
        timeRange: SimulationTimeRange
        message: string
    }