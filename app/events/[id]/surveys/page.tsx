import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import SurveyForm from '@/components/SurveyForm'

export default async function SurveysPage({ params }: { params: Promise<{ id: string }> }) {
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
      surveyResponses: {
        where: { userId: session.user.id },
      },
    },
  })

  if (!event) {
    notFound()
  }

  const userParticipation = event.participants[0]

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
            <p className="text-gray-600 mb-6">Você deve ser um participante para responder pesquisas do evento.</p>
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

  type SurveyResponse = typeof event.surveyResponses[number]

  const preSubmission = event.surveyResponses.find((s: SurveyResponse) => s.phase === 'PRE_INTERVENTION')
  const postSubmission = event.surveyResponses.find((s: SurveyResponse) => s.phase === 'POST_INTERVENTION')

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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Pesquisas do Evento</h1>
          <p className="text-gray-600">Ajude-nos a medir o impacto desta ação de sustentabilidade</p>
        </div>

        {/* Pre-Intervention Survey */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Pesquisa Pré-Evento</h2>
              <p className="text-gray-600 mt-1">Complete antes do início do evento</p>
            </div>
            {preSubmission && (
              <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                ✓ Enviada
              </span>
            )}
          </div>

          {preSubmission ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="text-green-800 font-medium mb-2">Obrigado por completar a pesquisa pré-evento!</p>
              <p className="text-green-700 text-sm">
                Enviada em {new Date(preSubmission.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          ) : (
            <SurveyForm eventId={eventId} phase="PRE_INTERVENTION" />
          )}
        </div>

        {/* Post-Intervention Survey */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Pesquisa Pós-Evento</h2>
              <p className="text-gray-600 mt-1">Complete após o término do evento</p>
            </div>
            {postSubmission && (
              <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                ✓ Enviada
              </span>
            )}
          </div>

          {postSubmission ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="text-green-800 font-medium mb-2">Obrigado por completar a pesquisa pós-evento!</p>
              <p className="text-green-700 text-sm">
                Enviada em {new Date(postSubmission.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          ) : (
            <SurveyForm eventId={eventId} phase="POST_INTERVENTION" />
          )}
        </div>
      </main>
    </div>
  )
}
