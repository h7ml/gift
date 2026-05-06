import { EventDetailPage } from '@/components/event-detail-page'

interface EventRecordsPageProps {
  params: Promise<{ id: string }>
}

export default async function EventRecordsPage({
  params,
}: EventRecordsPageProps) {
  const { id } = await params

  return <EventDetailPage eventId={id} section="records" />
}
