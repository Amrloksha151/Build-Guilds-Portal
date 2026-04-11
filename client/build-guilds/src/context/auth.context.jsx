import { createContext } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getCurrentUser } from '../lib/api'

const AuthContext = createContext(null)

/**
 * @param {{ children: import('react').ReactNode }} props
 */
export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const currentUserQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getCurrentUser,
    retry: false,
    refetchOnWindowFocus: false,
  })

  const user = currentUserQuery.data?.user || null

  function setUser(nextUser) {
    queryClient.setQueryData(['auth', 'me'], nextUser ? { user: nextUser } : null)
  }

  const value = {
    user,
    setUser,
    isHydrating: currentUserQuery.isPending,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
