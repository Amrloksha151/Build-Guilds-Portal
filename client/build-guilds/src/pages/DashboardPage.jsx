import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '@hackclub/icons'
import { useAuth } from '../hooks/useAuthContext'
import { useLogoutMutation } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import AnnouncementsSection from '../components/sections/AnnouncementsSection'
import CreateAnnouncementSection from '../components/sections/CreateAnnouncementSection'

function DashboardPage() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const logoutMutation = useLogoutMutation()
  const canCreateAnnouncement = user?.role === 'organizer' || user?.role === 'admin'
  const tabs = useMemo(
    () => [
      {
        key: 'announcements',
        label: 'Announcements',
        icon: 'announcement',
        description: 'Latest updates and event notices',
      },
      ...(canCreateAnnouncement
        ? [
            {
              key: 'create',
              label: 'Create Announcement',
              icon: 'edit',
              description: 'Write and publish a markdown update',
            },
          ]
        : []),
    ],
    [canCreateAnnouncement],
  )
  const [activeTab, setActiveTab] = useState('announcements')

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync()
      setUser(null)
      navigate('/login', { replace: true })
    } catch {
      // The mutation exposes the error state if logout fails.
    }
  }

  const activeTabConfig = tabs.find((tab) => tab.key === activeTab) || tabs[0]

  return (
    <main className="relative min-h-screen overflow-hidden bg-blueprint-dark px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-35" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(219,228,238,0.12),transparent_24%),radial-gradient(circle_at_86%_16%,rgba(168,240,174,0.12),transparent_20%),radial-gradient(circle_at_70%_84%,rgba(255,200,87,0.1),transparent_22%)]" aria-hidden="true" />
      <div className="relative mx-auto grid w-full max-w-7xl gap-4 lg:h-[calc(100vh-5rem)] lg:grid-cols-[320px_minmax(0,1fr)] xl:h-[calc(100vh-6rem)]">
        <Card className="p-4 sm:p-5 lg:flex lg:h-full lg:flex-col lg:overflow-hidden">
          <div className="mb-5 border-b border-dashed border-white/15 pb-4">
            <h1 className="text-3xl sm:text-4xl">Dashboard</h1>
            <p className="mt-2 text-sm text-blueprint-light">
              Signed in as <span className="font-semibold text-white">{user?.username || 'participant'}</span>
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-blueprint-warning">Role: {user?.role || 'participant'}</p>
          </div>

          <nav className="space-y-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto" aria-label="Dashboard sections">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={[
                  'w-full rounded-xl border px-3 py-3 text-left transition',
                  activeTab === tab.key
                    ? 'border-blueprint-warning/70 bg-blueprint-warning/15 text-blueprint-warning'
                    : 'border-white/15 bg-blueprint-dark/40 text-blueprint-light hover:border-white/30 hover:text-white',
                ].join(' ')}
              >
                <span className="mb-1 inline-flex items-center gap-2 text-sm font-semibold">
                  <Icon glyph={tab.icon} size={16} />
                  {tab.label}
                </span>
                <span className="block text-xs">{tab.description}</span>
              </button>
            ))}
          </nav>

          <div className="mt-6 border-t border-dashed border-white/15 pt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full px-4 py-2"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <Icon glyph="door-enter" size={16} />
              {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
            </Button>
          </div>
        </Card>

        <section className="space-y-4 lg:flex lg:h-full lg:min-h-0 lg:flex-col">
          <Card className="p-5 lg:shrink-0">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blueprint-warning text-blueprint-darker">
                <Icon glyph={activeTabConfig?.icon || 'announcement'} size={18} />
              </span>
              <div>
                <h2 className="text-white">{activeTabConfig?.label || 'Announcements'}</h2>
                <p className="mt-1 text-sm text-blueprint-light">{activeTabConfig?.description}</p>
              </div>
            </div>
          </Card>

          <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            {activeTab === 'create' ? (
              <CreateAnnouncementSection role={user?.role} />
            ) : (
              <AnnouncementsSection />
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default DashboardPage
