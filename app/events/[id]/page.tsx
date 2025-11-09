import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import JoinEventButton from '@/components/JoinEventButton'
import LeaveEventButton from '@/components/LeaveEventButton'

import Map from '@/components/ClientMap'

const translateRole = (role: string) => {
  const roleMap: Record<string, string> = {
    'ORGANIZER': 'Organizador',
    'PARTNER': 'Parceiro',
    'VOLUNTEER': 'Voluntário'
  }
  return roleMap[role] || role
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  const { id } = await params

  const event = await prisma.actionEvent.findUnique({
    where: { id },
    include: {
      createdBy: true,
      participants: {
        include: {
          user: true,
        },
        orderBy: { joinedAt: 'asc' },
      },
      resources: true,
      surveyResponses: {
        include: {
          user: true,
        },
      },
    },
  })

  if (!event) {
    notFound()
  }

  type Participant = typeof event.participants[number]

  const userParticipation = session?.user
    ? event.participants.find((p: Participant) => p.userId === session.user.id)
    : null

  const isOrganizer = userParticipation?.role === 'ORGANIZER'

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-bold text-green-600">
              🌱 Sustentabilidade Comunitária
            </Link>
            <div className="flex gap-4 items-center">
              <Link href="/events" className="text-gray-700 hover:text-green-600 font-medium">
                Todos os Eventos
              </Link>
              {session && (
                <Link href="/dashboard" className="text-gray-700 hover:text-green-600 font-medium">
                  Painel
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Event Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{event.title}</h1>
              <p className="text-gray-600">Organizado por {event.createdBy.name}</p>
            </div>
            {userParticipation && (
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  userParticipation.role === 'ORGANIZER'
                    ? 'bg-green-100 text-green-800'
                    : userParticipation.role === 'PARTNER'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
                {translateRole(userParticipation.role)}
              </span>
            )}
          </div>

          <p className="text-gray-700 mb-6 whitespace-pre-wrap">{event.description}</p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center text-gray-700">
              <span className="mr-3 text-2xl">📅</span>
              <div>
                <div className="font-medium">Data e Hora</div>
                <div className="text-sm">
                  {new Date(event.date).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center text-gray-700">
              <span className="mr-3 text-2xl">📍</span>
              <div>
                <div className="font-medium">Localização</div>
                <div className="text-sm">{event.location}</div>
              </div>
            </div>
            <div className="flex items-center text-gray-700">
              <span className="mr-3 text-2xl">👥</span>
              <div>
                <div className="font-medium">Participantes</div>
                <div className="text-sm">{event.participants.length} pessoas participando</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
            {!session ? (
              <Link
                href="/auth/login"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
              >
                Entrar para Participar
              </Link>
            ) : userParticipation ? (
              <>
                <LeaveEventButton eventId={event.id} />
                <Link
                  href={`/events/${event.id}/surveys`}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Responder Pesquisa
                </Link>
              </>
            ) : (
              <JoinEventButton eventId={event.id} />
            )}
            {isOrganizer && (
              <>
                <Link
                  href={`/events/${event.id}/impact`}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-medium"
                >
                  Atualizar Métricas de Impacto
                </Link>
                <Link
                  href={`/events/${event.id}/resources`}
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-medium"
                >
                  Gerenciar Recursos
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Map */}
        {event.latitude !== null && event.longitude !== null && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Localização</h2>
            <Map
              events={[{ ...event, date: event.date }]}
              center={[event.latitude, event.longitude]}
              zoom={13}
              height="400px"
            />
          </div>
        )}

        {/* Impact Metrics */}
        {(event.collectedWasteKg || event.plantedTrees || event.areaRecoveredM2) && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Impacto Ambiental</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {event.collectedWasteKg && event.collectedWasteKg > 0 && (
                <div className="text-center">
                  <div className="text-4xl mb-2">♻️</div>
                  <div className="text-3xl font-bold text-green-600">{event.collectedWasteKg} kg</div>
                  <div className="text-gray-600">Resíduos Coletados</div>
                </div>
              )}
              {event.plantedTrees && event.plantedTrees > 0 && (
                <div className="text-center">
                  <div className="text-4xl mb-2">🌳</div>
                  <div className="text-3xl font-bold text-green-600">{event.plantedTrees}</div>
                  <div className="text-gray-600">Árvores Plantadas</div>
                </div>
              )}
              {event.areaRecoveredM2 && event.areaRecoveredM2 > 0 && (
                <div className="text-center">
                  <div className="text-4xl mb-2">🌿</div>
                  <div className="text-3xl font-bold text-green-600">{event.areaRecoveredM2} m²</div>
                  <div className="text-gray-600">Área Recuperada</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Participants */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Participantes ({event.participants.length})</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {event.participants.map((participant: Participant) => (
              <div key={participant.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">{participant.user.name}</div>
                    <div className="text-sm text-gray-500">{participant.user.email}</div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      participant.role === 'ORGANIZER'
                        ? 'bg-green-100 text-green-800'
                        : participant.role === 'PARTNER'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {translateRole(participant.role)}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Entrou em {new Date(participant.joinedAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
