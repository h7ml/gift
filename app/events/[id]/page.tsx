import { EventDetailPage } from '@/components/event-detail-page'

interface EventPageProps {
  params: Promise<{ id: string }>
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params

  return <EventDetailPage eventId={id} />
}
