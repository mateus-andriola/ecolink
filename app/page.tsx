import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ActionEvent } from '@prisma/client'
import MapClient from '@/components/MapClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'


export default async function Home() {
  const session = await getServerSession(authOptions)
  
  const events = await prisma.actionEvent.findMany({
    orderBy: { date: 'asc' },
    take: 100,
  })

  // Find first event with coordinates for map center
  const eventWithCoords = events.find((e: ActionEvent) => e.latitude !== null && e.longitude !== null)
  const center: [number, number] = eventWithCoords
    ? [eventWithCoords.latitude!, eventWithCoords.longitude!]
    : [-23.5505, -46.6333] // Default to São Paulo
  
  // Filter events with coordinates for map display
  const eventsWithCoords = events.filter(e => e.latitude !== null && e.longitude !== null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-bold text-green-600">
              🌱 Sustentabilidade Comunitária
            </Link>
            <div className="flex gap-4">
              <Link
                href="/events"
                className="text-gray-700 hover:text-green-600 font-medium"
              >
                Eventos
              </Link>
              {session ? (
                <Link
                  href="/dashboard"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Painel
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-gray-700 hover:text-green-600 font-medium"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Cadastrar
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Construindo Comunidades Sustentáveis Juntos
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Organize ações ambientais, coordene voluntários e mea o impacto
            de iniciativas de sustentabilidade em sua comunidade.
          </p>
        </div>

        {eventsWithCoords.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Ações de Sustentabilidade Ativas
              </h2>
              <span className="text-gray-600">{eventsWithCoords.length} eventos no mapa</span>
            </div>
            <MapClient 
              events={eventsWithCoords.map(e => ({ ...e, date: e.date }))} 
              center={center} 
              zoom={10}
              height="600px"
            />
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-2">🌳</div>
            <h3 className="text-xl font-bold mb-2">Plantio de Árvores</h3>
            <p className="text-gray-600">
              Participe de esforços comunitários para plantar árvores e restaurar florestas urbanas.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-2">♻️</div>
            <h3 className="text-xl font-bold mb-2">Coleta de Resíduos</h3>
            <p className="text-gray-600">
              Participe de mutirões de limpeza e iniciativas de reciclagem.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-2">🌿</div>
            <h3 className="text-xl font-bold mb-2">Recuperação de Áreas</h3>
            <p className="text-gray-600">
              Ajude a restaurar e reabilitar áreas naturais degradadas.
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            href="/events"
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-green-700 transition"
          >
            Ver Todos os Eventos
          </Link>
        </div>
      </main>
    </div>
  )
}
