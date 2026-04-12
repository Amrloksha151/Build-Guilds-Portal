import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { useAnnouncementsQuery } from '../../hooks/useAnnouncements'

function formatAnnouncementTime(value) {
  if (!value) {
    return 'Coming Soon'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Coming Soon'
  }

  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (diffInSeconds < 5) {
    return 'just now'
  }

  const timeUnits = [
    { label: 'year', seconds: 60 * 60 * 24 * 365 },
    { label: 'month', seconds: 60 * 60 * 24 * 30 },
    { label: 'day', seconds: 60 * 60 * 24 },
    { label: 'hour', seconds: 60 * 60 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ]

  const unit = timeUnits.find((entry) => diffInSeconds >= entry.seconds) || timeUnits[timeUnits.length - 1]
  const valueInUnit = Math.floor(diffInSeconds / unit.seconds)

  return `${valueInUnit} ${unit.label}${valueInUnit === 1 ? '' : 's'} ago`
}

function AnnouncementItem({ announcement }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-blueprint-dark/60 p-4">
      <header className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-blueprint-warning">{announcement.author || 'Unknown organizer'}</p>
        <p className="text-xs text-blueprint-light/80">{formatAnnouncementTime(announcement.time)}</p>
      </header>

      <div className="prose prose-invert prose-sm max-w-none text-white">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
          components={{
            p: ({ children }) => <p className="my-0 whitespace-pre-wrap text-sm leading-relaxed text-white">{children}</p>,
            ul: ({ children }) => <ul className="my-0 list-disc pl-5 text-sm leading-relaxed text-white">{children}</ul>,
            ol: ({ children }) => <ol className="my-0 list-decimal pl-5 text-sm leading-relaxed text-white">{children}</ol>,
            li: ({ children }) => <li className="my-1">{children}</li>,
            a: ({ children, href }) => (
              <a href={href} target="_blank" rel="noreferrer" className="text-blueprint-warning underline underline-offset-2">
                {children}
              </a>
            ),
            code: ({ children }) => <code className="rounded bg-white/10 px-1 py-0.5 text-xs">{children}</code>,
          }}
        >
          {announcement.content || 'No content'}
        </ReactMarkdown>
      </div>
    </article>
  )
}

function AnnouncementsSection() {
  const announcementsQuery = useAnnouncementsQuery()
  const announcements = Array.isArray(announcementsQuery.data) ? announcementsQuery.data : []
  const [latestTenVisible, allVisible] = [announcements.slice(0, 10), announcements]
  const canShowAll = announcements.length > 10
  const [showAll, setShowAll] = useState(false)
  const visibleAnnouncements = showAll ? allVisible : latestTenVisible

  if (announcementsQuery.isPending) {
    return (
      <Card className="p-5">
        <p className="text-sm text-blueprint-light">Loading announcements...</p>
      </Card>
    )
  }

  if (announcementsQuery.isError) {
    return (
      <Card className="border-blueprint-danger/50 p-5">
        <p className="text-sm text-blueprint-danger">Could not load announcements. Please refresh the page.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {canShowAll ? (
        <Card className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-blueprint-light">
              {showAll ? `Showing all ${announcements.length} announcements` : `Showing latest ${visibleAnnouncements.length} announcements`}
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-auto px-3 py-2 text-sm"
              onClick={() => setShowAll((value) => !value)}
            >
              {showAll ? 'Show latest 10' : 'Show all'}
            </Button>
          </div>
        </Card>
      ) : null}

      {visibleAnnouncements.length === 0 ? (
        <Card className="p-5">
          <p className="text-sm text-blueprint-light">No announcements yet.</p>
        </Card>
      ) : (
        <Card className="p-3 sm:p-4">
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {visibleAnnouncements.map((announcement) => (
              <AnnouncementItem key={announcement.id} announcement={announcement} />
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default AnnouncementsSection
