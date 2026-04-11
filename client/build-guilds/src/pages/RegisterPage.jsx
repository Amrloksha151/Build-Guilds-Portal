import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Icon from '@hackclub/icons'
import AuthShell from '../components/auth/AuthShell'
import { useAuth } from '../hooks/useAuthContext'
import { useRegisterMutation } from '../hooks/useAuth'
import { getCurrentUser } from '../lib/api'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

function RegisterPage() {
  const navigate = useNavigate()
  const { user, isHydrating, setUser } = useAuth()
  const registerMutation = useRegisterMutation()

  const [formValues, setFormValues] = useState({
    username: '',
    password: '',
  })

  const errorMessage = registerMutation.error?.message

  if (!isHydrating && user) {
    return <Navigate to="/dashboard" replace />
  }

  /**
   * @param {React.ChangeEvent<HTMLInputElement>} event
   */
  function handleChange(event) {
    const { name, value } = event.target
    setFormValues((current) => ({ ...current, [name]: value }))
  }

  /**
   * @param {React.FormEvent<HTMLFormElement>} event
   */
  async function handleSubmit(event) {
    event.preventDefault()

    try {
      const payload = await registerMutation.mutateAsync(formValues)
      setUser(payload.user)
      navigate('/dashboard')
    } catch {
      try {
        const me = await getCurrentUser()

        if (me?.user) {
          setUser(me.user)
          navigate('/dashboard')
        }
      } catch {
        // Keep mutation error visible when auth was not actually established.
      }
    }
  }

  return (
    <AuthShell
      title="Create account"
      subtitle="Register once, then join live check-ins and climb the Build Guild leaderboard."
      footer={
        <p className="text-sm text-blueprint-light">
          Already have an account?{' '}
          <Link className="font-semibold text-blueprint-success hover:text-white" to="/login">
            Sign in instead
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="register-username" className="mb-2 block text-sm font-semibold tracking-wide text-blueprint-light">
            Username
          </label>
          <Input
            id="register-username"
            name="username"
            autoComplete="username"
            placeholder="Choose a username"
            value={formValues.username}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="register-password" className="mb-2 block text-sm font-semibold tracking-wide text-blueprint-light">
            Password
          </label>
          <Input
            id="register-password"
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="Create a password"
            value={formValues.password}
            onChange={handleChange}
            required
          />
        </div>

        {errorMessage ? (
          <div className="rounded-xl border border-blueprint-danger/60 bg-blueprint-danger/15 px-3 py-2 text-sm font-medium text-blueprint-danger">
            {errorMessage}
          </div>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          disabled={registerMutation.isPending}
        >
          <Icon glyph="add-user" size={18} />
          {registerMutation.isPending ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
    </AuthShell>
  )
}

export default RegisterPage
