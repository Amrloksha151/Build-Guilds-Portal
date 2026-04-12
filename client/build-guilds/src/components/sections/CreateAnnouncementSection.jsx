import { useMemo, useState } from 'react'
import Button from '../ui/Button'
import Card from '../ui/Card'
import { useCreateAnnouncementMutation } from '../../hooks/useAnnouncements'

/**
 * @param {{ role?: string }} props
 */
function CreateAnnouncementSection({ role }) {
  const canCreate = useMemo(() => role === 'organizer' || role === 'admin', [role])
  const createAnnouncementMutation = useCreateAnnouncementMutation()
  const [content, setContent] = useState('')
  const [feedback, setFeedback] = useState(null)

  if (!canCreate) {
    return (
      <Card className="p-5">
        <p className="text-sm text-blueprint-light">Only organizers and admins can create announcements.</p>
      </Card>
    )
  }

  async function onSubmit(event) {
    event.preventDefault()
    const trimmed = content.trim()

    if (!trimmed) {
      setFeedback({ type: 'error', text: 'Announcement content is required.' })
      return
    }

    if (trimmed.length > 5000) {
      setFeedback({ type: 'error', text: 'Content must not exceed 5000 characters.' })
      return
    }

    try {
      await createAnnouncementMutation.mutateAsync({ content: trimmed })
      setContent('')
      setFeedback({ type: 'success', text: 'Announcement created successfully.' })
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error?.message || 'Failed to create announcement.',
      })
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm text-blueprint-light" htmlFor="announcement-content">
            Content
          </label>
          <textarea
            id="announcement-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={5000}
            placeholder="## Important update&#10;&#10;Please gather in the main hall at 5:00 PM."
            className="min-h-[180px] w-full resize-y rounded-xl border border-white/15 bg-blueprint-dark px-4 py-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-blueprint-warning focus:ring-2 focus:ring-blueprint-warning/30"
            disabled={createAnnouncementMutation.isPending}
          />

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-blueprint-light/80">{content.length}/5000</p>
            <Button
              type="submit"
              variant="primary"
              className="w-auto px-4 py-2"
              disabled={createAnnouncementMutation.isPending}
            >
              {createAnnouncementMutation.isPending ? 'Publishing...' : 'Publish announcement'}
            </Button>
          </div>
        </form>

        {feedback ? (
          <p
            className={[
              'mt-4 text-sm',
              feedback.type === 'success' ? 'text-blueprint-success' : 'text-blueprint-danger',
            ].join(' ')}
          >
            {feedback.text}
          </p>
        ) : null}
      </Card>
    </div>
  )
}

export default CreateAnnouncementSection
