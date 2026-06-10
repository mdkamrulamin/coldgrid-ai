import { API_BASE_URL } from "../lib/config"

type RequestOptions = {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
    body?: unknown
    token?: string | null
}

// Shared API request helper.
export async function apiRequest<TResponse>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<TResponse> {
    const { method = 'GET', body, token } = options

    // Build request headers. JSON requests need Content-Type.
    // Protected routes also need Authorization.
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    }

    // Add JWT token if this request needs authentication.
    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    // Send the request to the FastAPI backend.
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    })

    // Some responses, like DELETE 204, may not have a JSON body.
    if (response.status == 204) {
        return undefined as TResponse
    }

    // Try to read the response body as JSON.
    const data = await response.json()

     // If backend returned an error, throw it so the page/service can handle it.
    if (!response.ok) {
        const errorMessage = data?.detail ?? 'Something went wrong while calling the API.'

        throw new Error(errorMessage)
    }

    return data as TResponse
}