import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"


import AuthLayout from "../components/layout/AuthLayout"
import Button from "../components/ui/Button"
import FormError from "../components/ui/FormError"
import TextInput from "../components/ui/TextInput"
import { useAuth } from "../lib/AuthContext"

function RegisterPage() {
    const navigate = useNavigate()
    const { register } = useAuth()

    //Form field state.
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    //UI state for loading and API errors.
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const handleSubmit: React.ComponentProps<'form'>['onSubmit'] = async (event) => {
        event.preventDefault()
        setIsSubmitting(true)
        setErrorMessage(null)

        try {
            await register({name, email, password})
            navigate('/dashboard')
        } catch (error) {
            //Show backend error msg if available.
            const message = error instanceof Error ? error.message : 'Unable to register.'
            setErrorMessage(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AuthLayout
            title="Create account"
            description="Set up your ColdGrid AI monitoring account."
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormError message={errorMessage} />
                <TextInput label="Full name" name="name" type="text" placeholder="John Smith" 
                value={name} onChange={(event) => setName(event.target.value)} required />
                <TextInput label="Email" name="email" type="email" placeholder="you@example.com" value={email}
                onChange={(event) => setEmail(event.target.value)} required />

                <TextInput label="Password" name="password" type="password" placeholder="Minimum 8 characters" 
                value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating account...' : 'Create account'}
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-emerald-700 hover:text-emerald-800">
                    Log in
                </Link>
            </p> 
        </AuthLayout>
    )
}

export default RegisterPage