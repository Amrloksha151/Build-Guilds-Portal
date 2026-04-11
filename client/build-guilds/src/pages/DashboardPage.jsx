import { useNavigate } from 'react-router-dom'
import Icon from '@hackclub/icons'
import { useAuth } from '../hooks/useAuthContext'
import { useLogoutMutation } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

function DashboardPage() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const logoutMutation = useLogoutMutation()

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync()
      setUser(null)
      navigate('/login', { replace: true })
    } catch {
      // The mutation exposes the error state if logout fails.
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-blueprint-dark px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-35" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(219,228,238,0.12),transparent_24%),radial-gradient(circle_at_86%_16%,rgba(168,240,174,0.12),transparent_20%),radial-gradient(circle_at_70%_84%,rgba(255,200,87,0.1),transparent_22%)]" aria-hidden="true" />
      <Card className="relative mx-auto w-full max-w-3xl p-6 sm:p-8">
        <div className="mb-4 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blueprint-success text-blueprint-darker">
            <Icon glyph="leaders" size={20} />
          </span>
          <h1>Dashboard</h1>
        </div>
        <p className="mb-6 block text-blueprint-light">
          Logged in as <span className="font-semibold text-white">{user?.username || 'participant'}</span>. Next steps: activities list, check-in controls, and real-time leaderboard widgets.
        </p>

        <Button
          type="button"
          variant="outline"
          className="w-auto px-4 py-2"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
        </Button>
      </Card>
    </main>
  )
}

export default DashboardPage
