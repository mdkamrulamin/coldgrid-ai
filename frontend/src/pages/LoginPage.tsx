import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"


import AuthLayout from "../components/layout/AuthLayout"
import Button from "../components/ui/Button"
import FormError from "../components/ui/FormError"
import TextInput from "../components/ui/TextInput"
import { useAuth } from "../lib/AuthContext"


function LoginPage() {
    const navigate = useNavigate()
    const { login } = useAuth()

    //Form field state.
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    //UI state for loading and API errors.
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const handleSubmit: React.ComponentProps<'form'>['onSubmit'] = async (event) => {
        //Prevent normal browser form submission.
        event.preventDefault()
        setIsSubmitting(true)
        setErrorMessage(null)

        try {
            // Call AuthContext login(). This sends POST /auth/login, saves the token, and loads the current user from /auth/me.
            await login({email, password})
            // After successful login, go to dashboard.
            navigate('/dashboard')
        } catch (error) {
            //Show backend error msg if available.
            const message = error instanceof Error ? error.message : 'Unable to log in.'
            setErrorMessage(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AuthLayout
            title="Login"
            description="Access your ColdGrid AI monitoring dashboard."
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormError message={errorMessage} />
                <TextInput label="Email" name="email" type="email" placeholder="you@example.com" value={email}
                onChange={(event) => setEmail(event.target.value)} required />

                <TextInput label="Password" name="password" type="password" placeholder="Enter your password" 
                value={password} onChange={(event) => setPassword(event.target.value)} required />
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Logging in...' : 'Log in'}
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="font-medium text-emerald-700 hover:text-emerald-800">
                    Create one
                </Link>
            </p>
        </AuthLayout>
    )
}

export default LoginPage