import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

const translateRole = (role: string) => {
  const roleMap: Record<string, string> = {
    'ORGANIZER': 'Organizador',
    'PARTNER': 'Parceiro',
    'VOLUNTEER': 'Voluntário'
  }
  return roleMap[role] || role
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/login')
  }

  const [createdEvents, participatedEvents, totalParticipants] = await Promise.all([
    prisma.actionEvent.findMany({
      where: { createdById: session.user.id },
      include: {
        participants: true,
        _count: {
          select: { participants: true },
        },
      },
      orderBy: { date: 'desc' },
    }),
    prisma.userEventRole.findMany({
      where: { userId: session.user.id },
      include: {
        event: {
          include: {
            createdBy: true,
            _count: {
              select: { participants: true },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    }),
    prisma.userEventRole.count({
      where: { userId: session.user.id },
    }),
  ])

  type CreatedEvent = typeof createdEvents[number]
  type ParticipatedEvent = typeof participatedEvents[number]

  const volunteerCount = participatedEvents.filter((p: ParticipatedEvent) => p.role === 'VOLUNTEER').length
  const organizerCount = participatedEvents.filter((p: ParticipatedEvent) => p.role === 'ORGANIZER').length

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
                Eventos
              </Link>
              <span className="text-gray-700">{session.user.name}</span>
              <Link
                href="/api/auth/signout"
                className="text-red-600 hover:text-red-700 font-medium"
              >
                Sair
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Bem-vindo, {session.user.name}!
          </h1>
          <p className="text-gray-600">Aqui está seu painel de impacto em sustentabilidade</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-green-600">{totalParticipants}</div>
            <div className="text-gray-600 mt-1">Total de Eventos</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-blue-600">{organizerCount}</div>
            <div className="text-gray-600 mt-1">Como Organizador</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-purple-600">{volunteerCount}</div>
            <div className="text-gray-600 mt-1">Como Voluntário</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-orange-600">{createdEvents.length}</div>
            <div className="text-gray-600 mt-1">Eventos Criados</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Ações Rápidas</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/events?action=create"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
            >
              + Criar Novo Evento
            </Link>
            <Link
              href="/events"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Explorar Eventos
            </Link>
          </div>
        </div>

        {/* Created Events */}
        {createdEvents.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Eventos que Você Criou</h2>
            <div className="space-y-4">
              {createdEvents.map((event: CreatedEvent) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:border-green-500 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{event.location}</p>
                      <p className="text-gray-500 text-sm mt-1">
                        {new Date(event.date).toLocaleDateString('pt-BR')} •{' '}
                        {event._count.participants} participantes
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Organizador
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Participated Events */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Seus Eventos Participados</h2>
          {participatedEvents.length === 0 ? (
            <p className="text-gray-600">Você ainda não participou de nenhum evento.</p>
          ) : (
            <div className="space-y-4">
              {participatedEvents.map((participation: ParticipatedEvent) => (
                <Link
                  key={participation.id}
                  href={`/events/${participation.event.id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:border-green-500 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {participation.event.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {participation.event.location}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        {new Date(participation.event.date).toLocaleDateString('pt-BR')} •{' '}
                        {participation.event._count.participants} participantes
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        participation.role === 'ORGANIZER'
                          ? 'bg-green-100 text-green-800'
                          : participation.role === 'PARTNER'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {translateRole(participation.role)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
