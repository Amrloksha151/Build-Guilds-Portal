import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAnnouncement, getAnnouncements } from '../lib/api'

export function useAnnouncementsQuery() {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: getAnnouncements,
    refetchOnWindowFocus: false,
  })
}

export function useCreateAnnouncementMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
    },
  })
}
