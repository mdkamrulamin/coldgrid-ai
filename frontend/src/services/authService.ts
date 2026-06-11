import { apiRequest } from "./apiClient"
import type { AuthToken, LoginRequest, RegisterRequest, User, } from "../types/auth"

// Register a new user using POST /auth/register.
export function registerUser(payload: RegisterRequest) {
    return apiRequest<User>('/auth/register', {
        method: 'POST',
        body: payload,
    })
}

// Log in a user using POST /auth/login.
export function loginUser(payload: LoginRequest) {
    return apiRequest<AuthToken>('/auth/login', {
        method: 'POST',
        body: payload,
    })
}

// Fetch the currently logged-in user using GET /auth/me.
export function getCurrentUser(token: string) {
    return apiRequest<User>('/auth/me', {
        method: 'GET',
        token,
    })
}