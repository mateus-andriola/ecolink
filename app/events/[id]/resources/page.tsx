import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ResourceForm from '@/components/ResourceForm'
import ResourceList from '@/components/ResourceList'

export default async function ResourcesPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/login')
  }

  const { id: eventId } = await params

  const event = await prisma.actionEvent.findUnique({
    where: { id: eventId },
    include: {
      resources: {
        orderBy: { name: 'asc' },
      },
      participants: {
        where: { userId: session.user.id },
      },
    },
  })

  if (!event) {
    notFound()
  }

  const userParticipation = event.participants[0]
  const isOrganizer = userParticipation?.role === 'ORGANIZER'

  if (!userParticipation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link href="/" className="text-2xl font-bold text-green-600">
                🌱 Sustentabilidade Comunitária
              </Link>
              <Link href={`/events/${eventId}`} className="text-gray-700 hover:text-green-600 font-medium">
                ← Voltar ao Evento
              </Link>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
            <p className="text-gray-600 mb-6">Você deve ser um participante para visualizar os recursos do evento.</p>
            <Link
              href={`/events/${eventId}`}
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
            >
              Ver Evento
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-bold text-green-600">
              🌱 Sustentabilidade Comunitária
            </Link>
            <Link href={`/events/${eventId}`} className="text-gray-700 hover:text-green-600 font-medium">
              ← Voltar ao Evento
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Recursos do Evento</h1>
              <p className="text-gray-600">Gerencie ferramentas e materiais para este evento</p>
            </div>
            {isOrganizer && (
              <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                Organizador
              </span>
            )}
          </div>

          {/* Add Resource Form - Only for Organizers */}
          {isOrganizer && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Adicionar Novo Recurso</h2>
              <ResourceForm eventId={eventId} />
            </div>
          )}

          {/* Resources List */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Recursos ({event.resources.length})
            </h2>
            {event.resources.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-lg">Nenhum recurso adicionado ainda.</p>
                {isOrganizer && (
                  <p className="text-sm mt-2">Use o formulário acima para adicionar recursos para este evento.</p>
                )}
              </div>
            ) : (
              <ResourceList resources={event.resources} isOrganizer={isOrganizer} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
