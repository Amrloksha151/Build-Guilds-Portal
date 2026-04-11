import { Navigate } from 'react-router-dom'
import Card from '../ui/Card'
import { useAuth } from '../../hooks/useAuthContext'

/**
 * @param {{ children: import('react').ReactNode }} props
 */
function ProtectedRoute({ children }) {
  const { user, isHydrating } = useAuth()

  if (isHydrating) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-blueprint-dark px-4 text-white">
        <Card className="w-full max-w-md p-6">
          <div className="space-y-2">
            <h2 className="text-white">Checking your session</h2>
            <p className="block text-sm leading-6 text-blueprint-light">
              Loading the current Build Guild session before we open the dashboard.
            </p>
          </div>
        </Card>
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute