import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Icon from '@hackclub/icons'
import AuthShell from '../components/auth/AuthShell'
import { useAuth } from '../hooks/useAuthContext'
import { useLoginMutation } from '../hooks/useAuth'
import { getCurrentUser } from '../lib/api'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

function LoginPage() {
  const navigate = useNavigate()
  const { user, isHydrating, setUser } = useAuth()
  const loginMutation = useLoginMutation()

  const [formValues, setFormValues] = useState({
    username: '',
    password: '',
  })

  const errorMessage = loginMutation.error?.message

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
      const payload = await loginMutation.mutateAsync(formValues)
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
      title="Welcome back"
      subtitle="Sign in to continue tracking your achievements, live activities, and leaderboard progress."
      footer={
        <p className="text-sm text-blueprint-light">
          New participant?{' '}
          <Link className="font-semibold text-blueprint-warning hover:text-white" to="/register">
            Create your account
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login-username" className="mb-2 block text-sm font-semibold tracking-wide text-blueprint-light">
            Username
          </label>
          <Input
            id="login-username"
            name="username"
            autoComplete="username"
            placeholder="Enter your username"
            value={formValues.username}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="login-password" className="mb-2 block text-sm font-semibold tracking-wide text-blueprint-light">
            Password
          </label>
          <Input
            id="login-password"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Enter your password"
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
          disabled={loginMutation.isPending}
        >
          <Icon glyph="door-enter" size={18} />
          {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </AuthShell>
  )
}

export default LoginPage
