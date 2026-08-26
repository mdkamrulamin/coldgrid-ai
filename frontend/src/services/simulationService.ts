import { apiRequest } from "./apiClient"
import type { SimulationRunRequest, SimulationRunResponse } from "../types/simulation"

export function runDeviceSimulation( deviceUid: string, token: string, simulationData: SimulationRunRequest ) {
    return apiRequest<SimulationRunResponse>(
        `/devices/${deviceUid}/simulations/run`,
        {
            method: 'POST',
            token,
            body: simulationData,
        }
    )
}