import { createContext, useContext, useEffect, useState, type ReactNode, } from "react"

import { getCurrentUser, loginUser, registerUser } from "../services/authService"
import type { LoginRequest, RegisterRequest, User } from "../types/auth"
import { clearAuthToken, getAuthToken, saveAuthToken } from "./authStorage"

type AuthContextValue = {
    user: User | null
    token: string | null
    isLoading: boolean
    login: (payload: LoginRequest) => Promise<void>
    register: (payload: RegisterRequest) => Promise<void>
    logout: () => void
}

type AuthProviderProps = {
    children: ReactNode
}

// React Context stores authentication state globally.
// This lets any page know whether the user is logged in.
const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(() => getAuthToken())
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadCurrentUser() {
            // If there is no saved token, the user is not logged in.
            if (!token) {
                setIsLoading(false)
                return
            }
            try {
                // Validate the saved token by asking the backend for /auth/me.
                const currentUser = await getCurrentUser(token)
                setUser(currentUser)
            } catch {
                // If the token is expired or invalid, remove it.
                clearAuthState()
            } finally {
                setIsLoading(false)
            }
        }
        loadCurrentUser()
    }, [token])

    async function login(payload: LoginRequest) {
        const authToken = await loginUser(payload)      // Send login request 
        // Save token in localStorage so refresh does not log user out.
        saveAuthToken(authToken.access_token)
        setToken(authToken.access_token)
        const currentUser = await getCurrentUser(authToken.access_token)    // Fetch logged-in user details after login.
        setUser(currentUser)
    }

    async function register(payload: RegisterRequest) {
        await registerUser(payload)     // Create the account first.
        // After successful registration, log in automatically.
        await login({
            email: payload.email,
            password: payload.password,
        })
    }

    function clearAuthState() {
        clearAuthToken()
        setToken(null)
        setUser(null)
    }

    function logout() {
        clearAuthState()
    }

    return (
        <AuthContext.Provider
            value={{
                user, token, isLoading, login, register, logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

// Custom hook so components can easily access auth state.
export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider')
    }
    return context
}