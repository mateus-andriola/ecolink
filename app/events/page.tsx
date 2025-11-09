import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ClientMap from './components/ClientMap'

export default async function EventsPage() {
  const session = await getServerSession(authOptions)

  const events = await prisma.actionEvent.findMany({
    include: {
      createdBy: true,
      _count: {
        select: { participants: true },
      },
    },
    orderBy: { date: 'asc' },
  })

  type Event = typeof events[number]

  // Find first event with coordinates for map center
  const eventWithCoords = events.find((e: Event) => e.latitude !== null && e.longitude !== null)
  const center: [number, number] = eventWithCoords
    ? [eventWithCoords.latitude!, eventWithCoords.longitude!]
    : [40.7128, -74.0060]
  
  // Filter events with coordinates for map display
  const eventsWithCoords = events.filter((e: Event) => e.latitude !== null && e.longitude !== null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-bold text-green-600">
              🌱 Sustentabilidade Comunitária
            </Link>
            <div className="flex gap-4 items-center">
              {session ? (
                <>
                  <Link href="/dashboard" className="text-gray-700 hover:text-green-600 font-medium">
                    Painel
                  </Link>
                  <span className="text-gray-700">{session.user.name}</span>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-gray-700 hover:text-green-600 font-medium">
                    Entrar
                  </Link>
                  <Link href="/auth/register" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    Cadastrar
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Eventos de Sustentabilidade</h1>
            <p className="text-gray-600">Participe ou crie ações ambientais em sua comunidade</p>
          </div>
          {session && (
            <Link
              href="/events/create"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
            >
              + Criar Evento
            </Link>
          )}
        </div>

        {/* Map View */}
        {eventsWithCoords.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Visualização no Mapa</h2>
            <ClientMap
              events={eventsWithCoords.map((e: Event) => ({ ...e, date: e.date }))}
              center={center}
              zoom={10}
              height="500px"
            />
          </div>
        )}

        {/* List View */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Todos os Eventos ({events.length})</h2>
          {events.length === 0 ? (
            <p className="text-gray-600 text-center py-8">Nenhum evento encontrado. Seja o primeiro a criar um!</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {events.map((event: Event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="border border-gray-200 rounded-lg p-6 hover:border-green-500 hover:shadow-md transition"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-700">
                      <span className="mr-2">📍</span>
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="mr-2">📅</span>
                      <span>{new Date(event.date).toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="mr-2">👥</span>
                      <span>{event._count.participants} participantes</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Organizado por {event.createdBy.name}
                    </p>
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
