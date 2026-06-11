const AUTH_TOKEN_KEY = 'coldgrid_access_token'      // Key used to store the JWT access token in localStorage.

// Save the JWT access token after successful login.
export function saveAuthToken(token: string) {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
}

// Read the saved JWT access token.
export function getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY)
}

// Remove the JWT token during logout.
export function clearAuthToken() {
    localStorage.removeItem(AUTH_TOKEN_KEY)
}