import { EventDetailPage } from '@/components/event-detail-page'

interface EventNotesPageProps {
  params: Promise<{ id: string }>
}

export default async function EventNotesPage({ params }: EventNotesPageProps) {
  const { id } = await params

  return <EventDetailPage eventId={id} section="notes" />
}
