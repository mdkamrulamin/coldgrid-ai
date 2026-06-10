export type RegisterRequest = {
    name: string
    email: string
    password: string
}           // Request body for POST /auth/register.

export type LoginRequest = {
    email: string
    password: string
}           // Request body for POST /auth/login.

export type AuthToken = {
    access_token: string
    token_type: string
}           // Response body from POST /auth/login.

export type User = {
    id: number
    name: string
    email: string
    created_at: string
}           // Safe user object returned by the backend.