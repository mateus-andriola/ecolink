import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ImpactForm from '@/components/ImpactForm'

export default async function ImpactPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/login')
  }

  const { id: eventId } = await params

  const event = await prisma.actionEvent.findUnique({
    where: { id: eventId },
    include: {
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

  if (!isOrganizer) {
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
            <p className="text-gray-600 mb-6">Apenas organizadores do evento podem atualizar as métricas de impacto.</p>
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Atualizar Métricas de Impacto</h1>
          <p className="text-gray-600">Registre o impacto ambiental alcançado durante este evento</p>
        </div>

        {/* Current Metrics Display */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Métricas Atuais</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="text-4xl mb-2">♻️</div>
              <div className="text-3xl font-bold text-green-600">
                {event.collectedWasteKg || 0} kg
              </div>
              <div className="text-gray-600 mt-1">Resíduos Coletados</div>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="text-4xl mb-2">🌳</div>
              <div className="text-3xl font-bold text-green-600">
                {event.plantedTrees || 0}
              </div>
              <div className="text-gray-600 mt-1">Árvores Plantadas</div>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="text-4xl mb-2">🌿</div>
              <div className="text-3xl font-bold text-green-600">
                {event.areaRecoveredM2 || 0} m²
              </div>
              <div className="text-gray-600 mt-1">Área Recuperada</div>
            </div>
          </div>
        </div>

        {/* Update Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Atualizar Métricas</h2>
          <ImpactForm
            eventId={eventId}
            currentMetrics={{
              collectedWasteKg: event.collectedWasteKg || 0,
              plantedTrees: event.plantedTrees || 0,
              areaRecoveredM2: event.areaRecoveredM2 || 0,
            }}
          />
        </div>

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="font-bold text-blue-900 mb-2">📊 Dicas para Medição de Impacto</h3>
          <ul className="text-blue-800 text-sm space-y-1 list-disc list-inside">
            <li>Registre as métricas imediatamente após o evento enquanto os dados estão frescos</li>
            <li>Use medidas precisas quando possível (balanças, ferramentas de medição)</li>
            <li>Atualize as métricas conforme você coleta mais dados ao longo do tempo</li>
            <li>Essas métricas ajudam a demonstrar o impacto ambiental positivo</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
