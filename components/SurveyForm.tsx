'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitSurvey } from '@/app/actions/surveys'

const PRE_QUESTIONS = [
  {
    id: 'motivation',
    question: 'O que motiva você a participar deste evento de sustentabilidade?',
    type: 'textarea',
  },
  {
    id: 'expectations',
    question: 'O que você espera alcançar ou aprender com este evento?',
    type: 'textarea',
  },
  {
    id: 'experience_level',
    question: 'Como você avalia sua experiência prévia com atividades ambientais?',
    type: 'rating',
    options: ['Sem experiência', 'Iniciante', 'Intermediário', 'Experiente', 'Especialista'],
  },
]

const POST_QUESTIONS = [
  {
    id: 'experience',
    question: 'Como foi sua experiência geral no evento?',
    type: 'rating',
    options: ['Ruim', 'Regular', 'Bom', 'Muito Bom', 'Excelente'],
  },
  {
    id: 'learned',
    question: 'O que você aprendeu ou absorveu deste evento?',
    type: 'textarea',
  },
  {
    id: 'improvements',
    question: 'O que poderia ser melhorado para eventos futuros?',
    type: 'textarea',
  },
  {
    id: 'participation_again',
    question: 'Você participaria de eventos semelhantes novamente?',
    type: 'rating',
    options: ['Definitivamente não', 'Provavelmente não', 'Talvez', 'Provavelmente', 'Definitivamente'],
  },
]

export default function SurveyForm({
  eventId,
  phase,
}: {
  eventId: string
  phase: 'PRE_INTERVENTION' | 'POST_INTERVENTION'
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const questions = phase === 'PRE_INTERVENTION' ? PRE_QUESTIONS : POST_QUESTIONS

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate all questions answered
    const unanswered = questions.find((q) => !answers[q.id])
    if (unanswered) {
      setError('Por favor, responda todas as perguntas')
      setLoading(false)
      return
    }

    const result = await submitSurvey({
      eventId,
      phase,
      answers,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  const handleChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {questions.map((question, index) => (
        <div key={question.id} className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">
            {index + 1}. {question.question} *
          </label>

          {question.type === 'textarea' ? (
            <textarea
              value={answers[question.id] || ''}
              onChange={(e) => handleChange(question.id, e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              placeholder="Sua resposta..."
            />
          ) : (
            <div className="space-y-2">
              {question.options?.map((option) => (
                <label key={option} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={(e) => handleChange(question.id, e.target.value)}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
      >
        {loading ? 'Enviando...' : 'Enviar Pesquisa'}
      </button>
    </form>
  )
}
